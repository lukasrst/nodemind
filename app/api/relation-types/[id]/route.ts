import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

// PATCH: Einen Relationstyp umbenennen
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { name } = await req.json();
    const res = await pool.query(
      "UPDATE relation_types SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );
    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Einen Relationstyp löschen
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Hinweis: Schlägt fehl, wenn der Typ noch in der Tabelle 'relations' verwendet wird (Fremdschlüssel-Constraint)
    await pool.query("DELETE FROM relation_types WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Löschen nicht möglich: Dieser Typ wird noch in aktiven Beziehungen verwendet." 
    }, { status: 400 });
  }
}