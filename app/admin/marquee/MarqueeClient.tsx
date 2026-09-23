"use client";

import { useEffect, useState } from "react";

type Marquee = {
  id: number;
  text: string;
  isActive: boolean;
  updatedAt: string;
};

export default function MarqueeClient() {
  const [marquee, setMarquee] =
    useState<Marquee | null>(null);

  const [text, setText] = useState("");
  const [isActive, setIsActive] =
    useState(true);

  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [error, setError] =
    useState("");
  const [success, setSuccess] =
    useState("");

  async function loadMarquee() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/marquee",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load marquee."
        );
      }

      if (Array.isArray(data) && data.length > 0) {
        const current = data[0];

        setMarquee(current);
        setText(current.text);
        setIsActive(current.isActive);
      } else {
        setMarquee(null);
        setText("");
        setIsActive(true);
      }
    } catch (error) {
      console.error(
        "Marquee loading error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load marquee."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMarquee();
  }, []);

  async function handleSave(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanText = text.trim();

    if (!cleanText) {
      setError(
        "Please enter marquee text."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/admin/marquee",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            text: cleanText,
            isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to save marquee."
        );
      }

      setMarquee(data.marquee);

      setText(data.marquee.text);
      setIsActive(
        data.marquee.isActive
      );

      setSuccess(
        "Marquee updated successfully."
      );
    } catch (error) {
      console.error(
        "Marquee save error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to save marquee."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle() {
    if (!marquee) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      setSaving(true);

      const newStatus =
        !marquee.isActive;

      const response = await fetch(
        "/api/admin/marquee",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: marquee.id,
            isActive: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update marquee."
        );
      }

      setMarquee(data.marquee);
      setIsActive(
        data.marquee.isActive
      );

      setSuccess(
        newStatus
          ? "Marquee is now visible."
          : "Marquee is now hidden."
      );
    } catch (error) {
      console.error(
        "Marquee toggle error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update marquee."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div>
        <p className="text-sm text-white/40">
          Manage the announcement bar shown
          on the main website.
        </p>
      </div>

      {loading ? (
        <div className="mt-8 rounded-3xl border border-white/10 bg-[#080808] p-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#9c810c]" />

          <p className="mt-4 text-sm text-white/40">
            Loading marquee...
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          className="mt-8 max-w-3xl rounded-3xl border border-white/10 bg-[#080808] p-6 sm:p-8"
        >
          <div>
            <h2 className="text-xl font-semibold text-white">
              Marquee Message
            </h2>

            <p className="mt-1 text-sm leading-6 text-white/35">
              This message will scroll
              horizontally across the main
              website.
            </p>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-white/70">
              Announcement Text
            </label>

            <textarea
              value={text}
              onChange={(event) =>
                setText(event.target.value)
              }
              disabled={saving}
              rows={4}
              placeholder="Enter your announcement..."
              className="w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#9c810c]"
            />

            <p className="mt-2 text-xs text-white/25">
              Example: BRIDAL MAKEUP • HAIR
              TRANSFORMATION • SKIN CARE •
              FAMILY SALON
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-black p-4">
            <div>
              <p className="text-sm font-medium text-white">
                Show on website
              </p>

              <p className="mt-1 text-xs text-white/30">
                Turn the announcement bar
                on or off.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsActive(
                  (current) => !current
                );
              }}
              disabled={saving}
              className={`relative h-7 w-12 rounded-full transition ${
                isActive
                  ? "bg-[#9c810c]"
                  : "bg-white/15"
              }`}
              aria-label="Toggle marquee visibility"
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  isActive
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              {success}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#9c810c] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#b39412] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Marquee"}
            </button>

            {marquee && (
              <button
                type="button"
                onClick={handleToggle}
                disabled={saving}
                className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-white/60 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {marquee.isActive
                  ? "Hide Marquee"
                  : "Show Marquee"}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}