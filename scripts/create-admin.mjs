import "dotenv/config";
import bcrypt from "bcryptjs";
import postgres from "@prisma/orm-postgres/runtime";
import contractJson from "../src/prisma/contract.json" with { type: "json" };

const db = postgres({
  contractJson,
  url: process.env.DATABASE_URL,
});

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

if (!username || !password) {
  throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env");
}

const existingAdmin = await db.orm.public.Admin
  .where({ username })
  .first();

if (existingAdmin) {
  console.log(`Admin "${username}" already exists.`);
  await db.close();
  process.exit(0);
}

const passwordHash = await bcrypt.hash(password, 12);

const admin = await db.orm.public.Admin.create({
  username,
  passwordHash,
  name: "Administrator",
});

console.log(`Admin account created successfully: ${admin.username}`);

await db.close();