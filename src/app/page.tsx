"use client";

import { useState, useEffect, Fragment } from "react";
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

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Use useEffect to fetch data to avoid webpack module caching/binding issues
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/data", { cache: 'no-store' });
        const data = await res.json();
        setPlayers(data);
      } catch (err) {
        console.error("Failed to load ranking data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRankColor = (rank: string) => {
    if (rank.includes("Diamante")) return "text-cyan-400";
    if (rank.includes("Esmeralda")) return "text-emerald-400";
    if (rank.includes("Platina")) return "text-teal-300";
    if (rank.includes("Ouro")) return "text-yellow-500";
    if (rank.includes("Grão-Mestre")) return "text-red-500";
    if (rank.includes("Mestre")) return "text-purple-400";
    return "text-indigo-400";
  };

  const getChampAsset = (name: string) => {
    const fixedName = name.replace(/\s/g, "");
    return `https://ddragon.leagueoflegends.com/cdn/14.5.1/img/champion/${fixedName}.png`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-sans selection:bg-blue-900/30">
      <nav className="bg-black border-b border-zinc-800 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center font-bold text-white text-xs">WR</div>
          <h1 className="text-sm font-bold tracking-tight uppercase leading-none">
            WildRift.<span className="text-blue-500">GG</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">
            Admin
          </Link>
          <div className="relative group hidden sm:block">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-500 w-40 transition-all text-zinc-300"
            />
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-slide-up">
        
        {/* Simple Header */}
        <header className="py-2 border-b border-zinc-900">
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase">Ladder Ranking</h2>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">
            <span>Brasil</span>
            <span className="text-zinc-800">•</span>
            <span>Season 2026</span>
          </div>
        </header>

        {/* Content Section */}
        <div className="space-y-4">
          
          {/* Mobile View: Simple Cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredPlayers.map((player, index) => (
              <div 
                key={player.id} 
                onClick={() => setExpandedId(expandedId === player.id ? null : player.id)}
                className={`bg-zinc-900/50 border rounded-xl p-4 transition-all ${
                  expandedId === player.id ? "border-blue-500/50 bg-zinc-900" : "border-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-zinc-700 w-6">{index + 1}</span>
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-800">
                      <img 
                        src={getChampAsset(player.mainChampion.name)} 
                        alt="" 
                        className="w-full h-full object-cover grayscale-[0.3]"
                        onError={(e) => (e.currentTarget.src = "https://ddragon.leagueoflegends.com/cdn/14.5.1/img/profileicon/29.png")}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-200 text-sm leading-tight">{player.name}</span>
                      <span className={`text-[9px] font-bold uppercase tracking-tighter ${getRankColor(player.rank)}`}>{player.rank}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{player.winRate}%</div>
                  </div>
                </div>

                {expandedId === player.id && (
                  <div className="pt-4 mt-4 border-t border-zinc-800 space-y-4 animate-slide-up">
                    <div className="grid grid-cols-2 gap-2">
                       <StatItem label="MVP" value={player.stats.mvp} color="text-zinc-100" />
                       <StatItem label="Lendário" value={player.stats.lendario} color="text-zinc-100" />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                       {player.allChampions.slice(0, 3).map((champ, i) => (
                         <div key={i} className="flex-shrink-0 bg-black/40 border border-zinc-800 p-1.5 rounded-lg flex items-center gap-2 pr-3">
                            <img src={getChampAsset(champ.name)} alt="" className="w-5 h-5 rounded grayscale-[0.2]" />
                            <span className="text-[9px] font-bold uppercase text-zinc-400">{champ.name}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop View: Simple Table */}
          <div className="hidden md:block bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/50 text-[9px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
                  <th className="px-6 py-4 w-20">#</th>
                  <th className="px-4 py-4">Invocador</th>
                  <th className="px-4 py-4">Tier</th>
                  <th className="px-4 py-4 text-center">Jogos</th>
                  <th className="px-4 py-4">Win Rate</th>
                  <th className="px-8 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredPlayers.map((player, index) => (
                  <Fragment key={player.id}>
                    <tr 
                      onClick={() => setExpandedId(expandedId === player.id ? null : player.id)}
                      className={`hover:bg-zinc-900/30 transition-colors group cursor-pointer ${
                        expandedId === player.id ? "bg-zinc-900/50" : ""
                      }`}
                    >
                      <td className="px-6 py-5 font-bold text-zinc-700 text-sm">{index + 1}</td>

                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg overflow-hidden border border-zinc-800">
                            <img 
                              src={getChampAsset(player.mainChampion.name)} 
                              alt="" 
                              className="w-full h-full object-cover grayscale-[0.2]"
                              onError={(e) => (e.currentTarget.src = "https://ddragon.leagueoflegends.com/cdn/14.5.1/img/profileicon/29.png")}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-zinc-200 group-hover:text-blue-500 transition-colors uppercase text-sm tracking-tight">{player.name}</span>
                            <span className="text-[8px] text-zinc-600 font-bold uppercase">#ID-{1000 + player.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-5">
                        <span className={`font-bold uppercase text-[9px] tracking-widest ${getRankColor(player.rank)}`}>
                          {player.rank}
                        </span>
                      </td>

                      <td className="px-4 py-5 text-center font-bold text-zinc-400 text-sm">{player.matches}</td>

                      <td className="px-4 py-5">
                        <div className="flex flex-col gap-1 w-24">
                          <div className="text-[10px] font-bold text-zinc-300">{player.winRate}%</div>
                          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-700 ${
                                player.winRate >= 50 ? "bg-blue-600" : "bg-zinc-700"
                              }`}
                              style={{ width: `${player.winRate}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-5 text-right font-bold text-[10px] text-zinc-600 uppercase tracking-widest group-hover:text-white transition-all">
                        {expandedId === player.id ? "Recolher" : "Ver"}
                      </td>
                    </tr>

                    {/* Stats Section Desktop */}
                    {expandedId === player.id && (
                      <tr className="bg-zinc-950/50">
                        <td colSpan={6} className="px-8 py-8 animate-slide-up border-y border-zinc-900">
                          <div className="grid grid-cols-3 gap-12">
                            <div className="space-y-4">
                              <h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Estatísticas</h3>
                              <div className="grid grid-cols-2 gap-3">
                                <StatItem label="MVP" value={player.stats.mvp} color="text-zinc-100" />
                                <StatItem label="Penta" value={player.stats.penta} color="text-zinc-100" />
                                <StatItem label="S-Rank" value={player.stats.s} color="text-zinc-100" />
                                <StatItem label="Lendário" value={player.stats.lendario} color="text-zinc-100" />
                              </div>
                            </div>
                            <div className="space-y-4 col-span-2">
                              <h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Campeões Recentes</h3>
                              <div className="flex flex-wrap gap-2">
                                {player.allChampions.map((champ, i) => (
                                  <div key={i} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-2 rounded-lg pr-4">
                                    <img src={getChampAsset(champ.name)} alt="" className="w-5 h-5 rounded" />
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-bold uppercase text-zinc-200">{champ.name}</span>
                                      <span className="text-[8px] font-bold text-blue-500">{champ.winRate} WR</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="pt-12 border-t border-zinc-900/50 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <div className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest">WildRift.GG Ranking System</div>
          <div className="text-zinc-800 text-[9px] font-bold uppercase tracking-[0.2em]">
            Data by Riot • Powered by Antigravity
          </div>
        </footer>

      </div>
    </main>
  );
}

function StatItem({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg flex flex-col gap-0.5">
      <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-wider">{label}</span>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
  );
}


