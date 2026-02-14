//app/api/sql/route.ts
import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sql } = await req.json();

    if (!sql || typeof sql !== "string") {
      return NextResponse.json({ error: "Kein SQL angegeben" }, { status: 400 });
    }

    const result = await pool.query(sql);

    return NextResponse.json({
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields?.map(f => f.name)
    });

  } catch (e: any) {
    return NextResponse.json({
      error: e.message
    }, { status: 500 });
  }
}
