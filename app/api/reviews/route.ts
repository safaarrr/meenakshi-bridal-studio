import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "../../../src/prisma/db";
import { verifyAdminSession } from "../../../lib/admin-session";

async function isAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  return !!session?.value && verifyAdminSession(session.value);
}

/* =========================================================
   PUBLIC — GET ACTIVE REVIEWS
========================================================= */

export async function GET() {
  try {
    const reviews = await db.orm.public.Review
      .where({ isActive: true })
      .all();

    return NextResponse.json(
      reviews.sort((a, b) => a.sortOrder - b.sortOrder)
    );
  } catch (error) {
    console.error("Fetch reviews error:", error);

    return NextResponse.json(
      { error: "Failed to fetch reviews." },
      { status: 500 }
    );
  }
}

/* =========================================================
   ADMIN — CREATE REVIEW
========================================================= */

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const customerName = String(
      body.customerName ?? ""
    ).trim();

    const review = String(
      body.review ?? ""
    ).trim();

    const rating = Number(body.rating);

    const imageUrl =
      body.imageUrl === null ||
      body.imageUrl === undefined ||
      String(body.imageUrl).trim() === ""
        ? null
        : String(body.imageUrl).trim();

    const videoUrl =
      body.videoUrl === null ||
      body.videoUrl === undefined ||
      String(body.videoUrl).trim() === ""
        ? null
        : String(body.videoUrl).trim();

    const sortOrder = Number(body.sortOrder ?? 0);

    if (!customerName) {
      return NextResponse.json(
        { error: "Customer name is required." },
        { status: 400 }
      );
    }

    if (!imageUrl && !videoUrl) {
      return NextResponse.json(
        { error: "Please upload a review image or video." },
        { status: 400 }
      );
    }

    // Image review
    if (imageUrl) {
      if (
        !review ||
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
      ) {
        return NextResponse.json(
          {
            error:
              "Image reviews require review text and a rating from 1 to 5.",
          },
          { status: 400 }
        );
      }
    }

    // Video-only review gets safe database defaults.
    const finalRating =
      Number.isInteger(rating) && rating >= 1 && rating <= 5
        ? rating
        : 5;

    const created = await db.orm.public.Review.create({
      customerName,
      review,
      rating: finalRating,
      imageUrl,
      videoUrl,
      sortOrder: Number.isFinite(sortOrder)
        ? sortOrder
        : 0,
      isActive: body.isActive !== false,
    });

    return NextResponse.json(created, {
      status: 201,
    });
  } catch (error) {
    console.error("Create review error:", error);

    return NextResponse.json(
      { error: "Failed to create review." },
      { status: 500 }
    );
  }
}

/* =========================================================
   ADMIN — UPDATE REVIEW
========================================================= */

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
        { error: "Invalid review ID." },
        { status: 400 }
      );
    }

    const changes: {
      customerName?: string;
      review?: string;
      rating?: number;
      imageUrl?: string | null;
      videoUrl?: string | null;
      isActive?: boolean;
      sortOrder?: number;
    } = {};

    if (body.customerName !== undefined) {
      changes.customerName = String(
        body.customerName
      ).trim();
    }

    if (body.review !== undefined) {
      changes.review = String(
        body.review
      ).trim();
    }

    if (body.rating !== undefined) {
      const rating = Number(body.rating);

      if (
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
      ) {
        return NextResponse.json(
          {
            error: "Rating must be from 1 to 5.",
          },
          { status: 400 }
        );
      }

      changes.rating = rating;
    }

    if (body.imageUrl !== undefined) {
      changes.imageUrl =
        body.imageUrl === null ||
        String(body.imageUrl).trim() === ""
          ? null
          : String(body.imageUrl).trim();
    }

    if (body.videoUrl !== undefined) {
      changes.videoUrl =
        body.videoUrl === null ||
        String(body.videoUrl).trim() === ""
          ? null
          : String(body.videoUrl).trim();
    }

    if (body.isActive !== undefined) {
      changes.isActive = Boolean(
        body.isActive
      );
    }

    if (body.sortOrder !== undefined) {
      changes.sortOrder = Number(
        body.sortOrder
      );
    }

    const updated =
      await db.orm.public.Review
        .where({ id })
        .update(changes);

    if (!updated) {
      return NextResponse.json(
        { error: "Review not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error(
      "Update review error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update review.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   ADMIN — DELETE REVIEW
========================================================= */

export async function DELETE(
  request: NextRequest
) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const id = Number(
      new URL(request.url)
        .searchParams
        .get("id")
    );

    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json(
        { error: "Invalid review ID." },
        { status: 400 }
      );
    }

    const deleted =
      await db.orm.public.Review
        .where({ id })
        .delete();

    if (!deleted) {
      return NextResponse.json(
        { error: "Review not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Delete review error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete review.",
      },
      { status: 500 }
    );
  }
}