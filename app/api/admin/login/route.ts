import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminSession } from "../../../../lib/admin-session";
import postgres from "@prisma/orm-postgres/runtime";
import contractJson from "../../../../src/prisma/contract.json" with {
  type: "json",
};

const db = postgres({
  contractJson,
  url: process.env.DATABASE_URL!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username =
  typeof body.username === "string" ? body.username : "";

const password =
  typeof body.password === "string" ? body.password : "";
    if (!username || !password) {
      return NextResponse.json(
        {
          error: "Username and password are required.",
        },
        {
          status: 400,
        }
      );
    }

    const admin = await db.orm.public.Admin
      .where({ username })
      .first();

    if (!admin) {
      return NextResponse.json(
        {
          error: "Invalid username or password.",
        },
        {
          status: 401,
        }
      );
    }

    const passwordMatches = await bcrypt.compare(
  password,
  String(admin.passwordHash)
);

    if (!passwordMatches) {
      return NextResponse.json(
        {
          error: "Invalid username or password.",
        },
        {
          status: 401,
        }
      );
    }

    const sessionToken = createAdminSession(username);

const response = NextResponse.json({
  success: true,
});

response.cookies.set("admin_session", sessionToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 8,
});

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong during login.",
      },
      {
        status: 500,
      }
    );
  }
}