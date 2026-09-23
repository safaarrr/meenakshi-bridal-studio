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

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

    const price =
      typeof body.price === "string"
        ? body.price.trim()
        : null;

    const imageUrl =
      typeof body.imageUrl === "string"
        ? body.imageUrl.trim()
        : null;

    const category =
      typeof body.category === "string"
        ? body.category.trim()
        : null;

    if (!name) {
      return NextResponse.json(
        { error: "Service name is required." },
        { status: 400 }
      );
    }

    const service =
      await db.orm.public.Service.create({
        name,
        description,
        price,
        imageUrl,
        category,
        isActive: true,
        sortOrder: 0,
      });

    return NextResponse.json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Create service error:", error);

    return NextResponse.json(
      { error: "Failed to create service." },
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
        { error: "Invalid service ID." },
        { status: 400 }
      );
    }

    const updateData: {
      name?: string;
      description?: string | null;
      price?: string | null;
      imageUrl?: string | null;
      category?: string | null;
      isActive?: boolean;
    } = {};

    if (typeof body.name === "string") {
      updateData.name = body.name.trim();
    }

    if (typeof body.description === "string") {
      updateData.description =
        body.description.trim() || null;
    }

    if (typeof body.price === "string") {
      updateData.price =
        body.price.trim() || null;
    }

    if (typeof body.imageUrl === "string") {
      updateData.imageUrl =
        body.imageUrl.trim() || null;
    }

    if (typeof body.category === "string") {
      updateData.category =
        body.category.trim() || null;
    }

    if (typeof body.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }

    const service =
      await db.orm.public.Service
        .where({ id })
        .update(updateData);

    if (!service) {
      return NextResponse.json(
        { error: "Service not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Update service error:", error);

    return NextResponse.json(
      { error: "Failed to update service." },
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
        { error: "Invalid service ID." },
        { status: 400 }
      );
    }

    const service =
      await db.orm.public.Service
        .where({ id })
        .delete();

    if (!service) {
      return NextResponse.json(
        { error: "Service not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete service error:", error);

    return NextResponse.json(
      { error: "Failed to delete service." },
      { status: 500 }
    );
  }
}