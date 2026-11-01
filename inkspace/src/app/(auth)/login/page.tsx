import Link from "next/link";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export default async function LoginPage(props: {
  searchParams?: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const callbackUrl = searchParams.callbackUrl || "/admin";
  const error = searchParams.error;

  async function handleLogin(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const targetUrl = (formData.get("redirectTo") as string) || callbackUrl;

    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: targetUrl,
      });
    } catch (err) {
      if (err instanceof AuthError) {
        return redirect(`/login?error=${encodeURIComponent(err.type)}&callbackUrl=${encodeURIComponent(targetUrl)}`);
      }
      throw err;
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[#FAF9F6]">
      <div className="w-full max-w-md bg-white border border-[#E9E6E0] rounded p-8 space-y-6">
        <div>
          <Link href="/" className="font-serif-editorial text-2xl text-[#191919]">InkSpace</Link>
          <h1 className="font-serif-editorial text-2xl text-[#191919] mt-4">Sign in to your desk</h1>
          <p className="text-xs text-[#77736E] mt-1">Enter your writer or administrator credentials.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
            {error === "CredentialsSignin"
              ? "Invalid email or password. Agar admin account nahi banaya hai toh terminal me 'npm run admin:bootstrap' chalayein."
              : error === "AccountSuspended"
              ? "This account has been suspended."
              : "Authentication failed. Please verify your credentials."}
          </div>
        )}

        <form action={handleLogin} className="space-y-4">
          <input type="hidden" name="redirectTo" value={callbackUrl} />
          <div>
            <label className="block text-xs font-medium text-[#191919] mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="admin@inkspace.editorial"
              className="w-full px-3 py-2 border border-[#E9E6E0] rounded text-sm focus:outline-none focus:border-[#2D4A3E]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#191919] mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••••••"
              className="w-full px-3 py-2 border border-[#E9E6E0] rounded text-sm focus:outline-none focus:border-[#2D4A3E]"
            />
          </div>
          <button type="submit" className="w-full py-2.5 bg-[#2D4A3E] text-white text-sm font-medium rounded hover:bg-[#233a31] transition-colors">
            Sign In
          </button>
        </form>

        <div className="border-t border-[#E9E6E0] pt-4 text-xs text-[#77736E] space-y-1">
          <p>
            <strong>Default Writer:</strong> clara.vance@inkspace.editorial (Pass: <code>WriterDemoPass!2026</code>)
          </p>
          <p>
            New contributor? <Link href="/register" className="text-[#2D4A3E] underline">Apply for a Writer Account</Link>
          </p>
        </div>
      </div>
    </main>
  );
}