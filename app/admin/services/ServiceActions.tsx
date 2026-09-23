"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
};

export default function ServiceActions({
  id,
  name,
  description,
  isActive,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateService(data: object) {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/services", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          ...data,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        alert(result.error || "Failed to update service.");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle() {
    await updateService({
      isActive: !isActive,
    });
  }

  async function handleEdit() {
    const newName = window.prompt(
      "Service name:",
      name
    );

    if (newName === null || !newName.trim()) {
      return;
    }

    const newDescription = window.prompt(
      "Description:",
      description || ""
    );

    if (newDescription === null) {
      return;
    }

    await updateService({
      name: newName.trim(),
      description: newDescription.trim(),
    });
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${name}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/services",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        alert(result.error || "Failed to delete service.");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
      <button
        onClick={handleEdit}
        disabled={loading}
        className="rounded-md border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 transition hover:border-[#9c810c] hover:text-white disabled:opacity-50"
      >
        ✏️ Edit
      </button>

      <button
        onClick={handleToggle}
        disabled={loading}
        className="rounded-md border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 transition hover:border-[#9c810c] hover:text-white disabled:opacity-50"
      >
        {isActive ? "⏸ Disable" : "▶ Enable"}
      </button>

      <button
        onClick={handleDelete}
        disabled={loading}
        className="rounded-md border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
      >
        🗑️ Delete
      </button>
    </div>
  );
}