import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminSession } from "../../../lib/admin-session";
import AppointmentsClient from "./AppointmentsClient";

export default async function AppointmentsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session?.value || !verifyAdminSession(session.value)) {
    redirect("/admin/login");
  }

  return <AppointmentsClient />;
}