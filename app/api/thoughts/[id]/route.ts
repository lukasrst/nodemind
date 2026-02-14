// app/api/thoughts/[id]/route.ts
import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

// GET: Lädt den Gedanken und alle zugehörigen Komponenten (Details)
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const numId = Number(id);

  if (Number.isNaN(numId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  try {
    // 1. Den Hauptgedanken abrufen
    const thought = await pool.query(
      `SELECT * FROM thoughts WHERE id=$1`,
      [numId]
    );

    if (thought.rows.length === 0) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    // 2. Alle Details inklusive der Anzahl ihrer Verbindungen abrufen
    const details = await pool.query(`
      SELECT d.*, 
             COUNT(r.id)::int as relation_count
      FROM details d
      LEFT JOIN relations r 
        ON r.from_detail_id = d.id OR r.to_detail_id = d.id
      WHERE d.thought_id = $1
      GROUP BY d.id
      ORDER BY d.id
    `, [numId]);

    return NextResponse.json({
      thought: thought.rows[0],
      details: details.rows
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Aktualisiert Titel und Beschreibung (Metadaten) des Gedankens
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const numId = Number(id);

  if (Number.isNaN(numId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  try {
    const { title, description } = await req.json();

    const result = await pool.query(
      `UPDATE thoughts 
       SET title = $1, description = $2 
       WHERE id = $3 
       RETURNING *`,
      [title, description, numId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "thought not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}