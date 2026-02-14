"use client";

import { useState } from "react";

export default function ManageDB() {
  const [sql, setSql] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setResult(null);

    const r = await fetch("/api/sql", {
      method: "POST",
      body: JSON.stringify({ sql }),
    });

    const data = await r.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-10">
      <h1 className="text-3xl font-bold mb-6">DB Manage</h1>

      <textarea
        className="w-full h-48 p-4 rounded bg-neutral-900 font-mono"
        placeholder="SQL hier einfügen..."
        value={sql}
        onChange={e => setSql(e.target.value)}
      />

      <button
        onClick={run}
        disabled={loading}
        className="mt-4 px-6 py-3 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? "läuft..." : "SQL ausführen"}
      </button>

      {result && (
        <div className="mt-8 bg-neutral-900 p-6 rounded-xl overflow-auto">
          {result.error && (
            <div className="text-red-400 whitespace-pre-wrap">
              {result.error}
            </div>
          )}

          {result.rows && (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {result.fields.map((f: string) => (
                    <th key={f} className="text-left p-2 border-b border-neutral-700">
                      {f}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row: any, i: number) => (
                  <tr key={i}>
                    {result.fields.map((f: string) => (
                      <td key={f} className="p-2 border-b border-neutral-800">
                        {String(row[f])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {result.rowCount !== undefined && !result.rows?.length && (
            <div>{result.rowCount} Zeilen betroffen</div>
          )}
        </div>
      )}
    </div>
  );
}
