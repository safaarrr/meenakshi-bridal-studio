import { NextResponse } from "next/server";
import { db } from "../../../src/prisma/db";

export async function GET() {
  try {
    const portfolio =
      await db.orm.public.Portfolio
        .where({ isActive: true })
        .all();

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error("Fetch portfolio error:", error);

    return NextResponse.json(
      { error: "Failed to fetch portfolio." },
      { status: 500 }
    );
  }
}