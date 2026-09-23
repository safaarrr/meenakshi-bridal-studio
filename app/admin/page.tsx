import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyAdminSession } from "../../lib/admin-session";
import { db } from "../../src/prisma/db";

type Appointment = {
  id: number;
  name: string;
  phone: string;
  service: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

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

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session?.value || !verifyAdminSession(session.value)) {
    redirect("/admin/login");
  }

  let appointments: Appointment[] = [];
  let portfolioCount = 0;
  let activeServicesCount = 0;

  try {
    const appointmentData = await db.orm.public.Appointment.all();

    appointments = [...appointmentData].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    ) as Appointment[];

    const activeServices = await db.orm.public.Service
      .where({ isActive: true })
      .all();

    activeServicesCount = activeServices.length;

    const activePortfolio = await db.orm.public.Portfolio
      .where({ isActive: true })
      .all();

    portfolioCount = activePortfolio.length;
  } catch (error) {
    console.error("Admin dashboard data error:", error);
  }

  const appointmentCount = appointments.length;

  const pendingCount = appointments.filter(
    (appointment) => appointment.status === "PENDING"
  ).length;

  const confirmedCount = appointments.filter(
    (appointment) => appointment.status === "CONFIRMED"
  ).length;

  const rejectedCount = appointments.filter(
    (appointment) => appointment.status === "REJECTED"
  ).length;

  const completedCount = appointments.filter(
    (appointment) => appointment.status === "COMPLETED"
  ).length;

  const recentAppointments = appointments.slice(0, 5);

  const navLink =
    "block w-full rounded-lg px-4 py-3 text-left text-sm text-white/55 transition hover:bg-white/5 hover:text-white";

  return (
    <main className="min-h-screen bg-black text-white">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-white/10 bg-[#080808] lg:block">
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

        <nav className="p-4">
          <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/30">
            Management
          </p>

          <div className="space-y-1">
            <Link
              href="/admin"
              className="block w-full rounded-lg bg-[#9c810c] px-4 py-3 text-left text-sm font-semibold text-white"
            >
              Dashboard
            </Link>

            <Link href="/admin/appointments" className={navLink}>
              Appointments
            </Link>

            <Link href="/admin/portfolio" className={navLink}>
              Portfolio
            </Link>

            <Link href="/admin/services" className={navLink}>
              Services
            </Link>

            <Link href="/admin/marquee" className={navLink}>
              Marquee
            </Link>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 w-full border-t border-white/10 p-4">
          <Link
            href="/"
            className="block rounded-lg px-4 py-3 text-sm text-white/45 transition hover:bg-white/5 hover:text-white"
          >
            ← View Website
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <section className="lg:ml-64">
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#9c810c]">
              Admin Dashboard
            </p>
            <h2 className="mt-2 text-2xl font-bold">Welcome back</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">Administrator</p>
              <p className="text-xs text-white/35">Meenakshi Studio</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9c810c] font-bold">
              M
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-10">
          <div className="mb-8">
            <p className="text-sm text-white/40">
              Here&apos;s what&apos;s happening with your website.
            </p>
          </div>

          {/* MAIN STATS */}
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/admin/appointments"
              className="group rounded-2xl border border-white/10 bg-[#080808] p-6 transition hover:border-[#9c810c]/50 hover:bg-[#0d0d0d]"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                  Appointments
                </p>
                <span className="text-white/20 transition group-hover:translate-x-1">
                  →
                </span>
              </div>

              <p className="mt-5 text-4xl font-bold text-[#9c810c]">
                {appointmentCount}
              </p>

              <p className="mt-2 text-xs text-white/30">
                Total bookings
              </p>
            </Link>

            <Link
              href="/admin/portfolio"
              className="group rounded-2xl border border-white/10 bg-[#080808] p-6 transition hover:border-[#9c810c]/50 hover:bg-[#0d0d0d]"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                  Portfolio
                </p>
                <span className="text-white/20 transition group-hover:translate-x-1">
                  →
                </span>
              </div>

              <p className="mt-5 text-4xl font-bold text-[#9c810c]">
                {portfolioCount}
              </p>

              <p className="mt-2 text-xs text-white/30">
                Photos &amp; videos
              </p>
            </Link>

            <Link
              href="/admin/services"
              className="group rounded-2xl border border-white/10 bg-[#080808] p-6 transition hover:border-[#9c810c]/50 hover:bg-[#0d0d0d]"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                  Services
                </p>
                <span className="text-white/20 transition group-hover:translate-x-1">
                  →
                </span>
              </div>

              <p className="mt-5 text-4xl font-bold text-[#9c810c]">
                {activeServicesCount}
              </p>

              <p className="mt-2 text-xs text-white/30">
                Active services
              </p>
            </Link>
          </div>

          {/* APPOINTMENT STATUS */}
          <section className="mt-10">
            <div className="mb-5">
              <h3 className="text-xl font-bold">Appointment Status</h3>
              <p className="mt-1 text-sm text-white/35">
                Overview of your current bookings.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Link
                href="/admin/appointments"
                className="rounded-2xl border border-[#9c810c]/20 bg-[#9c810c]/5 p-5 transition hover:border-[#9c810c]/50"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                  Pending
                </p>
                <p className="mt-3 text-3xl font-bold text-[#c9a91a]">
                  {pendingCount}
                </p>
                <p className="mt-1 text-xs text-white/30">
                  Awaiting action
                </p>
              </Link>

              <Link
                href="/admin/appointments"
                className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 transition hover:border-emerald-500/40"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                  Confirmed
                </p>
                <p className="mt-3 text-3xl font-bold text-emerald-400">
                  {confirmedCount}
                </p>
                <p className="mt-1 text-xs text-white/30">
                  Confirmed bookings
                </p>
              </Link>

              <Link
                href="/admin/appointments"
                className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 transition hover:border-red-500/40"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                  Rejected
                </p>
                <p className="mt-3 text-3xl font-bold text-red-400">
                  {rejectedCount}
                </p>
                <p className="mt-1 text-xs text-white/30">
                  Rejected bookings
                </p>
              </Link>

              <Link
                href="/admin/appointments"
                className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 transition hover:border-blue-500/40"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                  Completed
                </p>
                <p className="mt-3 text-3xl font-bold text-blue-400">
                  {completedCount}
                </p>
                <p className="mt-1 text-xs text-white/30">
                  Finished appointments
                </p>
              </Link>
            </div>
          </section>

          {/* RECENT APPOINTMENTS */}
          <section className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-[#080808]">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <h3 className="font-bold">Recent Appointments</h3>
                <p className="mt-1 text-xs text-white/30">
                  Latest customer requests
                </p>
              </div>

              <Link
                href="/admin/appointments"
                className="text-xs font-semibold text-[#9c810c] transition hover:text-white"
              >
                View All →
              </Link>
            </div>

            {recentAppointments.length === 0 ? (
              <div className="flex min-h-40 items-center justify-center p-6">
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-xl">
                    📅
                  </div>
                  <p className="mt-4 text-sm text-white/40">
                    No appointments yet
                  </p>
                  <p className="mt-1 text-xs text-white/20">
                    New bookings will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentAppointments.map((appointment) => (
                  <Link
                    key={appointment.id}
                    href="/admin/appointments"
                    className="block p-5 transition hover:bg-white/[0.02] sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#9c810c]/20 bg-[#9c810c]/10">
                          📅
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-white">
                              {appointment.name}
                            </p>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] ${statusClasses(
                                appointment.status
                              )}`}
                            >
                              {appointment.status}
                            </span>
                          </div>

                          <p className="mt-1 truncate text-xs text-white/35">
                            {appointment.service}
                          </p>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-sm font-medium text-white/70">
                          {formatDate(appointment.appointmentDate)}
                        </p>
                        <p className="mt-1 text-xs text-white/30">
                          {formatTime(appointment.appointmentTime)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
