"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

type Review = {
  id: number;
  customerName: string;
  rating: number;
  review: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
};

type ReviewType = "IMAGE" | "VIDEO";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#9c810c]/70";

const buttonClass =
  "rounded-xl bg-[#9c810c] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#b39712] disabled:cursor-not-allowed disabled:opacity-50";

export default function ReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [editingType, setEditingType] =
    useState<ReviewType | null>(null);

  const [customerName, setCustomerName] =
    useState("");

  const [rating, setRating] =
    useState("5");

  const [review, setReview] =
    useState("");

  const [imageUrl, setImageUrl] =
    useState("");

  const [videoUrl, setVideoUrl] =
    useState("");

  const [isActive, setIsActive] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  /* =====================================================
     LOAD
  ===================================================== */

  async function loadReviews() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/reviews",
        {
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load reviews."
        );
      }

      setReviews(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load reviews."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReviews();
  }, []);

  /* =====================================================
     RESET
  ===================================================== */

  function resetForm() {
    setEditingId(null);
    setEditingType(null);
    setCustomerName("");
    setRating("5");
    setReview("");
    setImageUrl("");
    setVideoUrl("");
    setIsActive(true);
  }

  /* =====================================================
     UPLOAD
  ===================================================== */

  async function uploadFile(
    file: File,
    type: ReviewType
  ) {
    const isVideo =
      type === "VIDEO";

    if (
      isVideo &&
      !file.type.startsWith("video/")
    ) {
      throw new Error(
        "Please select a video file."
      );
    }

    if (
      !isVideo &&
      !file.type.startsWith("image/")
    ) {
      throw new Error(
        "Please select an image file."
      );
    }

    const maxSize = isVideo
      ? 100 * 1024 * 1024
      : 10 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new Error(
        isVideo
          ? "Video must be smaller than 100 MB."
          : "Image must be smaller than 10 MB."
      );
    }

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    formData.append(
      "folder",
      "reviews"
    );

    const response =
      await fetch(
        "/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Upload failed."
      );
    }

    return String(data.url);
  }

  async function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);
      setError("");

      const url =
        await uploadFile(
          file,
          "IMAGE"
        );

      setImageUrl(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Image upload failed."
      );

      event.target.value = "";
    } finally {
      setUploading(false);
    }
  }

  async function handleVideoChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);
      setError("");

      const url =
        await uploadFile(
          file,
          "VIDEO"
        );

      setVideoUrl(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Video upload failed."
      );

      event.target.value = "";
    } finally {
      setUploading(false);
    }
  }

  /* =====================================================
     EDIT
  ===================================================== */

  function startEdit(
    item: Review,
    type: ReviewType
  ) {
    setEditingId(item.id);
    setEditingType(type);

    setCustomerName(
      item.customerName
    );

    setRating(
      String(item.rating || 5)
    );

    setReview(
      item.review || ""
    );

    setImageUrl(
      item.imageUrl || ""
    );

    setVideoUrl(
      item.videoUrl || ""
    );

    setIsActive(
      item.isActive
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =====================================================
     SAVE
  ===================================================== */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const type =
        editingType ||
        (imageUrl
          ? "IMAGE"
          : "VIDEO");

      if (!customerName.trim()) {
        throw new Error(
          "Customer name is required."
        );
      }

      if (
        type === "IMAGE" &&
        (!imageUrl ||
          !review.trim())
      ) {
        throw new Error(
          "Image review requires an image and review text."
        );
      }

      if (
        type === "VIDEO" &&
        !videoUrl
      ) {
        throw new Error(
          "Please upload a review video."
        );
      }

      const response =
        await fetch(
          "/api/reviews",
          {
            method:
              editingId === null
                ? "POST"
                : "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              ...(editingId === null
                ? {}
                : {
                    id: editingId,
                  }),

              customerName:
                customerName.trim(),

              rating:
                type === "IMAGE"
                  ? Number(rating)
                  : 5,

              review:
                type === "IMAGE"
                  ? review.trim()
                  : "",

              imageUrl:
                type === "IMAGE"
                  ? imageUrl
                  : null,

              videoUrl:
                type === "VIDEO"
                  ? videoUrl
                  : null,

              isActive,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save review."
        );
      }

      resetForm();

      await loadReviews();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save review."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     TOGGLE
  ===================================================== */

  async function toggleActive(
    item: Review
  ) {
    setError("");

    try {
      const response =
        await fetch(
          "/api/reviews",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              id: item.id,
              isActive:
                !item.isActive,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update review."
        );
      }

      setReviews(
        (current) =>
          current.map(
            (entry) =>
              entry.id === item.id
                ? data
                : entry
          )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update review."
      );
    }
  }

  /* =====================================================
     DELETE
  ===================================================== */

  async function deleteReview(
    item: Review
  ) {
    if (
      !window.confirm(
        `Delete the review from ${item.customerName}?`
      )
    ) {
      return;
    }

    try {
      setError("");

      const response =
        await fetch(
          `/api/reviews?id=${item.id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete review."
        );
      }

      setReviews(
        (current) =>
          current.filter(
            (entry) =>
              entry.id !== item.id
          )
      );

      if (
        editingId === item.id
      ) {
        resetForm();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete review."
      );
    }
  }

  const imageReviews =
    reviews.filter(
      (item) =>
        Boolean(item.imageUrl)
    );

  const videoReviews =
    reviews.filter(
      (item) =>
        Boolean(item.videoUrl)
    );

  /* =====================================================
     FORM
  ===================================================== */

  return (
    <div className="space-y-12">

      {/* =================================================
          ADD / EDIT FORM
      ================================================= */}

      <section className="rounded-2xl border border-white/10 bg-[#080808] p-5 sm:p-7">

        <div className="mb-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9c810c]">
            {editingId
              ? `Editing ${
                  editingType === "IMAGE"
                    ? "Image"
                    : "Video"
                } Review`
              : "Customer Reviews"}
          </p>

          <h2 className="mt-2 text-xl font-bold">
            {editingId
              ? "Update Review"
              : "Choose Review Type"}
          </h2>
        </div>

        {/* TYPE BUTTONS */}

        {!editingId && (
          <div className="grid gap-4 md:grid-cols-2">

            <button
              type="button"
              onClick={() => {
                setEditingType(
                  "IMAGE"
                );
                setVideoUrl("");
              }}
              className={`rounded-2xl border p-6 text-left transition ${
                editingType ===
                "IMAGE"
                  ? "border-[#9c810c] bg-[#9c810c]/10"
                  : "border-white/10 bg-black hover:border-[#9c810c]/50"
              }`}
            >
              <div className="text-2xl">
                📸
              </div>

              <h3 className="mt-3 text-lg font-semibold">
                Image Review
              </h3>

              <p className="mt-1 text-sm text-white/40">
                Photo + stars + customer review
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingType(
                  "VIDEO"
                );
                setImageUrl("");
                setReview("");
              }}
              className={`rounded-2xl border p-6 text-left transition ${
                editingType ===
                "VIDEO"
                  ? "border-[#9c810c] bg-[#9c810c]/10"
                  : "border-white/10 bg-black hover:border-[#9c810c]/50"
              }`}
            >
              <div className="text-2xl">
                🎥
              </div>

              <h3 className="mt-3 text-lg font-semibold">
                Video Review
              </h3>

              <p className="mt-1 text-sm text-white/40">
                Video + customer name
              </p>
            </button>

          </div>
        )}

        {editingType && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 grid gap-5 md:grid-cols-2"
          >

            <label className="space-y-2 text-xs text-white/55">
              Customer name

              <input
                className={inputClass}
                value={customerName}
                onChange={(e) =>
                  setCustomerName(
                    e.target.value
                  )
                }
                required
                maxLength={120}
                placeholder="Customer name"
              />
            </label>

            {/* IMAGE FORM */}

            {editingType ===
              "IMAGE" && (
              <>
                <label className="space-y-2 text-xs text-white/55">
                  Star rating

                  <select
                    className={
                      inputClass
                    }
                    value={rating}
                    onChange={(e) =>
                      setRating(
                        e.target.value
                      )
                    }
                  >
                    {[5, 4, 3, 2, 1].map(
                      (n) => (
                        <option
                          key={n}
                          value={n}
                        >
                          {n}{" "}
                          {n === 1
                            ? "star"
                            : "stars"}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label className="space-y-2 text-xs text-white/55 md:col-span-2">
                  Review

                  <textarea
                    className={`${inputClass} min-h-32 resize-y`}
                    value={review}
                    onChange={(e) =>
                      setReview(
                        e.target.value
                      )
                    }
                    required
                    maxLength={2000}
                    placeholder="Write the customer's review..."
                  />
                </label>

                <label className="space-y-2 text-xs text-white/55 md:col-span-2">
                  📸 Review Image

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleImageChange
                    }
                    className="block w-full rounded-xl border border-white/10 bg-black p-3 text-sm text-white/60"
                  />
                </label>

                {imageUrl && (
                  <div className="md:col-span-2">
                    <img
                      src={imageUrl}
                      alt="Review preview"
                      className="max-h-72 rounded-2xl border border-white/10 object-contain"
                    />
                  </div>
                )}
              </>
            )}

            {/* VIDEO FORM */}

            {editingType ===
              "VIDEO" && (
              <>
                <div className="md:col-span-2">
                  <p className="mb-2 text-xs text-white/55">
                    🎥 Review Video
                  </p>

                  <input
                    type="file"
                    accept="video/*"
                    onChange={
                      handleVideoChange
                    }
                    className="block w-full rounded-xl border border-white/10 bg-black p-3 text-sm text-white/60"
                  />
                </div>

                {videoUrl && (
                  <div className="md:col-span-2">
                    <video
                      src={videoUrl}
                      controls
                      playsInline
                      className="max-h-[500px] w-full rounded-2xl border border-white/10 bg-black"
                    />
                  </div>
                )}
              </>
            )}

            <label className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm text-white/70">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) =>
                  setIsActive(
                    e.target.checked
                  )
                }
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

              <button
                className={
                  buttonClass
                }
                disabled={
                  saving ||
                  uploading
                }
              >
                {uploading
                  ? "Uploading..."
                  : saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Add Review"}
              </button>

              <button
                type="button"
                onClick={
                  resetForm
                }
                className="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/65 transition hover:border-white/25 hover:text-white"
              >
                Cancel
              </button>

            </div>
          </form>
        )}

      </section>

      {/* =================================================
          IMAGE REVIEWS
      ================================================= */}

      <section>

        <div className="mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9c810c]">
            📸 IMAGE REVIEWS
          </p>

          <h2 className="mt-2 text-xl font-bold">
            Customer Image Reviews
          </h2>

          <p className="mt-1 text-sm text-white/40">
            {imageReviews.length} image review
            {imageReviews.length === 1
              ? ""
              : "s"}
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-white/10 bg-[#080808] p-10 text-center text-sm text-white/40">
            Loading reviews...
          </div>
        ) : imageReviews.length ===
          0 ? (
          <div className="rounded-xl border border-white/10 bg-[#080808] p-10 text-center text-sm text-white/40">
            No image reviews yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            {imageReviews.map(
              (item) => {
                const stars =
                  Math.max(
                    0,
                    Math.min(
                      5,
                      Number(
                        item.rating
                      ) || 0
                    )
                  );

                return (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-[#080808]"
                  >

                    {item.imageUrl && (
                      <img
                        src={
                          item.imageUrl
                        }
                        alt={`${item.customerName} review`}
                        className="h-64 w-full object-cover"
                      />
                    )}

                    <div className="p-5">

                      <div className="flex items-start justify-between gap-3">

                        <div>
                          <h3 className="font-semibold">
                            {
                              item.customerName
                            }
                          </h3>

                          <p className="mt-1 tracking-widest text-[#f9f104]">
                            {"★".repeat(
                              stars
                            )}
                            <span className="text-white/15">
                              {"★".repeat(
                                5 - stars
                              )}
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
                          {item.isActive
                            ? "ACTIVE"
                            : "HIDDEN"}
                        </span>

                      </div>

                      <p className="mt-4 whitespace-pre-line text-sm leading-6 text-white/55">
                        “{item.review}”
                      </p>

                      <div className="mt-5 flex justify-end gap-2 border-t border-white/10 pt-4">

                        <button
                          onClick={() =>
                            void toggleActive(
                              item
                            )
                          }
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 hover:border-[#9c810c]/50 hover:text-white"
                        >
                          {item.isActive
                            ? "Hide"
                            : "Show"}
                        </button>

                        <button
                          onClick={() =>
                            startEdit(
                              item,
                              "IMAGE"
                            )
                          }
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 hover:border-[#9c810c]/50 hover:text-white"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            void deleteReview(
                              item
                            )
                          }
                          className="rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
                        >
                          Delete
                        </button>

                      </div>
                    </div>
                  </article>
                );
              }
            )}

          </div>
        )}

      </section>

      {/* =================================================
          VIDEO REVIEWS
      ================================================= */}

      <section>

        <div className="mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9c810c]">
            🎥 VIDEO REVIEWS
          </p>

          <h2 className="mt-2 text-xl font-bold">
            Customer Video Reviews
          </h2>

          <p className="mt-1 text-sm text-white/40">
            {videoReviews.length} video review
            {videoReviews.length === 1
              ? ""
              : "s"}
          </p>
        </div>

        {videoReviews.length ===
        0 ? (
          <div className="rounded-xl border border-white/10 bg-[#080808] p-10 text-center text-sm text-white/40">
            No video reviews yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            {videoReviews.map(
              (item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-[#080808]"
                >

                  {item.videoUrl && (
                    <video
                      src={
                        item.videoUrl
                      }
                      controls
                      playsInline
                      preload="metadata"
                      className="aspect-[9/16] w-full bg-black object-cover"
                    />
                  )}

                  <div className="p-5">

                    <div className="flex items-center justify-between gap-3">

                      <h3 className="font-semibold">
                        {
                          item.customerName
                        }
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          item.isActive
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {item.isActive
                          ? "ACTIVE"
                          : "HIDDEN"}
                      </span>

                    </div>

                    <div className="mt-4 flex justify-end gap-2 border-t border-white/10 pt-4">

                      <button
                        onClick={() =>
                          void toggleActive(
                            item
                          )
                        }
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 hover:border-[#9c810c]/50 hover:text-white"
                      >
                        {item.isActive
                          ? "Hide"
                          : "Show"}
                      </button>

                      <button
                        onClick={() =>
                          startEdit(
                            item,
                            "VIDEO"
                          )
                        }
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 hover:border-[#9c810c]/50 hover:text-white"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          void deleteReview(
                            item
                          )
                        }
                        className="rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
                      >
                        Delete
                      </button>

                    </div>
                  </div>
                </article>
              )
            )}

          </div>
        )}

      </section>

    </div>
  );
}