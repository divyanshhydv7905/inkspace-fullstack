import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[#FAF9F6]">
      <div className="w-full max-w-md bg-white border border-[#E9E6E0] rounded p-8 space-y-6">
        <div>
          <Link href="/" className="font-serif-editorial text-2xl text-[#191919]">InkSpace</Link>
          <h1 className="font-serif-editorial text-2xl text-[#191919] mt-4">Create a Writer Account</h1>
          <p className="text-xs text-[#77736E] mt-1">All public registrations are provisioned with the WRITER role.</p>
        </div>
        <form action="/api/auth/register" method="POST" className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#191919] mb-1">Full Name</label>
            <input type="text" name="name" required className="w-full px-3 py-2 border border-[#E9E6E0] rounded text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#191919] mb-1">Email Address</label>
            <input type="email" name="email" required className="w-full px-3 py-2 border border-[#E9E6E0] rounded text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#191919] mb-1">Password (min 10 chars, mixed case + digit)</label>
            <input type="password" name="password" required className="w-full px-3 py-2 border border-[#E9E6E0] rounded text-sm" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-[#2D4A3E] text-white text-sm font-medium rounded">
            Register Writer Account
          </button>
        </form>
      </div>
    </main>
  );
}
