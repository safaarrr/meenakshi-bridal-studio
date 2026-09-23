import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminSession } from "../../../lib/admin-session";
import MarqueeClient from "./MarqueeClient";

export default async function MarqueePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (
    !session?.value ||
    !verifyAdminSession(session.value)
  ) {
    redirect("/admin/login");
  }

  return <MarqueeClient />;
}