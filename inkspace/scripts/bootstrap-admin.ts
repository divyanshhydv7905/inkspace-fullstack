import { PrismaClient, UserRole, AccountStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

const BootstrapEnvSchema = z.object({
  INITIAL_ADMIN_EMAIL: z.string().email("INITIAL_ADMIN_EMAIL must be a valid email address."),
  INITIAL_ADMIN_PASSWORD: z
    .string()
    .min(12, "INITIAL_ADMIN_PASSWORD must be at least 12 characters long.")
    .regex(/[A-Z]/, "INITIAL_ADMIN_PASSWORD must contain at least one uppercase letter.")
    .regex(/[a-z]/, "INITIAL_ADMIN_PASSWORD must contain at least one lowercase letter.")
    .regex(/[0-9]/, "INITIAL_ADMIN_PASSWORD must contain at least one digit."),
});

async function bootstrapAdmin() {
  const parsed = BootstrapEnvSchema.safeParse({
    INITIAL_ADMIN_EMAIL: process.env.INITIAL_ADMIN_EMAIL,
    INITIAL_ADMIN_PASSWORD: process.env.INITIAL_ADMIN_PASSWORD,
  });

  if (!parsed.success) {
    console.error("Administrator bootstrap validation failed:");
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.message}`);
    }
    console.error("\nUsage: INITIAL_ADMIN_EMAIL=admin@yourdomain.com INITIAL_ADMIN_PASSWORD=... npm run admin:bootstrap");
    process.exit(1);
  }

  const { INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD } = parsed.data;
  const normalizedEmail = INITIAL_ADMIN_EMAIL.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(INITIAL_ADMIN_PASSWORD, 12);

  const adminUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email: normalizedEmail },
      update: {
        role: UserRole.ADMIN,
        status: AccountStatus.ACTIVE,
        passwordHash,
      },
      create: {
        name: "Editorial Administrator",
        email: normalizedEmail,
        passwordHash,
        role: UserRole.ADMIN,
        status: AccountStatus.ACTIVE,
        bio: "InkSpace Managing Editor & Platform Administrator",
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: user.id,
        action: "ADMIN_BOOTSTRAP_EXECUTED",
        targetResourceType: "User",
        targetResourceId: user.id,
        metadata: {
          email: normalizedEmail,
          method: "cli_bootstrap",
          timestamp: new Date().toISOString(),
        },
      },
    });

    return user;
  });

  console.log(`Administrator account provisioned for ${adminUser.email} (ID: ${adminUser.id}).`);
  console.log("Security notice: Remove INITIAL_ADMIN_PASSWORD from your environment shell history.");
}

bootstrapAdmin()
  .catch((err) => {
    console.error("Bootstrap error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
