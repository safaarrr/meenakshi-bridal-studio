import { NextResponse } from "next/server";
import { db } from "../../../src/prisma/db";

export async function GET() {
  try {
    const marquee = await db.orm.public.Marquee
      .where({ isActive: true })
      .all();

    return NextResponse.json(marquee);
  } catch (error) {
    console.error("Fetch marquee error:", error);

    return NextResponse.json(
      { error: "Failed to fetch marquee." },
      { status: 500 }
    );
  }
}