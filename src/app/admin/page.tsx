"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Champion {
  name: string;
  winRate: string;
  level: string | number;
}

interface Player {
  id: number;
  name: string;
  rank: string;
  matches: number;
  winRate: number;
  stats: {
    mvp: number;
    s: number;
    a: number;
    lendario: number;
    penta: number;
    quadra: number;
    triple: number;
    firstBlood: number;
  };
  mainChampion: {
    name: string;
    winRate: string;
  };
  allChampions: Champion[];
}

export default function AdminPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Use dynamic fetch to avoid webpack binding issues during data updates
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/data/data.json", { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setPlayers(data);
        }
      } catch (err) {
        console.error("Failed to load admin data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setStatus(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: "success", message: `Sucesso! Planilha importada.` });
        setShowSuccess(true);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setStatus({ type: "error", message: data.error || "Erro ao processar." });
      }
    } catch {
      setStatus({ type: "error", message: "Erro de conexão." });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index: number, field: keyof Player, value: string | number, subfield?: string) => {
    const newPlayers = [...players];
    if (subfield) {
      const parent = newPlayers[index][field] as Record<string, string | number>;
      parent[subfield] = value;
    } else {
      // @ts-expect-error - dynamic field update
      newPlayers[index][field] = value;
    }
    setPlayers(newPlayers);
  };

  const saveChanges = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(players),
      });
      if (res.ok) {
        setStatus({ type: "success", message: "Mudanças salvas com sucesso!" });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setStatus({ type: "error", message: "Erro ao salvar mudanças." });
      }
    } catch {
      setStatus({ type: "error", message: "Erro de conexão." });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f16] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0f16] text-white p-4 md:p-8 font-sans relative">
      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1c253d] border border-emerald-500/30 p-12 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.2)] flex flex-col items-center gap-6 animate-scale-up">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)]">
              <span className="text-5xl">✓</span>
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Sucesso!</h2>
              <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs">{status?.message}</p>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter">DATA MANAGER</h1>
            <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mt-1">Edição manual e upload de planilhas</p>
          </div>
          <Link href="/" className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-black uppercase transition-all">
            ← Ver Ranking
          </Link>
        </header>

        {/* Upload Box */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h2 className="text-sm font-black uppercase mb-1">Upload de Planilha</h2>
            <p className="text-xs text-gray-500 italic">Atualiza tudo de uma vez a partir do Excel.</p>
          </div>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-xs file:bg-indigo-500 file:border-0 file:text-white file:px-3 file:py-1 file:rounded file:mr-3"
          />
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-700 rounded-lg text-xs font-black uppercase transition-all"
          >
            {loading ? "..." : "Importar Excel"}
          </button>
        </section>

        {/* Editable Table */}
        <section className="bg-[#111622] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <th className="px-6 py-4">Jogador</th>
                  <th className="px-4 py-4">Elo</th>
                  <th className="px-4 py-4">Partidas</th>
                  <th className="px-4 py-4">WinRate (%)</th>
                  <th className="px-4 py-4">MVP</th>
                  <th className="px-4 py-4">Penta</th>
                  <th className="px-4 py-4">Main Champ</th>
                  <th className="px-4 py-4">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {players.map((player, idx) => (
                  <tr key={player.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <input
                        value={player.name}
                        onChange={(e) => handleEdit(idx, "name", e.target.value)}
                        className="bg-transparent border-b border-transparent focus:border-indigo-500 outline-none w-32 font-bold uppercase transition-all"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        value={player.rank}
                        onChange={(e) => handleEdit(idx, "rank", e.target.value)}
                        className="bg-transparent border-b border-transparent focus:border-indigo-500 outline-none w-28 text-sm transition-all"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="number"
                        value={player.matches}
                        onChange={(e) => handleEdit(idx, "matches", parseInt(e.target.value))}
                        className="bg-transparent border-b border-transparent focus:border-indigo-500 outline-none w-16 text-sm transition-all"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="number"
                        step="0.1"
                        value={player.winRate}
                        onChange={(e) => handleEdit(idx, "winRate", parseFloat(e.target.value))}
                        className="bg-transparent border-b border-transparent focus:border-indigo-500 outline-none w-16 text-sm transition-all font-mono"
                      />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="number"
                        value={player.stats.mvp}
                        onChange={(e) => handleEdit(idx, "stats", parseInt(e.target.value), "mvp")}
                        className="bg-transparent border-b border-transparent focus:border-indigo-500 outline-none w-12 text-sm text-center"
                      />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="number"
                        value={player.stats.penta}
                        onChange={(e) => handleEdit(idx, "stats", parseInt(e.target.value), "penta")}
                        className="bg-transparent border-b border-transparent focus:border-indigo-500 outline-none w-12 text-sm text-center"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        value={player.mainChampion.name}
                        onChange={(e) => handleEdit(idx, "mainChampion", e.target.value, "name")}
                        className="bg-transparent border-b border-transparent focus:border-indigo-500 outline-none w-24 text-sm font-semibold"
                      />
                    </td>
                    <td className="px-4 py-4 text-xs italic text-gray-700">
                       Disponível
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="flex justify-between items-center py-6">
          {status && (
            <div className={`px-4 py-2 rounded-lg text-xs font-black uppercase ${
              status.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}>
              {status.message}
            </div>
          )}
          <button
            onClick={saveChanges}
            disabled={loading}
            className="ml-auto px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
          >
            {loading ? "Salvando..." : "Salvar Todas as Mudanças"}
          </button>
        </footer>
      </div>
    </main>
  );
}
