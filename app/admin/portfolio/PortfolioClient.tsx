"use client";

import { useEffect, useRef, useState } from "react";

type PortfolioItem = {
  id: number;
  type: "IMAGE" | "VIDEO";
  url: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export default function PortfolioClient() {
  const [items, setItems] = useState<PortfolioItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [type, setType] = useState<"IMAGE" | "VIDEO">("IMAGE");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadPortfolio() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/portfolio", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load portfolio."
        );
      }

      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Portfolio loading error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load portfolio."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPortfolio();
  }, []);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (type === "IMAGE" && !isImage) {
      setError("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (type === "VIDEO" && !isVideo) {
      setError("Please select a video file.");
      event.target.value = "";
      return;
    }

    const maxSize =
      type === "IMAGE"
        ? 10 * 1024 * 1024
        : 100 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        type === "IMAGE"
          ? "Image must be smaller than 10 MB."
          : "Video must be smaller than 100 MB."
      );

      event.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(newPreviewUrl);
  }

  function clearSelectedFile() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleAdd(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!selectedFile) {
      setError("Please select an image or video.");
      return;
    }

    try {
      setSaving(true);

      /* =====================================================
         STEP 1 — UPLOAD FILE TO CLOUDINARY
      ===================================================== */

      const uploadFormData = new FormData();

      uploadFormData.append("file", selectedFile);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(
          uploadData.error || "Failed to upload file."
        );
      }

      if (!uploadData.url) {
        throw new Error(
          "Upload succeeded but no media URL was returned."
        );
      }

      /* =====================================================
         STEP 2 — SAVE CLOUDINARY URL TO PORTFOLIO DATABASE
      ===================================================== */

      const response = await fetch(
        "/api/admin/portfolio",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type,
            url: uploadData.url,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "File uploaded but failed to save portfolio item."
        );
      }

      setItems((current) => [
        ...current,
        data.portfolio,
      ]);

      clearSelectedFile();

      setType("IMAGE");
      setShowForm(false);
    } catch (error) {
      console.error(
        "Add portfolio error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to add portfolio item."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(
    item: PortfolioItem
  ) {
    try {
      setUpdatingId(item.id);
      setError("");

      const response = await fetch(
        "/api/admin/portfolio",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: item.id,
            isActive: !item.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update portfolio item."
        );
      }

      setItems((current) =>
        current.map((portfolio) =>
          portfolio.id === item.id
            ? {
                ...portfolio,
                isActive:
                  !portfolio.isActive,
              }
            : portfolio
        )
      );
    } catch (error) {
      console.error(
        "Portfolio update error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update portfolio item."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(
    item: PortfolioItem
  ) {
    const confirmed =
      window.confirm(
        `Delete this ${item.type.toLowerCase()}? This cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(item.id);
      setError("");

      const response = await fetch(
        "/api/admin/portfolio",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: item.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete portfolio item."
        );
      }

      setItems((current) =>
        current.filter(
          (portfolio) =>
            portfolio.id !== item.id
        )
      );
    } catch (error) {
      console.error(
        "Portfolio delete error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete portfolio item."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handleTypeChange(
    newType: "IMAGE" | "VIDEO"
  ) {
    setType(newType);
    clearSelectedFile();
    setError("");
  }

  return (
    <div>

      {/* =====================================================
          TOP
      ===================================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <p className="text-sm text-white/40">
          {items.length} portfolio{" "}
          {items.length === 1
            ? "item"
            : "items"}
        </p>

        <button
          type="button"
          onClick={() => {
            setShowForm(
              (current) => !current
            );

            setError("");

            if (showForm) {
              clearSelectedFile();
            }
          }}
          className="rounded-xl bg-[#9c810c] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#b39412]"
        >
          {showForm
            ? "× Close"
            : "+ Add Portfolio"}
        </button>

      </div>

      {/* =====================================================
          ADD FORM
      ===================================================== */}

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mt-6 rounded-3xl border border-white/10 bg-[#080808] p-6"
        >

          <div className="mb-6">

            <h3 className="text-xl font-semibold text-white">
              Add Portfolio
            </h3>

            <p className="mt-1 text-sm text-white/35">
              Upload an image or video directly
              from your computer.
            </p>

          </div>

          {/* =================================================
              TYPE
          ================================================= */}

          <div>

            <label className="mb-2 block text-sm font-medium text-white/70">
              Media Type
            </label>

            <select
              value={type}
              onChange={(event) =>
                handleTypeChange(
                  event.target.value as
                    | "IMAGE"
                    | "VIDEO"
                )
              }
              disabled={saving}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-[#9c810c]"
            >

              <option value="IMAGE">
                Image
              </option>

              <option value="VIDEO">
                Video
              </option>

            </select>

          </div>

          {/* =================================================
              FILE UPLOAD
          ================================================= */}

          <div className="mt-5">

            <label className="mb-2 block text-sm font-medium text-white/70">
              {type === "IMAGE"
                ? "Choose Image"
                : "Choose Video"}
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept={
                type === "IMAGE"
                  ? "image/jpeg,image/png,image/webp,image/gif"
                  : "video/mp4,video/webm,video/quicktime"
              }
              onChange={handleFileChange}
              disabled={saving}
              className="hidden"
            />

            {!selectedFile ? (
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={saving}
                className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#9c810c]/40 bg-black px-6 py-12 text-center transition hover:border-[#9c810c] hover:bg-[#9c810c]/5 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <span className="text-4xl">
                  {type === "IMAGE"
                    ? "🖼️"
                    : "🎥"}
                </span>

                <span className="mt-4 text-sm font-semibold text-white">
                  Click to choose{" "}
                  {type === "IMAGE"
                    ? "an image"
                    : "a video"}
                </span>

                <span className="mt-2 text-xs text-white/30">
                  {type === "IMAGE"
                    ? "JPG, PNG, WEBP or GIF • Max 10 MB"
                    : "MP4, WEBM or MOV • Max 100 MB"}
                </span>

              </button>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">

                {/* PREVIEW */}

                <div className="relative aspect-[4/5] max-h-[500px] bg-black">

                  {type === "IMAGE" ? (
                    <img
                      src={previewUrl}
                      alt="Selected portfolio preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      controls
                      playsInline
                      className="h-full w-full object-contain"
                    />
                  )}

                </div>

                {/* FILE INFO */}

                <div className="flex flex-col gap-4 border-t border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="min-w-0">

                    <p className="truncate text-sm font-medium text-white">
                      {selectedFile.name}
                    </p>

                    <p className="mt-1 text-xs text-white/30">
                      {(
                        selectedFile.size /
                        (1024 * 1024)
                      ).toFixed(2)}{" "}
                      MB
                    </p>

                  </div>

                  <div className="flex gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      disabled={saving}
                      className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-white/60 transition hover:border-[#9c810c]/50 hover:text-white disabled:opacity-50"
                    >
                      Change
                    </button>

                    <button
                      type="button"
                      onClick={
                        clearSelectedFile
                      }
                      disabled={saving}
                      className="rounded-xl border border-red-500/20 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      Remove
                    </button>

                  </div>

                </div>

              </div>
            )}

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">

            <button
              type="submit"
              disabled={
                saving ||
                !selectedFile
              }
              className="rounded-xl bg-[#9c810c] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#b39412] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Uploading..."
                : "Upload & Add Portfolio"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                clearSelectedFile();
                setError("");
              }}
              disabled={saving}
              className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-white/60 transition hover:border-white/20 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>

          </div>

        </form>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && !showForm && (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (

        <div className="mt-8 rounded-3xl border border-white/10 bg-[#080808] p-12 text-center">

          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#9c810c]" />

          <p className="mt-4 text-sm text-white/40">
            Loading portfolio...
          </p>

        </div>

      ) : items.length === 0 ? (

        <div className="mt-8 rounded-3xl border border-white/10 bg-[#080808] p-12 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#9c810c]/30 bg-[#9c810c]/10 text-2xl">
            🖼️
          </div>

          <h3 className="mt-5 text-xl font-semibold text-white">
            No portfolio items
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
            Add your first image or video
            to start building the portfolio.
          </p>

        </div>

      ) : (

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

          {items.map((item) => (

            <article
              key={item.id}
              className="overflow-hidden rounded-3xl border border-white/10 bg-[#080808]"
            >

              {/* =================================================
                  PREVIEW
              ================================================= */}

              <div className="relative aspect-[4/5] overflow-hidden bg-black">

                {item.type === "IMAGE" ? (

                  <img
                    src={item.url}
                    alt={`Meenakshi portfolio ${item.id}`}
                    className={`h-full w-full object-cover ${
                      item.isActive
                        ? ""
                        : "opacity-35 grayscale"
                    }`}
                  />

                ) : (

                  <video
                    src={item.url}
                    controls
                    preload="metadata"
                    playsInline
                    className={`h-full w-full object-cover ${
                      item.isActive
                        ? ""
                        : "opacity-35 grayscale"
                    }`}
                  />

                )}

                {/* TYPE */}

                <div className="absolute left-4 top-4">

                  <span className="rounded-full border border-[#9c810c]/50 bg-black/75 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-[#c9a91a] backdrop-blur-md">
                    {item.type}
                  </span>

                </div>

                {/* STATUS */}

                <div className="absolute right-4 top-4">

                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-semibold ${
                      item.isActive
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-white/10 bg-black/70 text-white/40"
                    }`}
                  >
                    {item.isActive
                      ? "ACTIVE"
                      : "HIDDEN"}
                  </span>

                </div>

              </div>

              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="p-5">

                <p className="truncate text-xs text-white/30">
                  {item.url}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      handleToggle(item)
                    }
                    disabled={
                      updatingId ===
                        item.id ||
                      deletingId ===
                        item.id
                    }
                    className="rounded-xl border border-white/10 px-3 py-3 text-xs font-semibold text-white/60 transition hover:border-[#9c810c]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {updatingId === item.id
                      ? "Updating..."
                      : item.isActive
                        ? "Hide"
                        : "Show"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(item)
                    }
                    disabled={
                      deletingId === item.id ||
                      updatingId === item.id
                    }
                    className="rounded-xl border border-red-500/20 px-3 py-3 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {deletingId === item.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>

                </div>

              </div>

            </article>

          ))}

        </div>

      )}

    </div>
  );
}