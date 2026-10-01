"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Offer = {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  oldRate: number | null;
  newRate: number | null;
  sortOrder: number;
};

function formatPrice(price: number) {
  return `₹${price.toLocaleString("en-IN")}`;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/offers", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load offers");
        return response.json();
      })
      .then((data) => setOffers(Array.isArray(data) ? data : []))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white sm:px-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="text-sm text-[#9c810c] transition hover:text-white"
        >
          ← Back to Home
        </Link>

        <header className="mb-12 mt-10 text-center">
          <p className="mb-3 text-xs tracking-[0.35em] text-[#9c810c]">
            MEENAKSHI BRIDAL STUDIO
          </p>
          <h1 className="text-4xl font-bold sm:text-6xl">OUR OFFERS</h1>
          <p className="mt-4 text-sm text-white/50">
            Explore our latest offers and special packages.
          </p>
        </header>

        {loading ? (
          <p className="py-16 text-center text-white/50">
            Loading offers...
          </p>
        ) : offers.length === 0 ? (
          <p className="py-16 text-center text-white/50">
            No offers available right now. Please check back later.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <article
                key={offer.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#090909] transition duration-300 hover:-translate-y-1 hover:border-[#9c810c]/60"
              >
                {offer.imageUrl && (
                  <div className="aspect-[4/3] overflow-hidden bg-white/5">
                    <img
                      src={offer.imageUrl}
                      alt={offer.title}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />
                  </div>
                )}

                <div className="p-6">
                  <h2 className="text-xl font-semibold text-[#9c810c]">
                    {offer.title}
                  </h2>

                  {offer.description && (
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-white/60">
                      {offer.description}
                    </p>
                  )}

                  {(offer.oldRate !== null || offer.newRate !== null) && (
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      {offer.oldRate !== null && (
                        <span className="text-base text-white/40 line-through decoration-red-400 decoration-2">
                          {formatPrice(offer.oldRate)}
                        </span>
                      )}

                      {offer.newRate !== null && (
                        <span className="text-2xl font-bold text-[#9c810c]">
                          {formatPrice(offer.newRate)}
                        </span>
                      )}
                    </div>
                  )}

                  <Link
                    href="/?booking=1"
                    className="mt-6 inline-flex rounded-full border border-[#9c810c] px-5 py-2 text-xs font-semibold tracking-wider text-[#9c810c] transition hover:bg-[#9c810c] hover:text-black"
                  >
                    BOOK NOW
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}