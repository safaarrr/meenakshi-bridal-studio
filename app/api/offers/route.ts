import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "../../../src/prisma/db";
import { verifyAdminSession } from "../../../lib/admin-session";

async function isAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  return !!session?.value && verifyAdminSession(session.value);
}

function parseRate(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const rate = Number(value);

  if (!Number.isFinite(rate) || rate < 0) {
    return NaN;
  }

  return rate;
}

// Public: fetch active offers
export async function GET() {
  try {
    const offers = await db.orm.public.Offer
      .where({ isActive: true })
      .all();

    return NextResponse.json(
      offers.sort((a, b) => a.sortOrder - b.sortOrder)
    );
  } catch (error) {
    console.error("Fetch offers error:", error);

    return NextResponse.json(
      { error: "Failed to fetch offers." },
      { status: 500 }
    );
  }
}

// Admin: create an offer
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const imageUrl = String(body.imageUrl ?? "").trim();
    const sortOrder = Number(body.sortOrder ?? 0);

    const oldRate = parseRate(body.oldRate);
    const newRate = parseRate(body.newRate);

    if (!title) {
      return NextResponse.json(
        { error: "Offer title is required." },
        { status: 400 }
      );
    }

    if (Number.isNaN(oldRate) || Number.isNaN(newRate)) {
      return NextResponse.json(
        { error: "Rates must be valid non-negative numbers." },
        { status: 400 }
      );
    }

    const created = await db.orm.public.Offer.create({
      title,
      description: description || null,
      imageUrl: imageUrl || null,
      oldRate,
      newRate,
      isActive: body.isActive !== false,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Create offer error:", error);

    return NextResponse.json(
      { error: "Failed to create offer." },
      { status: 500 }
    );
  }
}

// Admin: update an offer
export async function PATCH(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const id = Number(body.id);

    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json(
        { error: "Invalid offer ID." },
        { status: 400 }
      );
    }

    const changes: {
      title?: string;
      description?: string | null;
      imageUrl?: string | null;
      oldRate?: number | null;
      newRate?: number | null;
      isActive?: boolean;
      sortOrder?: number;
    } = {};

    if (body.title !== undefined) {
      const title = String(body.title).trim();

      if (!title) {
        return NextResponse.json(
          { error: "Offer title is required." },
          { status: 400 }
        );
      }

      changes.title = title;
    }

    if (body.description !== undefined) {
      changes.description = String(body.description).trim() || null;
    }

    if (body.imageUrl !== undefined) {
      changes.imageUrl = String(body.imageUrl).trim() || null;
    }

    if (body.oldRate !== undefined) {
      const oldRate = parseRate(body.oldRate);

      if (Number.isNaN(oldRate)) {
        return NextResponse.json(
          { error: "Old rate must be a valid non-negative number." },
          { status: 400 }
        );
      }

      changes.oldRate = oldRate;
    }

    if (body.newRate !== undefined) {
      const newRate = parseRate(body.newRate);

      if (Number.isNaN(newRate)) {
        return NextResponse.json(
          { error: "New rate must be a valid non-negative number." },
          { status: 400 }
        );
      }

      changes.newRate = newRate;
    }

    if (body.isActive !== undefined) {
      changes.isActive = Boolean(body.isActive);
    }

    if (body.sortOrder !== undefined) {
      const sortOrder = Number(body.sortOrder);

      if (!Number.isFinite(sortOrder)) {
        return NextResponse.json(
          { error: "Display order must be a valid number." },
          { status: 400 }
        );
      }

      changes.sortOrder = sortOrder;
    }

    const updated = await db.orm.public.Offer
      .where({ id })
      .update(changes);

    if (!updated) {
      return NextResponse.json(
        { error: "Offer not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update offer error:", error);

    return NextResponse.json(
      { error: "Failed to update offer." },
      { status: 500 }
    );
  }
}

// Admin: delete an offer
export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const id = Number(new URL(request.url).searchParams.get("id"));

    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json(
        { error: "Invalid offer ID." },
        { status: 400 }
      );
    }

    const deleted = await db.orm.public.Offer
      .where({ id })
      .delete();

    if (!deleted) {
      return NextResponse.json(
        { error: "Offer not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete offer error:", error);

    return NextResponse.json(
      { error: "Failed to delete offer." },
      { status: 500 }
    );
  }
}