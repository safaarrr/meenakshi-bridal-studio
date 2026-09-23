import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import postgres from "@prisma/orm-postgres/runtime";
import contractJson from "../../../../src/prisma/contract.json" with {
  type: "json",
};

import { verifyAdminSession } from "../../../../lib/admin-session";

const db = postgres({
  contractJson,
  url: process.env.DATABASE_URL!,
});

async function checkAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  return !!(
    session?.value &&
    verifyAdminSession(session.value)
  );
}

/* ================= GET ================= */

export async function GET() {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const portfolio =
      await db.orm.public.Portfolio.all();

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error("Fetch portfolio error:", error);

    return NextResponse.json(
      { error: "Failed to load portfolio." },
      { status: 500 }
    );
  }
}

/* ================= CREATE ================= */

export async function POST(request: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const type =
      typeof body.type === "string"
        ? body.type.trim().toUpperCase()
        : "";

    const url =
      typeof body.url === "string"
        ? body.url.trim()
        : "";

    if (!url) {
      return NextResponse.json(
        { error: "Portfolio URL is required." },
        { status: 400 }
      );
    }

    if (type !== "IMAGE" && type !== "VIDEO") {
      return NextResponse.json(
        {
          error:
            "Portfolio type must be IMAGE or VIDEO.",
        },
        { status: 400 }
      );
    }

    const portfolio =
      await db.orm.public.Portfolio.create({
        type,
        url,
        isActive: true,
        sortOrder: 0,
      });

    return NextResponse.json({
      success: true,
      portfolio,
    });
  } catch (error) {
    console.error("Create portfolio error:", error);

    return NextResponse.json(
      { error: "Failed to create portfolio item." },
      { status: 500 }
    );
  }
}

/* ================= UPDATE ================= */

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

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        { error: "Invalid portfolio ID." },
        { status: 400 }
      );
    }

    const updateData: {
      type?: string;
      url?: string;
      isActive?: boolean;
      sortOrder?: number;
    } = {};

    if (typeof body.type === "string") {
      const type =
        body.type.trim().toUpperCase();

      if (
        type !== "IMAGE" &&
        type !== "VIDEO"
      ) {
        return NextResponse.json(
          {
            error:
              "Portfolio type must be IMAGE or VIDEO.",
          },
          { status: 400 }
        );
      }

      updateData.type = type;
    }

    if (typeof body.url === "string") {
      updateData.url = body.url.trim();
    }

    if (typeof body.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }

    if (typeof body.sortOrder === "number") {
      updateData.sortOrder = body.sortOrder;
    }

    const portfolio =
      await db.orm.public.Portfolio
        .where({ id })
        .update(updateData);

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio item not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      portfolio,
    });
  } catch (error) {
    console.error("Update portfolio error:", error);

    return NextResponse.json(
      { error: "Failed to update portfolio item." },
      { status: 500 }
    );
  }
}

/* ================= DELETE ================= */

export async function DELETE(request: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const id = Number(body.id);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        { error: "Invalid portfolio ID." },
        { status: 400 }
      );
    }

    const portfolio =
      await db.orm.public.Portfolio
        .where({ id })
        .delete();

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio item not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete portfolio error:", error);

    return NextResponse.json(
      { error: "Failed to delete portfolio item." },
      { status: 500 }
    );
  }
}