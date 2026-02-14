//app/api/thoughts/[id]/route.ts
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

  const thought = await pool.query(
    `SELECT * FROM thoughts WHERE id=$1`,
    [numId]
  );

  const details = await pool.query(`
    SELECT d.*,
           COUNT(r.id) as relation_count
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
}
