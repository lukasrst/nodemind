"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [rows, setRows] = useState<any[]>([]);

  async function load() {
    const r = await fetch("/api/thoughts");
    setRows(await r.json());
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Thoughts</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {rows.map(t => (
          <Link
            key={t.id}
            href={`/thought/${t.id}`}
            className="bg-neutral-900 p-6 rounded-xl hover:bg-neutral-800 transition block"
          >
            <div className="text-lg font-semibold">{t.title}</div>
            <div className="text-neutral-400 mt-2 line-clamp-3">
              {t.description}
            </div>
            <div className="text-xs text-neutral-500 mt-4">
              #{t.id}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
