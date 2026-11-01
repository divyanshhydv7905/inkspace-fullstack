import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { LoginSchema } from "./validations/auth.schema";
import { checkRateLimit } from "./utils/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const rate = checkRateLimit(`login:${email}`, 8, 60_000);
        if (!rate.allowed) {
          throw new Error("Too many login attempts. Please wait a minute.");
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        if (user.status !== "ACTIVE") {
          throw new Error("Account suspended. Contact an administrator.");
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "WRITER";
        token.status = (user as { status?: string }).status ?? "ACTIVE";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        (session.user as { role?: string }).role = String(token.role ?? "WRITER");
        (session.user as { status?: string }).status = String(token.status ?? "ACTIVE");
      }
      return session;
    },
  },
});
