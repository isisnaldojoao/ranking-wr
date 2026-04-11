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
        const res = await fetch("/api/data", { cache: 'no-store' });
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8 font-sans relative">
      {/* Subtle Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-[100] animate-slide-up">
          <div className="bg-zinc-900 border border-emerald-500/50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4">
             <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500">✓</div>
             <div>
               <p className="text-xs font-bold text-white uppercase tracking-tight">Dados Salvos</p>
               <p className="text-[10px] text-zinc-500 uppercase">{status?.message}</p>
             </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex justify-between items-end border-b border-zinc-900 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase text-white">Admin Panel</h1>
            <p className="text-zinc-600 text-[9px] uppercase font-bold tracking-[0.2em] mt-0.5">Gestão de Dados do Ranking</p>
          </div>
          <Link href="/" className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] font-bold uppercase transition-all">
            ← Voltar
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Upload Section */}
          <section className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div>
              <h2 className="text-xs font-bold uppercase text-zinc-400">Importar Excel</h2>
              <p className="text-[9px] text-zinc-600 uppercase tracking-tight">Formato .xlsx</p>
            </div>
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-[10px] w-full text-zinc-400 file:bg-zinc-800 file:border-0 file:text-white file:px-3 file:py-1.5 file:rounded file:mr-3 file:text-[9px] file:font-bold file:uppercase"
            />
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full py-2.5 bg-zinc-100 hover:bg-white disabled:bg-zinc-800 text-black rounded-lg text-[10px] font-bold uppercase transition-all"
            >
              {loading ? "Processando..." : "Importar"}
            </button>
          </section>

          {/* Quick Stats or Info could go here if needed, keeping it simple for now */}
          <section className="md:col-span-2 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 flex items-center justify-center text-center">
             <div className="space-y-1">
               <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-relaxed">
                 Edite os campos diretamente na tabela abaixo.<br/>
                 As alterações são salvas apenas ao clicar no botão &quot;Salvar&quot;.
               </p>
             </div>
          </section>
        </div>

        {/* Minimalist Table */}
        <section className="bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto scrollbar-op">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-zinc-900/50 text-[9px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
                  <th className="px-6 py-4">Jogador</th>
                  <th className="px-4 py-4">Elo</th>
                  <th className="px-4 py-4 text-center">Jogos</th>
                  <th className="px-4 py-4 text-center">WR (%)</th>
                  <th className="px-4 py-4 text-center">MVP</th>
                  <th className="px-4 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {players.map((player, idx) => (
                  <tr key={player.id} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="px-6 py-3">
                      <input
                        value={player.name}
                        onChange={(e) => handleEdit(idx, "name", e.target.value)}
                        className="bg-transparent border-b border-transparent focus:border-blue-500 outline-none w-full font-bold uppercase text-zinc-200 transition-all text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={player.rank}
                        onChange={(e) => handleEdit(idx, "rank", e.target.value)}
                        className="bg-transparent border-b border-transparent focus:border-blue-500 outline-none w-full text-xs font-bold text-zinc-400"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={player.matches}
                        onChange={(e) => handleEdit(idx, "matches", parseInt(e.target.value))}
                        className="bg-transparent text-center border-b border-transparent focus:border-blue-500 outline-none w-16 text-xs font-bold text-zinc-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        step="0.1"
                        value={player.winRate}
                        onChange={(e) => handleEdit(idx, "winRate", parseFloat(e.target.value))}
                        className="bg-transparent text-center border-b border-transparent focus:border-blue-500 outline-none w-16 text-xs font-bold text-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={player.stats.mvp}
                        onChange={(e) => handleEdit(idx, "stats", parseInt(e.target.value), "mvp")}
                        className="bg-transparent text-center border-b border-transparent focus:border-blue-500 outline-none w-12 text-xs font-bold text-zinc-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-[9px] font-bold text-zinc-800 uppercase italic-none">
                       Ok
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button
            onClick={saveChanges}
            disabled={loading}
            className="px-10 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-500/10"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </main>
  );
}
