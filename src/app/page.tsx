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
        const res = await fetch("/data/data.json", { cache: 'no-store' });
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
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5383e8]"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0e1a] text-white font-sans selection:bg-[#5383e8]/30">
      <nav className="bg-[#1c253d] border-b border-[#232c45] px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#5383e8] rounded flex items-center justify-center font-black text-white italic">WR</div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic">
            WildRift.<span className="text-[#5383e8]">GG</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest">
            Painel Admin
          </Link>
          <div className="relative group hidden md:block">
            <input
              type="text"
              placeholder="Buscar invocador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0a0e1a] border border-[#232c45] rounded-md px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-[#5383e8] w-64 transition-all"
            />
            <span className="absolute right-3 top-2.5 opacity-30">🔍</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-slide-up">
        
        <section className="bg-gradient-to-r from-[#1c253d] to-[#12192b] border border-[#232c45] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col gap-1 items-center md:items-start relative z-10">
            <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">Ladder Ranking</h2>
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#5383e8]">
              <span className="bg-[#5383e8]/10 px-2 py-1 rounded">Season 2026</span>
              <span className="text-white/20">•</span>
              <span>Servidor BR</span>
            </div>
          </div>
          
          <div className="flex gap-12 text-center md:text-left relative z-10">
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total de Players</div>
              <div className="text-2xl font-black">{players.length}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Invocador #1</div>
              <div className="text-2xl font-black text-emerald-400 truncate max-w-[150px]">{players[0]?.name}</div>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-[#5383e8]/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        </section>

        <div className="bg-[#1c253d] border border-[#232c45] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#12192b] text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-[#232c45]">
                  <th className="px-8 py-5 w-24">Pos</th>
                  <th className="px-4 py-5">Invocador</th>
                  <th className="px-4 py-5">Tier</th>
                  <th className="px-4 py-5 text-center">Jogos</th>
                  <th className="px-4 py-5">WinRate</th>
                  <th className="px-4 py-5">Top Champ</th>
                  <th className="px-8 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232c45]/30">
                {filteredPlayers.map((player, index) => (
                  <Fragment key={player.id}>
                    <tr 
                      key={player.id} 
                      onClick={() => setExpandedId(expandedId === player.id ? null : player.id)}
                      className={`hover:bg-[#232c45]/40 transition-all duration-300 group cursor-pointer ${
                        expandedId === player.id ? "bg-[#232c45]/50" : ""
                      }`}
                    >
                      <td className="px-8 py-5 font-black text-lg italic text-[#5383e8]/50 group-hover:text-[#5383e8] transition-colors relative">
                        {index + 1}
                        {index < 3 && (
                          <div className={`absolute top-1/2 -translate-y-1/2 left-2 w-1 h-8 rounded-full ${
                            index === 0 ? "bg-yellow-500 shadow-[0_0_10px_#eab308]" : 
                            index === 1 ? "bg-gray-400 shadow-[0_0_10px_#9ca3af]" : 
                            "bg-amber-600 shadow-[0_0_10px_#d97706]"
                          }`} />
                        )}
                      </td>

                      <td className="px-4 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-[#232c45] group-hover:border-[#5383e8] transition-all bg-black/40">
                             <img 
                              src={getChampAsset(player.mainChampion.name)} 
                              alt="" 
                              className="w-full h-full object-cover scale-110"
                              onError={(e) => (e.currentTarget.src = "https://ddragon.leagueoflegends.com/cdn/14.5.1/img/profileicon/29.png")}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-100 uppercase group-hover:text-white transition-colors">{player.name}</span>
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1">
                              {index === 0 && <span className="text-yellow-500">🥇 Top Tier</span>}
                              #ID-{1000 + player.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-5">
                        <span className={`font-bold uppercase text-[11px] tracking-tight ${getRankColor(player.rank)}`}>
                          {player.rank}
                        </span>
                      </td>

                      <td className="px-4 py-5 text-center font-bold text-gray-300 text-sm">{player.matches}</td>

                      <td className="px-4 py-5">
                        <div className="flex flex-col gap-1 w-24">
                          <div className="text-[11px] font-black">{player.winRate}%</div>
                          <div className="h-1 bg-black/30 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${
                                player.winRate >= 50 ? "bg-[#5383e8]" : "bg-red-500"
                              }`}
                              style={{ width: `${player.winRate}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                           <span className="text-xs font-semibold text-gray-400 group-hover:text-gray-200 transition-colors">{player.mainChampion.name}</span>
                        </div>
                      </td>

                      <td className="px-8 py-5 text-right">
                        <button className="text-xs font-black uppercase text-gray-600 group-hover:text-[#5383e8] tracking-widest transition-all">
                          {expandedId === player.id ? "Fechar" : "Detalhes"}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Section */}
                    {expandedId === player.id && (
                      <tr>
                        <td colSpan={7} className="px-8 py-8 bg-[#12192b]/50 border-y border-[#232c45]/20 animate-slide-up">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* Detailed Stats Grid */}
                            <div className="space-y-4">
                              <h3 className="text-[10px] font-black text-[#5383e8] uppercase tracking-widest">Estatísticas de Combate</h3>
                              <div className="grid grid-cols-2 gap-3">
                                <StatItem label="MVP" value={player.stats.mvp} color="text-[#cba864]" />
                                <StatItem label="Lendário" value={player.stats.lendario} color="text-red-500" />
                                <StatItem label="S-Rank" value={player.stats.s} color="text-cyan-400" />
                                <StatItem label="A-Rank" value={player.stats.a} color="text-teal-400" />
                                <StatItem label="First Blood" value={player.stats.firstBlood} color="text-orange-400" />
                              </div>
                            </div>

                            {/* Multi-kills */}
                            <div className="space-y-4">
                              <h3 className="text-[10px] font-black text-[#5383e8] uppercase tracking-widest">Multi-Kills</h3>
                              <div className="flex flex-wrap gap-2">
                                <BadgeLarge label="Penta" count={player.stats.penta} color="bg-red-600" />
                                <BadgeLarge label="Quadra" count={player.stats.quadra} color="bg-orange-500" />
                                <BadgeLarge label="Triple" count={player.stats.triple} color="bg-indigo-500" />
                              </div>
                            </div>

                            {/* All Champions */}
                            <div className="space-y-4">
                              <h3 className="text-[10px] font-black text-[#5383e8] uppercase tracking-widest">Pool de Campeões</h3>
                              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-op">
                                {player.allChampions.map((champ, i) => (
                                  <div key={i} className="flex items-center justify-between text-xs bg-black/20 p-2 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-2">
                                      <img src={getChampAsset(champ.name)} alt="" className="w-5 h-5 rounded" onError={(e) => (e.currentTarget.style.display='none')} />
                                      <span className="font-bold">{champ.name}</span>
                                    </div>
                                    <div className="flex gap-4">
                                      <span className="text-gray-500 uppercase text-[9px]">Lvl {champ.level}</span>
                                      <span className="text-[#5383e8] font-black">{champ.winRate}</span>
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

        <footer className="footer-op border-t border-[#232c45] py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 grayscale opacity-50">
             <div className="w-8 h-8 bg-[#5383e8] rounded flex items-center justify-center font-black text-white italic">WR</div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic">WildRift.GG</h1>
          </div>
          <p className="text-[10px] text-gray-700 font-bold tracking-widest uppercase text-center md:text-right">
            © 2026 Developed with Antigravity • Data by Riot Games • <Link href="/admin" className="text-gray-500 hover:text-white">Admin</Link>
          </p>
        </footer>

      </div>
    </main>
  );
}

function StatItem({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="bg-black/20 p-3 rounded-xl border border-white/5 flex flex-col gap-1">
      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
      <span className={`text-xl font-black ${color}`}>{value}</span>
    </div>
  );
}

function BadgeLarge({ label, count, color }: { label: string, count: number, color: string }) {
  return (
    <div className={`${color} p-4 rounded-2xl flex flex-col items-center justify-center min-w-[80px] shadow-lg shadow-black/40`}>
      <span className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-1">{label}</span>
      <span className="text-2xl font-black">{count || 0}</span>
    </div>
  );
}
