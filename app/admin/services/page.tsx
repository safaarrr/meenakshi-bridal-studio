import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import ServiceActions from "./ServiceActions";
import { verifyAdminSession } from "../../../lib/admin-session";
import { db } from "../../../src/prisma/db";

import ServiceForm from "./ServiceForm";

export default async function ServicesPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session?.value || !verifyAdminSession(session.value)) {
    redirect("/admin/login");
  }

  const services = await db.orm.public.Service.all();

  return (
    <main className="min-h-screen bg-black text-white">
      {/* TOP BAR */}
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 lg:px-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#9c810c]">
            Services
          </p>

          <h1 className="mt-2 text-2xl font-bold">
            Manage Services
          </h1>
        </div>

        <Link
          href="/admin"
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:border-[#9c810c]/50 hover:text-white"
        >
          ← Dashboard
        </Link>
      </header>

      {/* CONTENT */}
      <div className="p-6 lg:p-10">

        {/* ADD SERVICE */}
        <div className="mb-10">
          <h2 className="text-xl font-bold">
            Add Service
          </h2>

          <p className="mt-1 text-sm text-white/35">
            Add a new service to your salon.
          </p>

          <ServiceForm />
        </div>

        {/* SERVICES LIST */}
        <div>
          <div className="mb-5">
            <h2 className="text-xl font-bold">
              Salon Services
            </h2>

            <p className="mt-1 text-sm text-white/35">
              Services currently saved in your database.
            </p>
          </div>

          {services.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-[#080808] p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#9c810c]/10 text-2xl">
                ✨
              </div>

              <h3 className="mt-6 text-lg font-bold">
                No services yet
              </h3>

              <p className="mt-2 text-sm text-white/35">
                Add your first salon service using the form above.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="rounded-xl border border-white/10 bg-[#080808] p-6 transition hover:border-[#9c810c]/50"
                >
                  {/* IMAGE */}
                  {service.imageUrl ? (
                    <img
                      src={String(service.imageUrl)}
                      alt={String(service.name)}
                      className="mb-5 h-48 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="mb-5 flex h-48 w-full items-center justify-center rounded-lg bg-white/5 text-3xl">
                      ✨
                    </div>
                  )}

                  {/* NAME */}
                  <h3 className="text-lg font-bold">
                    {String(service.name)}
                  </h3>

                  {/* DESCRIPTION */}
                  {service.description && (
                    <p className="mt-2 text-sm leading-6 text-white/40">
                      {String(service.description)}
                    </p>
                  )}

                  {/* PRICE */}
                  {service.price && (
                    <p className="mt-4 font-semibold text-[#9c810c]">
                      {String(service.price)}
                    </p>
                  )}

                  {/* STATUS */}
                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                    <span
                      className={
                        service.isActive
                          ? "text-xs font-semibold text-green-400"
                          : "text-xs font-semibold text-red-400"
                      }
                    >
                      {service.isActive ? "● Active" : "● Inactive"}
                    </span>

                    <span className="text-xs text-white/25">
                      ID: {String(service.id)}
                    </span>
                  </div>
                  <ServiceActions
  id={Number(service.id)}
  name={String(service.name)}
  description={
    service.description
      ? String(service.description)
      : null
  }


  isActive={Boolean(service.isActive)}
/>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}