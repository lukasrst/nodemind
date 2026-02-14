"use client";

import { useState } from "react";
import { X, Trash2, Save } from "lucide-react";

interface EditDetailModalProps {
  detail: { id: number; text: string; note?: string };
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditDetailModal({ detail, onClose, onSuccess }: EditDetailModalProps) {
  const [text, setText] = useState(detail.text);
  const [note, setNote] = useState(detail.note || "");

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/details/${detail.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, note }),
    });
    onSuccess();
  }

  async function handleDelete() {
    if (!confirm("Komponente wirklich löschen?")) return;
    await fetch(`/api/details/${detail.id}`, { method: "DELETE" });
    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Komponente bearbeiten</h2>
          <button onClick={handleDelete} className="text-red-500 p-2 hover:bg-red-500/10 rounded-xl"><Trash2 size={20} /></button>
        </div>
        <form onSubmit={handleUpdate} className="space-y-4">
          <textarea className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white" rows={3} value={text} onChange={e => setText(e.target.value)} />
          <input className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white" value={note} onChange={e => setNote(e.target.value)} />
          <button type="submit" className="w-full bg-emerald-600 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"><Save size={18}/> Speichern</button>
        </form>
      </div>
    </div>
  );
}