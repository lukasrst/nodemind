import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await pool.query("SELECT * FROM relation_types ORDER BY name ASC");
    return NextResponse.json(res.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: "Name fehlt" }, { status: 400 });

    const res = await pool.query(
      "INSERT INTO relation_types (name) VALUES ($1) RETURNING *",
      [name]
    );
    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}