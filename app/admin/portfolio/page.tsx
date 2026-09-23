import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { verifyAdminSession } from "../../../lib/admin-session";
import PortfolioClient from "./PortfolioClient";

export default async function PortfolioPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session?.value || !verifyAdminSession(session.value)) {
    redirect("/admin/login");
  }

  const navLink =
    "block w-full rounded-lg px-4 py-3 text-sm text-white/55 transition hover:bg-white/5 hover:text-white";

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
            <Link href="/admin" className={navLink}>
              Dashboard
            </Link>

            <Link href="/admin/appointments" className={navLink}>
              Appointments
            </Link>

            <Link
              href="/admin/portfolio"
              className="block w-full rounded-lg bg-[#9c810c] px-4 py-3 text-sm font-semibold text-white"
            >
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

      {/* MOBILE HEADER */}
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

      {/* MAIN */}
      <section className="min-h-screen lg:ml-64">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="mb-8 flex items-start justify-between gap-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9c810c]">
                Management
              </p>

              <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                Portfolio
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
                Add and manage the photos and videos displayed on the
                Meenakshi Bridal Studio website.
              </p>
            </div>

            <Link
              href="/admin"
              className="hidden shrink-0 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white/60 transition hover:border-white/20 hover:text-white sm:block"
            >
              × Close
            </Link>
          </div>

          <PortfolioClient />
        </div>
      </section>
    </main>
  );
}
