import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

// PATCH: Eine bestehende Komponente aktualisieren
export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { text, note } = await req.json();

    const result = await pool.query(
      `UPDATE details 
       SET text = $1, note = $2 
       WHERE id = $3 
       RETURNING *`,
      [text, note || null, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Komponente nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eine Komponente entfernen
export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Da in deiner init.sql "ON DELETE CASCADE" steht, werden 
    // verbundene Relationen automatisch mitgelöscht.
    await pool.query("DELETE FROM details WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}