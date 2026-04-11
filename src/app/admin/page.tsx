"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";

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
  const [pageLoading, setPageLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
        setPageLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      let data;
      try {
        data = await res.json();
      } catch {
        data = { error: "Erro interno do servidor" };
      }

      if (res.ok) {
        toast.success("Sucesso! Planilha importada.");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(data.error || `Erro ${res.status}: Problema ao processar.`);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Erro de conexão ou no servidor.");
    } finally {
      setIsUploading(false);
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
    setIsSaving(true);
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(players),
      });
      if (res.ok) {
        toast.success("Mudanças salvas com sucesso!");
      } else {
        toast.error("Erro ao salvar mudanças.");
      }
    } catch {
      toast.error("Erro de conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8 font-sans relative">
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
              disabled={!file || isUploading}
              className="w-full py-2.5 bg-zinc-100 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-500 text-black rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : "Importar"}
            </button>
          </section>

          {/* Info Section */}
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
            disabled={isSaving || isUploading}
            className="px-10 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-500/10 flex items-center gap-2"
          >
            {isSaving && <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </main>
  );
}
