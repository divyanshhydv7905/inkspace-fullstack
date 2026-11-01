"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-[75vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-[#77736E] mb-2">Operational Interruption</p>
      <h1 className="font-serif-editorial text-3xl text-[#191919] mb-3">
        We encountered an unexpected issue loading this view.
      </h1>
      <p className="text-sm text-[#77736E] max-w-md mb-6">
        {error.message || "Please try refreshing or returning to the main desk."}
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 bg-[#2D4A3E] text-white text-sm font-medium rounded"
      >
        Retry Request
      </button>
    </main>
  );
}
