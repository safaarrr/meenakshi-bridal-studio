import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "../../../../src/prisma/db";
import { verifyAdminSession } from "../../../../lib/admin-session";

async function checkAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  return !!(
    session?.value &&
    verifyAdminSession(session.value)
  );
}

export async function GET() {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const marquee = await db.orm.public.Marquee
      .all();

    return NextResponse.json(marquee);
  } catch (error) {
    console.error("Admin marquee GET error:", error);

    return NextResponse.json(
      { error: "Failed to load marquee." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const text = String(body.text ?? "").trim();
    const isActive =
      body.isActive !== false;

    if (!text) {
      return NextResponse.json(
        { error: "Marquee text is required." },
        { status: 400 }
      );
    }

    const existing =
      await db.orm.public.Marquee.all();

    let marquee;

    if (existing.length > 0) {
      marquee =
        await db.orm.public.Marquee
          .where({ id: existing[0].id })
          .update({
            text,
            isActive,
          });
    } else {
      marquee =
        await db.orm.public.Marquee.create({
          text,
          isActive,
        });
    }

    return NextResponse.json({
      success: true,
      marquee,
    });
  } catch (error) {
    console.error("Admin marquee POST error:", error);

    return NextResponse.json(
      { error: "Failed to save marquee." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const id = Number(body.id);

    if (!id) {
      return NextResponse.json(
        { error: "Marquee ID is required." },
        { status: 400 }
      );
    }

    const marquee =
      await db.orm.public.Marquee
        .where({ id })
        .update({
          isActive: body.isActive === true,
        });

    return NextResponse.json({
      success: true,
      marquee,
    });
  } catch (error) {
    console.error("Admin marquee PATCH error:", error);

    return NextResponse.json(
      { error: "Failed to update marquee." },
      { status: 500 }
    );
  }
}