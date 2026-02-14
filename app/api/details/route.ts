import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

// POST: Eine neue Komponente (Detail) zu einem Gedanken hinzufügen
export async function POST(req: Request) {
  try {
    const { thought_id, text, note } = await req.json();

    if (!thought_id || !text) {
      return NextResponse.json({ error: "thought_id und text sind erforderlich" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO details (thought_id, text, note) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [Number(thought_id), text, note || null]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("Fehler in POST /api/details:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}