//app/api/thoughts/[id]/relations/route.ts
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

  const res = await pool.query(`
    SELECT
      r.id,
      r.from_detail_id,
      r.to_detail_id,
      r.note,
      r.confidence,
      rt.name as type_name,

      df.text as from_text,
      dt.text as to_text

    FROM relations r
    JOIN relation_types rt ON rt.id = r.relation_type_id
    JOIN details df ON df.id = r.from_detail_id
    JOIN details dt ON dt.id = r.to_detail_id

    WHERE df.thought_id = $1
       OR dt.thought_id = $1

    ORDER BY r.id DESC
  `, [numId]);

  return NextResponse.json(res.rows);
}
