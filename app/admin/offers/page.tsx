import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyAdminSession } from "../../../lib/admin-session";
import { db } from "../../../src/prisma/db";
import OffersClient from "./OffersClient";

export default async function OffersPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session?.value || !verifyAdminSession(session.value)) {
    redirect("/admin/login");
  }

  const offers = await db.orm.public.Offer.all();

  return (
    <OffersClient
      initialOffers={offers.map((offer) => ({
        id: Number(offer.id),
        title: String(offer.title),
        description: offer.description
          ? String(offer.description)
          : "",
        imageUrl: offer.imageUrl
          ? String(offer.imageUrl)
          : "",
        oldRate:
          offer.oldRate == null ? null : Number(offer.oldRate),
        newRate:
          offer.newRate == null ? null : Number(offer.newRate),
        isActive: Boolean(offer.isActive),
        sortOrder: Number(offer.sortOrder),
      }))}
    />
  );
}