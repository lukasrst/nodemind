import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const thoughts = await pool.query(`
    SELECT id, title, description
    FROM thoughts
    ORDER BY id
  `);

  const details = await pool.query(`
    SELECT id, text, note, thought_id
    FROM details
    ORDER BY id
  `);

  const relations = await pool.query(`
    SELECT
      r.id,
      r.from_detail_id,
      r.to_detail_id,
      r.note,
      r.confidence,
      rt.name as type_name
    FROM relations r
    JOIN relation_types rt ON rt.id = r.relation_type_id
    ORDER BY r.id
  `);

  const relationTypes = await pool.query(`
    SELECT id, name
    FROM relation_types
    ORDER BY name
  `);

  return NextResponse.json({
    thoughts: thoughts.rows,
    details: details.rows,
    relations: relations.rows,
    relationTypes: relationTypes.rows,
  });
}
