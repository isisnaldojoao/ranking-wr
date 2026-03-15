"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", message: `Sucesso! ${data.count} jogadores importados.` });
      } else {
        setStatus({ type: "error", message: data.error || "Erro ao processar ficheiro." });
      }
    } catch {
      setStatus({ type: "error", message: "Erro de conexão com o servidor." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0f16] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-black mb-2 tracking-tight">PAINEL DE CONTROLE</h1>
        <p className="text-gray-400 text-sm mb-8 italic">Selecione o arquivo &quot;WILD RIFT.xlsx&quot; para atualizar o ranking.</p>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Excel Spreadsheet</label>
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-black file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 transition-all"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${
              !file || loading
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 to-cyan-500 hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-500/20"
            }`}
          >
            {loading ? "Processando..." : "Atualizar Ranking"}
          </button>

          {status && (
            <div className={`p-4 rounded-xl text-sm font-bold text-center ${
              status.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}>
              {status.message}
            </div>
          )}

          <div className="pt-4 border-t border-white/5 text-center">
            <Link href="/" className="text-xs font-bold text-gray-500 hover:text-indigo-400 transition-colors uppercase tracking-widest">
              ← Voltar ao Ranking
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
