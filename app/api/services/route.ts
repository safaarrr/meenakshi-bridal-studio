import { NextResponse } from "next/server";

import { db } from "../../../src/prisma/db";

export async function GET() {
  try {
    const services = await db.orm.public.Service
      .where({ isActive: true })
      .all();

    return NextResponse.json(services);
  } catch (error) {
    console.error("Fetch services error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch services.",
      },
      {
        status: 500,
      }
    );
  }
}