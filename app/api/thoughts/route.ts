// app/api/thoughts/route.ts
import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

// GET: Alle Gedanken abrufen
export async function GET() {
  try {
    const res = await pool.query(`
      SELECT id, title, description, created_at
      FROM thoughts
      ORDER BY created_at DESC
    `);

    return NextResponse.json(res.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Einen neuen Gedanken anlegen
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validierung: Ein Titel ist laut init.sql Pflicht (NOT NULL)
    if (!body.title) {
      return NextResponse.json({ error: "Titel ist erforderlich" }, { status: 400 });
    }

    // RETURNING * gibt den neu erstellten Datensatz inkl. der generierten ID zurück
    const result = await pool.query(
      `INSERT INTO thoughts (title, description)
       VALUES ($1, $2)
       RETURNING *`,
      [body.title, body.description]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}