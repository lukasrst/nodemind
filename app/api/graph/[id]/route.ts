import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const numId = Number(id);

  if (Number.isNaN(numId)) {
    return NextResponse.json(
      { error: "invalid id" },
      { status: 400 }
    );
  }

  const details = await pool.query(`
    SELECT id, text
    FROM details
    WHERE thought_id = $1
  `, [numId]);

  const relations = await pool.query(`
    SELECT
      r.id,
      r.from_detail_id,
      r.to_detail_id,
      rt.name as type
    FROM relations r
    JOIN relation_types rt ON rt.id = r.relation_type_id
    JOIN details d1 ON d1.id = r.from_detail_id
    JOIN details d2 ON d2.id = r.to_detail_id
    WHERE d1.thought_id = $1
       OR d2.thought_id = $1
  `, [numId]);

  return NextResponse.json({
    details: details.rows,
    relations: relations.rows
  });
}
