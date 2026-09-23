"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Service = {
  id: number;
  name: string;
  description?: string | null;
  category?: string | null;
  isActive?: boolean;
};

type ServiceFormProps = {
  service?: Service | null;
  onSuccess?: (service: Service) => void;
  onCancel?: () => void;
};

const categories = [
  "Skin Services",
  "Hair Services",
  "Special Services",
  "Bride & Groom",
];

export default function ServiceForm({
  service,
  onSuccess,
  onCancel,
}: ServiceFormProps) {
  const router = useRouter();

  const isEditing = !!service;
  const [showForm, setShowForm] = useState(isEditing);

  const [name, setName] = useState(service?.name ?? "");
  const [description, setDescription] = useState(
    service?.description ?? ""
  );
  const [category, setCategory] = useState(
    service?.category ?? ""
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function closeForm() {
    if (loading) return;

    setShowForm(false);
    setError("");
    onCancel?.();
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Service name is required.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: name.trim(),
        description: description.trim(),
        category,
      };

      const response = await fetch("/api/admin/services", {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isEditing
            ? {
                id: service.id,
                ...payload,
              }
            : payload
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Something went wrong."
        );
      }

      onSuccess?.(data.service);
      router.refresh();

      if (!isEditing) {
        setName("");
        setDescription("");
        setCategory("");
        setShowForm(false);
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save service."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!showForm && !isEditing) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="mt-5 rounded-xl bg-[#9c810c] px-6 py-3 font-semibold text-black transition hover:bg-[#b39412]"
      >
        + Add Service
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 space-y-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
    >
      {/* HEADER */}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {isEditing ? "Edit Service" : "Add New Service"}
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            {isEditing
              ? "Update the service details."
              : "Add a new service to your website."}
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={closeForm}
            disabled={loading}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-800 text-xl text-zinc-400 transition hover:border-[#9c810c] hover:text-white disabled:opacity-50"
          >
            ×
          </button>
        )}
      </div>

      {/* SERVICE NAME */}

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Service Name
        </label>

        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Example: Hydra Facial"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#9c810c]"
        />
      </div>

      {/* CATEGORY */}

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Category
        </label>

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition focus:border-[#9c810c]"
        >
          <option value="">Select a category</option>

          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* DESCRIPTION */}

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Description
        </label>

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Short description of the service"
          rows={4}
          className="w-full resize-none rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#9c810c]"
        />
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* BUTTONS */}

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#9c810c] px-6 py-3 font-semibold text-black transition hover:bg-[#b39412] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : isEditing
              ? "Update Service"
              : "Add Service"}
        </button>

        {!isEditing && (
          <button
            type="button"
            onClick={closeForm}
            disabled={loading}
            className="rounded-xl border border-zinc-800 px-6 py-3 font-medium text-zinc-300 transition hover:border-zinc-600 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}