"use client";

import { useState } from "react";
import { X, Edit3 } from "lucide-react";

interface EditThoughtModalProps {
  thought: { id: number; title: string; description: string };
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditThoughtModal({ thought, onClose, onSuccess }: EditThoughtModalProps) {
  const [title, setTitle] = useState(thought.title);
  const [description, setDescription] = useState(thought.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch(`/api/thoughts/${thought.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      onSuccess();
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Edit3 className="text-blue-500" size={20} /> Gedanken bearbeiten
          </h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            required className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500"
            value={title} onChange={e => setTitle(e.target.value)}
          />
          <textarea 
            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500"
            rows={4} value={description} onChange={e => setDescription(e.target.value)}
          />
          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 py-4 rounded-2xl font-bold text-white">
            {isSubmitting ? "Speichert..." : "Speichern"}
          </button>
        </form>
      </div>
    </div>
  );
}