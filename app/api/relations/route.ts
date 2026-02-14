import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const b = await req.json();

  await pool.query(`
    INSERT INTO relations
      (from_detail_id, to_detail_id, relation_type_id, note, confidence)
    VALUES ($1,$2,$3,$4,$5)
  `, [
    b.from,
    b.to,
    b.type,
    b.note || null,
    b.confidence || null
  ]);

  return NextResponse.json({ ok: true });
}
