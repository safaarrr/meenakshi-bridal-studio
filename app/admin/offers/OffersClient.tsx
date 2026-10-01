"use client";

import Link from "next/link";
import { useRef, useState } from "react";

type Offer = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  oldRate: number | null;
  newRate: number | null;
  isActive: boolean;
  sortOrder: number;
};

type Props = {
  initialOffers: Offer[];
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#9c810c]";

export default function OffersClient({ initialOffers }: Props) {
  const [offers, setOffers] = useState(initialOffers);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [oldRate, setOldRate] = useState("");
  const [newRate, setNewRate] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setImageUrl("");
    setOldRate("");
    setNewRate("");
    setImageFile(null);
    setImagePreview("");
    setSortOrder("0");
    setIsActive(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function editOffer(offer: Offer) {
    setEditingId(offer.id);
    setTitle(offer.title);
    setDescription(offer.description);
    setImageUrl(offer.imageUrl);
    setOldRate(offer.oldRate === null || offer.oldRate === undefined ? "" : String(offer.oldRate));
    setNewRate(offer.newRate === null || offer.newRate === undefined ? "" : String(offer.newRate));
    setImageFile(null);
    setImagePreview(offer.imageUrl);
    setSortOrder(String(offer.sortOrder));
    setIsActive(offer.isActive);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be smaller than 10 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setSuccess("");
    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Please enter an offer title.");
      return;
    }

    const parsedOldRate = oldRate.trim() === "" ? null : Number(oldRate);
    const parsedNewRate = newRate.trim() === "" ? null : Number(newRate);

    if (
      (parsedOldRate !== null && (!Number.isFinite(parsedOldRate) || parsedOldRate < 0)) ||
      (parsedNewRate !== null && (!Number.isFinite(parsedNewRate) || parsedNewRate < 0))
    ) {
      setError("Please enter valid non-negative rates.");
      return;
    }

    try {
      setSaving(true);

      let uploadedImageUrl = imageUrl;

      // Upload a newly selected image to Cloudinary.
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("folder", "offers");

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(
            uploadData.error || "Failed to upload image."
          );
        }

        uploadedImageUrl = uploadData.url;
      }

      // Save the offer with the uploaded image URL.
      const response = await fetch("/api/offers", {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          title: title.trim(),
          description: description.trim(),
          imageUrl: uploadedImageUrl.trim(),
          oldRate: parsedOldRate,
          newRate: parsedNewRate,
          sortOrder: Number(sortOrder),
          isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save offer.");
      }

      if (editingId) {
        setOffers((previous) =>
          previous.map((offer) =>
            offer.id === editingId ? data : offer
          )
        );

        setSuccess("Offer updated successfully.");
      } else {
        setOffers((previous) => [...previous, data]);
        setSuccess("Offer added successfully.");
      }

      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleOffer(offer: Offer) {
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/offers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: offer.id,
          isActive: !offer.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update offer.");
      }

      setOffers((previous) =>
        previous.map((item) =>
          item.id === offer.id ? data : item
        )
      );

      setSuccess("Offer status updated.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    }
  }

  async function deleteOffer(id: number) {
    if (!window.confirm("Are you sure you want to delete this offer?")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/offers?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete offer.");
      }

      setOffers((previous) =>
        previous.filter((offer) => offer.id !== id)
      );

      if (editingId === id) {
        resetForm();
      }

      setSuccess("Offer deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5 lg:px-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#9c810c]">
            Offers
          </p>

          <h1 className="mt-2 text-2xl font-bold">
            Manage Offers
          </h1>
        </div>

        <Link
          href="/admin"
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:border-[#9c810c]/50 hover:text-white"
        >
          ← Dashboard
        </Link>
      </header>

      <div className="mx-auto max-w-7xl space-y-10 p-6 lg:p-10">
        {/* ADD / EDIT OFFER */}
        <section className="rounded-2xl border border-white/10 bg-[#080808] p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold">
              {editingId ? "Edit Offer" : "Add New Offer"}
            </h2>

            <p className="mt-1 text-sm text-white/40">
              Manage promotional offers displayed on your website.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* TITLE */}
            <div>
              <label className="mb-2 block text-sm text-white/60">
                Offer Title
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Bridal Special Offer"
                className={inputClass}
                required
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="mb-2 block text-sm text-white/60">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter offer details"
                rows={4}
                className={inputClass}
              />
            </div>

            {/* OFFER RATES */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-white/60">
                  Old Rate (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={oldRate}
                  onChange={(e) => setOldRate(e.target.value)}
                  placeholder="e.g. 4999"
                  className={inputClass}
                />
                <p className="mt-2 text-xs text-white/30">
                  This price will appear crossed out.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/60">
                  New Rate (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  placeholder="e.g. 2999"
                  className={inputClass}
                />
                <p className="mt-2 text-xs text-white/30">
                  This is the offer price highlighted on your website.
                </p>
              </div>
            </div>

            {/* IMAGE UPLOAD */}
            <div>
              <label className="mb-2 block text-sm text-white/60">
                Offer Image
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full cursor-pointer rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white/60 file:mr-4 file:rounded-md file:border-0 file:bg-[#9c810c] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#b39a16]"
              />

              <p className="mt-2 text-xs text-white/30">
                Select an image from your device. Maximum size: 10 MB.
              </p>
            </div>

            {/* IMAGE PREVIEW */}
            {imagePreview && (
              <div>
                <p className="mb-2 text-xs text-white/40">
                  Image Preview
                </p>

                <div className="w-full sm:w-80">
                  <img
                    src={imagePreview}
                    alt="Offer preview"
                    className="h-48 w-full rounded-lg border border-white/10 object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImageUrl("");
                      setImagePreview("");

                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="mt-2 rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            )}

            {/* DISPLAY ORDER AND STATUS */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-white/60">
                  Display Order
                </label>

                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center gap-3 pt-7">
                <input
                  id="offer-active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 accent-[#9c810c]"
                />

                <label
                  htmlFor="offer-active"
                  className="text-sm text-white/70"
                >
                  Active on website
                </label>
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </p>
            )}

            {/* SUCCESS MESSAGE */}
            {success && (
              <p className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
                {success}
              </p>
            )}

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#9c810c] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#b39a16] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? imageFile
                    ? "Uploading image..."
                    : "Saving..."
                  : editingId
                    ? "Update Offer"
                    : "Add Offer"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-lg border border-white/10 px-6 py-3 text-sm text-white/60 transition hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* OFFERS LIST */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold">Current Offers</h2>

            <p className="mt-1 text-sm text-white/40">
              {offers.length} offers in your database
            </p>
          </div>

          {offers.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-[#080808] p-10 text-center">
              <div className="text-3xl">🎁</div>

              <h3 className="mt-4 font-bold">No offers yet</h3>

              <p className="mt-2 text-sm text-white/40">
                Add your first offer using the form above.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {offers
                .slice()
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((offer) => (
                  <article
                    key={offer.id}
                    className="overflow-hidden rounded-xl border border-white/10 bg-[#080808] transition hover:border-[#9c810c]/50"
                  >
                    {offer.imageUrl ? (
                      <img
                        src={offer.imageUrl}
                        alt={offer.title}
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-white/5 text-4xl">
                        🎁
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-bold">
                          {offer.title}
                        </h3>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold ${
                            offer.isActive
                              ? "bg-green-500/10 text-green-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {offer.isActive ? "ACTIVE" : "HIDDEN"}
                        </span>
                      </div>

                      {offer.description && (
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/45">
                          {offer.description}
                        </p>
                      )}

                      {(offer.oldRate !== null && offer.oldRate !== undefined) ||
                      (offer.newRate !== null && offer.newRate !== undefined) ? (
                        <div className="mt-4 flex flex-wrap items-baseline gap-3">
                          {offer.newRate !== null && offer.newRate !== undefined && (
                            <span className="text-xl font-bold text-[#f9f104]">
                              ₹{offer.newRate.toLocaleString("en-IN")}
                            </span>
                          )}
                          {offer.oldRate !== null && offer.oldRate !== undefined && (
                            <span className="text-sm text-white/40 line-through">
                              ₹{offer.oldRate.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      ) : null}

                      <p className="mt-4 text-xs text-white/25">
                        Display order: {offer.sortOrder}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                        <button
                          onClick={() => editOffer(offer)}
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 transition hover:border-[#9c810c]/50 hover:text-white"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => toggleOffer(offer)}
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 transition hover:border-[#9c810c]/50 hover:text-white"
                        >
                          {offer.isActive ? "Hide" : "Activate"}
                        </button>

                        <button
                          onClick={() => deleteOffer(offer.id)}
                          className="rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}