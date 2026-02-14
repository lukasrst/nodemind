"use client";

import { useState } from "react";
import { X, CheckCircle2, Save } from "lucide-react";

interface AddDetailModalProps {
  thoughtId: string | number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddDetailModal({ thoughtId, onClose, onSuccess }: AddDetailModalProps) {
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch("/api/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thought_id: Number(thoughtId), text, note: note || null }),
      });
      onSuccess();
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500" size={20} /> Neue Komponente
          </h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea 
            autoFocus required placeholder="Fakt oder Komponente..."
            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500"
            rows={3} value={text} onChange={e => setText(e.target.value)}
          />
          <input 
            placeholder="Zusatz-Notiz (optional)..."
            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500"
            value={note} onChange={e => setNote(e.target.value)}
          />
          <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 py-4 rounded-2xl font-bold text-white hover:bg-emerald-500 transition-all">
            {isSubmitting ? "Speichert..." : "Hinzufügen"}
          </button>
        </form>
      </div>
    </div>
  );
}