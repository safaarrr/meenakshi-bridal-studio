import ReviewsClient from "./ReviewClient";

export default function ReviewsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-6 py-8 sm:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#9c810c]">
              Reviews
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              Manage Reviews
            </h1>
          </div>

          <a
            href="/admin"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-[#9c810c] hover:text-white"
          >
            ← Dashboard
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10">
        <ReviewsClient />
      </div>
    </main>
  );
}