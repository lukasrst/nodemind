// app/api/relations/route.ts
import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const b = await req.json();

    // WICHTIG: Die Variablennamen müssen mit dem Body aus deinem 
    // Frontend (createRelation Funktion) übereinstimmen:
    const result = await pool.query(`
      INSERT INTO relations
        (from_detail_id, to_detail_id, relation_type_id, note, confidence)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      b.from_detail_id,   // Gemappt auf deinen Frontend-Body
      b.to_detail_id,     // Gemappt auf deinen Frontend-Body
      b.relation_type_id, // Gemappt auf deinen Frontend-Body
      b.note || null,
      b.confidence || null
    ]);

    return NextResponse.json({ ok: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Relation POST Error:", error.message);
    
    // Spezielle Fehlermeldung für den Check-Constraint (Self-Relation)
    if (error.message.includes("chk_not_self_relation")) {
      return NextResponse.json(
        { error: "Ein Element kann keine Beziehung zu sich selbst haben." }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Fehler beim Erstellen der Relation: " + error.message }, 
      { status: 500 }
    );
  }
}