"use client";

import { useState } from "react";
import { 
  Database, 
  Play, 
  Terminal, 
  AlertCircle, 
  CheckCircle2, 
  Table as TableIcon,
  Trash2,
  Download
} from "lucide-react";

export default function ManageDB() {
  const [sql, setSql] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!sql.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const r = await fetch("/api/sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql }),
      });

      const data = await r.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "Netzwerkfehler beim Ausführen des SQL-Befehls." });
    } finally {
      setLoading(false);
    }
  }

  const clearQuery = () => setSql("");

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <Database size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">System Admin</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Database Commander</h1>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={clearQuery}
            className="p-2.5 text-neutral-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            title="Editor leeren"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      {/* SQL Editor Area */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-white/[0.02]">
            <Terminal size={14} className="text-neutral-500" />
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Query Editor</span>
          </div>
          
          <textarea
            className="w-full h-56 p-6 bg-transparent text-blue-50 font-mono text-sm outline-none resize-none placeholder:text-neutral-700"
            placeholder="-- Beispiel: SELECT * FROM thoughts WHERE id = 1;"
            value={sql}
            onChange={e => setSql(e.target.value)}
          />
          
          <div className="p-4 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
            <p className="text-[10px] text-neutral-600 font-mono">
              Drücke auf Ausführen, um die Query an PostgreSQL zu senden.
            </p>
            <button
              onClick={run}
              disabled={loading || !sql.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Play size={16} fill="currentColor" />
              )}
              {loading ? "Wird ausgeführt..." : "Query ausführen"}
            </button>
          </div>
        </div>
      </div>

      {/* Results Area */}
      {result && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-400">
            <TableIcon size={16} />
            <h2>Resultat</h2>
            {result.rowCount !== undefined && (
              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10 ml-2 font-mono">
                {result.rowCount} Zeilen betroffen
              </span>
            )}
          </div>

          <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Error Message */}
            {result.error && (
              <div className="p-6 flex gap-4 bg-red-500/5 text-red-400 border-l-4 border-red-500">
                <AlertCircle className="flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-bold text-sm uppercase tracking-tighter">SQL Error</p>
                  <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed opacity-80">
                    {result.error}
                  </pre>
                </div>
              </div>
            )}

            {/* Success Table */}
            {result.rows && result.rows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.03] border-b border-white/10">
                      {result.fields.map((f: string) => (
                        <th key={f} className="px-4 py-3 text-[10px] font-black text-neutral-500 uppercase tracking-widest font-mono">
                          {f}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {result.rows.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        {result.fields.map((f: string) => (
                          <td key={f} className="px-4 py-3 text-sm font-mono text-neutral-300">
                            {row[f] === null ? (
                              <span className="text-neutral-700 italic">null</span>
                            ) : typeof row[f] === 'boolean' ? (
                              <span className={row[f] ? "text-emerald-500" : "text-red-500"}>
                                {String(row[f])}
                              </span>
                            ) : (
                              String(row[f])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* No Rows Empty State */}
            {result.rowCount !== undefined && (!result.rows || result.rows.length === 0) && !result.error && (
              <div className="p-10 text-center flex flex-col items-center gap-3">
                <CheckCircle2 size={32} className="text-emerald-500 opacity-50" />
                <p className="text-neutral-400 font-medium italic">
                  Befehl erfolgreich ausgeführt. Keine Daten zum Anzeigen vorhanden.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}