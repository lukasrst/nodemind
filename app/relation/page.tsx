"use client";

import { useEffect, useState } from "react";
import { Settings2, Plus, Edit2, Trash2, Tag, X } from "lucide-react";

interface RelationType {
  id: number;
  name: string;
}

export default function RelationTypePage() {
  const [types, setTypes] = useState<RelationType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<RelationType | null>(null);
  const [nameInput, setNameInput] = useState("");

  const loadTypes = async () => {
    const res = await fetch("/api/relation-types");
    const data = await res.json();
    setTypes(data);
  };

  useEffect(() => { loadTypes(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingType ? `/api/relation-types/${editingType.id}` : "/api/relation-types";
    const method = editingType ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameInput }),
    });

    if (res.ok) {
      setNameInput("");
      setEditingType(null);
      setIsModalOpen(false);
      loadTypes();
    }
  };

  const deleteType = async (id: number) => {
    if (!confirm("Typ wirklich löschen?")) return;
    const res = await fetch(`/api/relation-types/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error);
    } else {
      loadTypes();
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Relationstypen</h1>
          <p className="text-neutral-400">Verwalte die logischen Verknüpfungen deines Graphen.</p>
        </div>
        <button 
          onClick={() => { setEditingType(null); setNameInput(""); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-2xl font-bold transition-all"
        >
          <Plus size={20} /> Neuer Typ
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {types.map((t) => (
          <div key={t.id} className="group bg-neutral-900 border border-white/5 p-5 rounded-3xl hover:border-blue-500/50 transition-all shadow-xl">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 mb-4">
                <Tag size={20} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => { setEditingType(t); setNameInput(t.name); setIsModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => deleteType(t.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-neutral-400 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white">{t.name}</h3>
            <p className="text-[10px] font-mono text-neutral-500 mt-1 uppercase tracking-widest">ID: {t.id}</p>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingType ? "Typ bearbeiten" : "Neuer Relationstyp"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-neutral-500 mb-2 ml-1">Name des Typs</label>
                <input 
                  autoFocus
                  className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="z.B. widerspricht"
                />
              </div>
              <button type="submit" className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-blue-500 hover:text-white transition-all">
                {editingType ? "ÄNDERUNGEN SPEICHERN" : "TYP ERSTELLEN"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}