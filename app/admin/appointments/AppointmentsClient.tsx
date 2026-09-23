"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Appointment = {
  id: number;
  name: string;
  phone: string;
  service: string;
  appointmentDate: string;
  appointmentTime: string;
  message?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type FilterType =
  | "ALL"
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "COMPLETED";

const filters: FilterType[] = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "REJECTED",
  "COMPLETED",
];

function formatDate(dateString: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(`${dateString}T00:00:00`));
  } catch {
    return dateString;
  }
}

function formatTime(timeString: string) {
  try {
    const [hours, minutes] = timeString.split(":");

    const date = new Date();
    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));

    return new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return timeString;
  }
}

function statusClasses(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

    case "REJECTED":
      return "border-red-500/20 bg-red-500/10 text-red-400";

    case "COMPLETED":
      return "border-blue-500/20 bg-blue-500/10 text-blue-400";

    default:
      return "border-[#9c810c]/30 bg-[#9c810c]/10 text-[#c9a91a]";
  }
}

export default function AppointmentsClient() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<FilterType>("ALL");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [error, setError] = useState("");

  async function loadAppointments(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch("/api/admin/appointments", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load appointments."
        );
      }

      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Appointments loading error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load appointments."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function updateAppointmentStatus(
    id: number,
    status: "CONFIRMED" | "REJECTED" | "COMPLETED"
  ) {
    try {
      setUpdatingId(id);
      setError("");

      const response = await fetch(
        "/api/admin/appointments",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update appointment."
        );
      }

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === id
            ? {
                ...appointment,
                status,
              }
            : appointment
        )
      );
    } catch (error) {
      console.error(
        "Appointment status update error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update appointment."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  const filteredAppointments = useMemo(() => {
    if (filter === "ALL") {
      return appointments;
    }

    return appointments.filter(
      (appointment) => appointment.status === filter
    );
  }, [appointments, filter]);

  const counts = useMemo(() => {
    return {
      all: appointments.length,

      pending: appointments.filter(
        (appointment) =>
          appointment.status === "PENDING"
      ).length,

      confirmed: appointments.filter(
        (appointment) =>
          appointment.status === "CONFIRMED"
      ).length,

      rejected: appointments.filter(
        (appointment) =>
          appointment.status === "REJECTED"
      ).length,

      completed: appointments.filter(
        (appointment) =>
          appointment.status === "COMPLETED"
      ).length,
    };
  }, [appointments]);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* ===================================================== */}
      {/* SIDEBAR */}
      {/* ===================================================== */}

      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-white/10 bg-[#080808] lg:block">
        {/* Logo */}

        <div className="border-b border-white/10 p-6">
          <Link href="/" className="block">
            <h1 className="text-xl font-bold tracking-[0.18em] text-[#9c810c]">
              MEENAKSHI
            </h1>

            <p className="mt-1 text-[9px] tracking-[0.25em] text-white/40">
              ADMIN PANEL
            </p>
          </Link>
        </div>

        {/* Navigation */}

        <nav className="p-4">
          <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/30">
            Management
          </p>

          <div className="space-y-1">
            <Link
              href="/admin"
              className="block w-full rounded-lg px-4 py-3 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/appointments"
              className="block w-full rounded-lg bg-[#9c810c] px-4 py-3 text-sm font-semibold text-white"
            >
              Appointments
            </Link>

            <Link
              href="/admin/services"
              className="block w-full rounded-lg px-4 py-3 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
            >
              Services
            </Link>

            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-lg px-4 py-3 text-left text-sm text-white/25"
            >
              Portfolio
            </button>

            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-lg px-4 py-3 text-left text-sm text-white/25"
            >
              Marquee
            </button>

            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-lg px-4 py-3 text-left text-sm text-white/25"
            >
              Settings
            </button>
          </div>
        </nav>

        {/* Bottom */}

        <div className="absolute bottom-0 left-0 w-full border-t border-white/10 p-4">
          <Link
            href="/"
            className="block rounded-lg px-4 py-3 text-sm text-white/45 transition hover:bg-white/5 hover:text-white"
          >
            ← Back to Website
          </Link>
        </div>
      </aside>

      {/* ===================================================== */}
      {/* MOBILE HEADER */}
      {/* ===================================================== */}

      <div className="sticky top-0 z-30 border-b border-white/10 bg-[#080808]/95 px-5 py-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold tracking-[0.15em] text-[#9c810c]">
              MEENAKSHI
            </p>

            <p className="text-[8px] tracking-[0.25em] text-white/40">
              ADMIN PANEL
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/60"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* ===================================================== */}
      {/* MAIN CONTENT */}
      {/* ===================================================== */}

      <section className="min-h-screen lg:ml-64">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {/* Header */}

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9c810c]">
                Management
              </p>

              <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                Appointments
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
                View and manage appointment requests
                submitted through the Meenakshi Bridal
                Studio website.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadAppointments(true)}
              disabled={refreshing}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/70 transition hover:border-[#9c810c]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>
          </div>

          {/* ================================================= */}
          {/* SUMMARY CARDS */}
          {/* ================================================= */}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {/* ALL */}

            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={`rounded-2xl border p-5 text-left transition ${
                filter === "ALL"
                  ? "border-[#9c810c]/50 bg-[#9c810c]/10"
                  : "border-white/10 bg-[#080808] hover:border-white/20"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                All
              </p>

              <p className="mt-3 text-3xl font-semibold text-white">
                {counts.all}
              </p>

              <p className="mt-1 text-xs text-white/35">
                Total bookings
              </p>
            </button>

            {/* PENDING */}

            <button
              type="button"
              onClick={() => setFilter("PENDING")}
              className={`rounded-2xl border p-5 text-left transition ${
                filter === "PENDING"
                  ? "border-[#9c810c]/50 bg-[#9c810c]/10"
                  : "border-white/10 bg-[#080808] hover:border-white/20"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                Pending
              </p>

              <p className="mt-3 text-3xl font-semibold text-[#c9a91a]">
                {counts.pending}
              </p>

              <p className="mt-1 text-xs text-white/35">
                Awaiting action
              </p>
            </button>

            {/* CONFIRMED */}

            <button
              type="button"
              onClick={() => setFilter("CONFIRMED")}
              className={`rounded-2xl border p-5 text-left transition ${
                filter === "CONFIRMED"
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-white/10 bg-[#080808] hover:border-white/20"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                Confirmed
              </p>

              <p className="mt-3 text-3xl font-semibold text-emerald-400">
                {counts.confirmed}
              </p>

              <p className="mt-1 text-xs text-white/35">
                Confirmed bookings
              </p>
            </button>

            {/* REJECTED */}

            <button
              type="button"
              onClick={() => setFilter("REJECTED")}
              className={`rounded-2xl border p-5 text-left transition ${
                filter === "REJECTED"
                  ? "border-red-500/40 bg-red-500/10"
                  : "border-white/10 bg-[#080808] hover:border-white/20"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                Rejected
              </p>

              <p className="mt-3 text-3xl font-semibold text-red-400">
                {counts.rejected}
              </p>

              <p className="mt-1 text-xs text-white/35">
                Rejected bookings
              </p>
            </button>

            {/* COMPLETED */}

            <button
              type="button"
              onClick={() => setFilter("COMPLETED")}
              className={`rounded-2xl border p-5 text-left transition ${
                filter === "COMPLETED"
                  ? "border-blue-500/40 bg-blue-500/10"
                  : "border-white/10 bg-[#080808] hover:border-white/20"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                Completed
              </p>

              <p className="mt-3 text-3xl font-semibold text-blue-400">
                {counts.completed}
              </p>

              <p className="mt-1 text-xs text-white/35">
                Finished appointments
              </p>
            </button>
          </div>

          {/* ================================================= */}
          {/* FILTER BAR */}
          {/* ================================================= */}

          <div className="mt-8 flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  filter === item
                    ? "bg-[#9c810c] text-black"
                    : "border border-white/10 bg-[#080808] text-white/50 hover:border-white/20 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* ================================================= */}
          {/* ERROR */}
          {/* ================================================= */}

          {error && (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* ================================================= */}
          {/* LOADING */}
          {/* ================================================= */}

          {loading ? (
            <div className="mt-8 rounded-3xl border border-white/10 bg-[#080808] p-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#9c810c]" />

              <p className="mt-4 text-sm text-white/40">
                Loading appointments...
              </p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            /* ================================================= */
            /* EMPTY */
            /* ================================================= */

            <div className="mt-8 rounded-3xl border border-white/10 bg-[#080808] p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#9c810c]/30 bg-[#9c810c]/10 text-2xl">
                📅
              </div>

              <h3 className="mt-5 text-xl font-semibold text-white">
                No appointments found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
                {filter === "ALL"
                  ? "When customers submit an appointment through the website, their booking will appear here."
                  : `There are currently no ${filter.toLowerCase()} appointments.`}
              </p>
            </div>
          ) : (
            /* ================================================= */
            /* APPOINTMENT LIST */
            /* ================================================= */

            <div className="mt-8 space-y-4">
              {filteredAppointments.map(
                (appointment) => (
                  <article
                    key={appointment.id}
                    className="rounded-3xl border border-white/10 bg-[#080808] p-5 transition hover:border-white/15 sm:p-7"
                  >
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                      {/* CUSTOMER INFORMATION */}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-semibold text-white">
                            {appointment.name}
                          </h3>

                          <span
                            className={`rounded-full border px-3 py-1 text-[10px] font-bold tracking-[0.15em] ${statusClasses(
                              appointment.status
                            )}`}
                          >
                            {appointment.status}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-white/40">
                          Appointment #
                          {appointment.id}
                        </p>

                        {/* DETAILS */}

                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          {/* SERVICE */}

                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                              Service
                            </p>

                            <p className="mt-1 text-sm font-medium text-[#c9a91a]">
                              {appointment.service}
                            </p>
                          </div>

                          {/* PHONE */}

                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                              Phone
                            </p>

                            <a
                              href={`tel:${appointment.phone}`}
                              className="mt-1 block text-sm font-medium text-white transition hover:text-[#9c810c]"
                            >
                              {appointment.phone}
                            </a>
                          </div>

                          {/* DATE */}

                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                              Date
                            </p>

                            <p className="mt-1 text-sm font-medium text-white">
                              {formatDate(
                                appointment.appointmentDate
                              )}
                            </p>
                          </div>

                          {/* TIME */}

                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                              Time
                            </p>

                            <p className="mt-1 text-sm font-medium text-white">
                              {formatTime(
                                appointment.appointmentTime
                              )}
                            </p>
                          </div>
                        </div>

                        {/* CUSTOMER MESSAGE */}

                        {appointment.message && (
                          <div className="mt-6 rounded-2xl border border-white/5 bg-black p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                              Customer Message
                            </p>

                            <p className="mt-2 text-sm leading-6 text-white/55">
                              {appointment.message}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* ================================================= */}
                      {/* ACTIONS */}
                      {/* ================================================= */}

                      <div className="flex shrink-0 flex-wrap gap-2 xl:w-48 xl:flex-col">
                        {/* CALL */}

                        <a
                          href={`tel:${appointment.phone}`}
                          className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-center text-xs font-semibold text-white/60 transition hover:border-[#9c810c]/50 hover:text-[#9c810c] xl:flex-none"
                        >
                          📞 Call
                        </a>

                        {/* WHATSAPP */}

                        <a
                          href={`https://wa.me/${appointment.phone.replace(
                            /\D/g,
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-center text-xs font-semibold text-white/60 transition hover:border-[#9c810c]/50 hover:text-[#9c810c] xl:flex-none"
                        >
                          💬 WhatsApp
                        </a>

                        {/* ================================================= */}
                        {/* PENDING ACTIONS */}
                        {/* ================================================= */}

                        {appointment.status ===
                          "PENDING" && (
                          <div className="grid w-full grid-cols-2 gap-2">
                            {/* CONFIRM */}

                            <button
                              type="button"
                              disabled={
                                updatingId ===
                                appointment.id
                              }
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment.id,
                                  "CONFIRMED"
                                )
                              }
                              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {updatingId ===
                              appointment.id
                                ? "..."
                                : "✓ CONFIRM"}
                            </button>

                            {/* REJECT */}

                            <button
                              type="button"
                              disabled={
                                updatingId ===
                                appointment.id
                              }
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment.id,
                                  "REJECTED"
                                )
                              }
                              className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-3 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {updatingId ===
                              appointment.id
                                ? "..."
                                : "✕ REJECT"}
                            </button>
                          </div>
                        )}

                        {/* ================================================= */}
                        {/* CONFIRMED ACTION */}
                        {/* ================================================= */}

                        {appointment.status ===
                          "CONFIRMED" && (
                          <button
                            type="button"
                            disabled={
                              updatingId ===
                              appointment.id
                            }
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.id,
                                "COMPLETED"
                              )
                            }
                            className="w-full rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {updatingId ===
                            appointment.id
                              ? "UPDATING..."
                              : "✓ MARK COMPLETED"}
                          </button>
                        )}

                        {/* ================================================= */}
                        {/* REJECTED */}
                        {/* ================================================= */}

                        {appointment.status ===
                          "REJECTED" && (
                          <div className="w-full rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-red-400">
                            Appointment Rejected
                          </div>
                        )}

                        {/* ================================================= */}
                        {/* COMPLETED */}
                        {/* ================================================= */}

                        {appointment.status ===
                          "COMPLETED" && (
                          <div className="w-full rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-400">
                            Appointment Completed
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SUBMITTED TIME */}

                    <div className="mt-6 border-t border-white/5 pt-4">
                      <p className="text-[10px] text-white/20">
                        Submitted{" "}
                        {new Date(
                          appointment.createdAt
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}