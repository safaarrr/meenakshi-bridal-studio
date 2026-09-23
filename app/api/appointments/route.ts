import { NextResponse } from "next/server";
import { db } from "../../../src/prisma/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      phone,
      service,
      appointmentDate,
      appointmentTime,
      message,
    } = body;

    if (
      !name ||
      !phone ||
      !service ||
      !appointmentDate ||
      !appointmentTime
    ) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    const appointment = await db.orm.public.Appointment.create({
     
        name,
        phone,
        service,
        appointmentDate,
        appointmentTime,
        message: message || null,
        status: "PENDING",
      
    });

    return NextResponse.json(
      {
        message: "Appointment request submitted successfully.",
        appointment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create appointment error:", error);

    return NextResponse.json(
      { error: "Failed to create appointment." },
      { status: 500 }
    );
  }
}