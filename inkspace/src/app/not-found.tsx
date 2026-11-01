import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-[#77736E] mb-3">404 — Page Not Found</p>
      <h1 className="font-serif-editorial text-4xl md:text-5xl text-[#191919] mb-4">
        This folio does not exist in our archive.
      </h1>
      <p className="text-[#77736E] max-w-md mb-8">
        The essay you are looking for may have been moved, archived, or never published.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-[#2D4A3E] text-white text-sm font-medium rounded hover:bg-[#233B31] transition"
      >
        Return to Front Page
      </Link>
    </main>
  );
}
