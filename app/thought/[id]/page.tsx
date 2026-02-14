"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";


type ThoughtData = {
  thought: any;
  details: any[];
};

export default function ThoughtPage() {
  const params = useParams();
  const thoughtId = params.id as string;


  const [data, setData] = useState<ThoughtData | null>(null);
  const [relations, setRelations] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState("");
  const [note, setNote] = useState("");
  const [conf, setConf] = useState("");

  async function loadAll() {
    const r1 = await fetch(`/api/thoughts/${thoughtId}`);
    const d = await r1.json();
    setData(d);

    const r2 = await fetch(`/api/thoughts/${thoughtId}/relations`);
    setRelations(await r2.json());

    const r3 = await fetch(`/api/relation-types`);
    setTypes(await r3.json());
  }

  async function createRelation() {
    if (!from || !to || !type) return;

    await fetch("/api/relations", {
      method: "POST",
      body: JSON.stringify({
        from: Number(from),
        to: Number(to),
        type: Number(type),
        note: note || null,
        confidence: conf ? Number(conf) : null,
      }),
    });

    setNote("");
    setConf("");
    loadAll();
  }

  useEffect(() => {
    loadAll();
  }, []);

  if (!data) {
    return <div className="text-neutral-400">Lade…</div>;
  }

  return (
    <div className="space-y-10">

      {/* ================= HEADER ================= */}

      <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800">
        <h1 className="text-3xl font-bold">{data.thought.title}</h1>
        {data.thought.description && (
          <p className="text-neutral-400 mt-3">
            {data.thought.description}
          </p>
        )}
      </div>

      {/* ================= DETAILS ================= */}

      <section>
        <h2 className="text-xl font-semibold mb-4">Details</h2>

        <div className="grid gap-4">
          {data.details.map((d) => (
            <div
              key={d.id}
              className="bg-neutral-900 p-5 rounded-xl border border-neutral-800"
            >
              <div className="font-medium">{d.text}</div>

              {d.note && (
                <div className="text-neutral-400 mt-2">{d.note}</div>
              )}

              <div className="text-xs text-neutral-500 mt-3">
                Relations: {d.relation_count}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= RELATIONS ================= */}

      <section className="space-y-6">

        <h2 className="text-xl font-semibold">Relations</h2>

        {/* Create */}

        <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 grid gap-3">

          <select
            className="p-3 bg-neutral-800 rounded"
            value={from}
            onChange={e => setFrom(e.target.value)}
          >
            <option value="">von Detail</option>
            {data.details.map(d => (
              <option key={d.id} value={d.id}>
                {d.text}
              </option>
            ))}
          </select>

          <select
            className="p-3 bg-neutral-800 rounded"
            value={to}
            onChange={e => setTo(e.target.value)}
          >
            <option value="">zu Detail</option>
            {data.details.map(d => (
              <option key={d.id} value={d.id}>
                {d.text}
              </option>
            ))}
          </select>

          <select
            className="p-3 bg-neutral-800 rounded"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option value="">Relationstyp</option>
            {types.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <input
            className="p-3 bg-neutral-800 rounded"
            placeholder="Note (optional)"
            value={note}
            onChange={e => setNote(e.target.value)}
          />

          <input
            className="p-3 bg-neutral-800 rounded"
            placeholder="Confidence 0–1"
            value={conf}
            onChange={e => setConf(e.target.value)}
          />

          <button
            onClick={createRelation}
            className="bg-blue-600 hover:bg-blue-500 rounded-lg p-3 font-medium"
          >
            Relation anlegen
          </button>

        </div>

        {/* List */}

        <div className="grid gap-3">
          {relations.map(r => (
            <div
              key={r.id}
              className="bg-neutral-900 p-4 rounded-xl border border-neutral-800"
            >
              <div className="text-sm text-neutral-400">
                {r.from_text}
              </div>

              <div className="font-semibold text-blue-400">
                {r.type_name}
              </div>

              <div className="text-sm text-neutral-400">
                {r.to_text}
              </div>

              {r.note && (
                <div className="text-xs mt-2 text-neutral-500">
                  {r.note}
                </div>
              )}

              {r.confidence && (
                <div className="text-xs text-neutral-600 mt-1">
                  Confidence: {r.confidence}
                </div>
              )}
            </div>
          ))}
        </div>

      </section>

    </div>
  );
}
