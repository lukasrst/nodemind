//app/api/relation-types/route.ts
import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const r = await pool.query(`
    SELECT id, name FROM relation_types ORDER BY name
  `);

  return NextResponse.json(r.rows);
}
