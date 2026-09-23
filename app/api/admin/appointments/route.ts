import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAdminSession } from "../../../../lib/admin-session";
import { db } from "../../../../src/prisma/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");

    if (!session?.value || !verifyAdminSession(session.value)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const appointments =
      await db.orm.public.Appointment.all();

    const sortedAppointments = [...appointments].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    return NextResponse.json(sortedAppointments);
  } catch (error) {
    console.error("Admin appointments fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch appointments." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");

    if (!session?.value || !verifyAdminSession(session.value)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const id = Number(body.id);
    const status = String(body.status || "").toUpperCase();

    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "REJECTED",
      "COMPLETED",
    ];

    if (!id || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid appointment or status." },
        { status: 400 }
      );
    }

    const appointment = await db.orm.public.Appointment
      .where({ id })
      .update({
        status,
      });

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error("Appointment update error:", error);

    return NextResponse.json(
      { error: "Failed to update appointment." },
      { status: 500 }
    );
  }
}