import { auth } from "@/lib/auth";

export default async function WriterSettingsPage() {
  const session = await auth();
  return (
    <div className="space-y-6">
      <h1 className="font-serif-editorial text-3xl text-[#191919]">Profile Settings</h1>
      <div className="bg-white border border-[#E9E6E0] rounded p-6">
        <p className="text-sm">Signed in as: {session?.user?.email}</p>
      </div>
    </div>
  );
}
