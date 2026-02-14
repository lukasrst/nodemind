import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const res = await pool.query(`
    SELECT id, title, description, created_at
    FROM thoughts
    ORDER BY created_at DESC
  `);

  return NextResponse.json(res.rows);
}

export async function POST(req: Request) {
  const body = await req.json();

  await pool.query(
    `INSERT INTO thoughts(title, description)
     VALUES ($1,$2)`,
    [body.title, body.description]
  );

  return NextResponse.json({ ok: true });
}
