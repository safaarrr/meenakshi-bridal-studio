"use client";

import { FormEvent, useEffect, useState } from "react";

type Review = {
  id: number;
  customerName: string;
  rating: number;
  review: string;
  isActive: boolean;
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#9c810c]/70";

const buttonClass =
  "rounded-xl bg-[#9c810c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b39712] disabled:cursor-not-allowed disabled:opacity-50";

export default function ReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState("5");
  const [isActive, setIsActive] = useState(true);

  async function loadReviews() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/reviews", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load reviews.");
      }

      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load reviews."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReviews();
  }, []);

  function resetForm() {
    setEditingId(null);
    setCustomerName("");
    setReview("");
    setRating("5");
    setIsActive(true);
  }

  function startEdit(item: Review) {
    setEditingId(item.id);
    setCustomerName(item.customerName);
    setReview(item.review);
    setRating(String(item.rating));
    setIsActive(item.isActive);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/reviews", {
        method: editingId === null ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(editingId === null ? {} : { id: editingId }),
          customerName,
          review,
          rating: Number(rating),
          isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save review.");
      }

      resetForm();
      await loadReviews();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save review."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(item: Review) {
    setError("");

    try {
      const response = await fetch("/api/reviews", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: item.id,
          isActive: !item.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update review.");
      }

      setReviews((current) =>
        current.map((entry) =>
          entry.id === item.id ? data : entry
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update review."
      );
    }
  }

  async function deleteReview(item: Review) {
    if (
      !window.confirm(
        `Delete the review from ${item.customerName}?`
      )
    ) {
      return;
    }

    setError("");

    try {
      const response = await fetch(
        `/api/reviews?id=${item.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete review.");
      }

      setReviews((current) =>
        current.filter((entry) => entry.id !== item.id)
      );

      if (editingId === item.id) {
        resetForm();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete review."
      );
    }
  }

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-white/10 bg-[#080808] p-5 sm:p-7">
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9c810c]">
            {editingId === null
              ? "New testimonial"
              : "Editing testimonial"}
          </p>

          <h2 className="mt-2 text-xl font-bold">
            {editingId === null
              ? "Add Customer Review"
              : "Update Customer Review"}
          </h2>

          <p className="mt-1 text-sm text-white/40">
            Manage customer testimonials displayed on your website.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-2"
        >
          <label className="space-y-2 text-xs text-white/55">
            Customer name
            <input
              className={inputClass}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              maxLength={120}
              placeholder="Customer name"
            />
          </label>

          <label className="space-y-2 text-xs text-white/55">
            Star rating
            <select
              className={inputClass}
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "star" : "stars"}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-xs text-white/55 md:col-span-2">
            Review
            <textarea
              className={`${inputClass} min-h-32 resize-y`}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              required
              maxLength={2000}
              placeholder="Write the customer's review..."
            />
          </label>

          <label className="flex items-center gap-3 self-end rounded-xl border border-white/10 px-4 py-3 text-sm text-white/70">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="accent-[#9c810c]"
            />
            Show on website
          </label>

          {error && (
            <p
              role="alert"
              className="text-sm text-red-400 md:col-span-2"
            >
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button className={buttonClass} disabled={saving}>
              {saving
                ? "Saving..."
                : editingId === null
                  ? "Add Review"
                  : "Save Changes"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/65 transition hover:border-white/25 hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Customer Reviews</h2>
            <p className="mt-1 text-sm text-white/40">
              {reviews.length} review
              {reviews.length === 1 ? "" : "s"} in your database
            </p>
          </div>

          <button
            onClick={() => void loadReviews()}
            className="rounded-lg border border-white/10 px-4 py-2 text-xs text-white/60 transition hover:border-[#9c810c]/50 hover:text-white"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="rounded-xl border border-white/10 bg-[#080808] p-10 text-center text-sm text-white/40">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#080808] p-10 text-center">
            <p className="text-lg font-semibold">No reviews yet</p>
            <p className="mt-2 text-sm text-white/40">
              Add your first customer review using the form above.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((item) => {
              const stars = Math.max(
                0,
                Math.min(5, item.rating)
              );

              return (
                <article
                  key={item.id}
                  className="rounded-xl border border-white/10 bg-[#080808] p-5 transition hover:border-[#9c810c]/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">
                        {item.customerName}
                      </h3>

                      <p className="mt-1 text-sm tracking-widest text-[#f9f104]">
                        {"★".repeat(stars)}
                        <span className="text-white/15">
                          {"★".repeat(5 - stars)}
                        </span>
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        item.isActive
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {item.isActive ? "ACTIVE" : "HIDDEN"}
                    </span>
                  </div>

                  <p className="mt-4 whitespace-pre-line text-sm leading-6 text-white/55">
                    “{item.review}”
                  </p>

                  <div className="mt-5 flex items-center justify-end gap-2 border-t border-white/10 pt-4">
                    <button
                      onClick={() => void toggleActive(item)}
                      className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 hover:border-[#9c810c]/50 hover:text-white"
                    >
                      {item.isActive ? "Hide" : "Show"}
                    </button>

                    <button
                      onClick={() => startEdit(item)}
                      className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 hover:border-[#9c810c]/50 hover:text-white"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => void deleteReview(item)}
                      className="rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}