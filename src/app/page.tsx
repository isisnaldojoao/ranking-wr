"use client";

import { useState } from "react";
import Link from "next/link";
import playersData from "../data/data.json";


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
  const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null);

  const players = (playersData as Player[]).filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRankColor = (rank: string) => {
    if (rank.includes("Diamante")) return "text-cyan-400";
    if (rank.includes("Esmeralda")) return "text-emerald-400";
    if (rank.includes("Platina")) return "text-teal-300";
    if (rank.includes("Ouro")) return "text-yellow-500";
    return "text-indigo-400";
  };

  const getRoleIcon = (champName: string) => {
    const roles: Record<string, string> = {
      "Irelia": "⚔️", "Ryze": "🧙", "Braum": "🛡️", "Graves": "🔫", "Smolder": "🔥", "Ezreal": "🏹", "Miss Fortune": "🔫",
      "Darius": "🪓", "Swain": "🌑", "Rumble": "🔥", "Kalista": "🏹", "Vex": "👻", "Galio": "🛡️", "Ahri": "🦊",
      "Pantheon": "🛡️", "Viego": "🗡️", "Poppy": "🔨", "Amumu": "🩹", "Voliber": "⚡", "Warwick": "🐺",
      "Sena": "🔫", "Lux": "✨", "Lulu": "🪄", "Leona": "☀️", "Blitzcrank": "🤖", "Veighar": "🎩", "Ziggs": "💣",
      "Yone": "⚔️", "Ysauo": "⚔️", "Ekko": "⏳", "Akali": "🗡️", "Heimerdiger": "🔧"
    };
    return roles[champName] || "🎮";
  };

  return (
    <main className="min-h-screen bg-[#0a0f16] text-white p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                WILD RIFT
              </span>
              <span className="ml-3 text-white/90 uppercase">PRO RANKING</span>
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-gray-400 font-medium">Dados Atualizados • {new Date().toLocaleDateString("pt-BR")}</p>
              <Link href="/admin" className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded px-2 py-0.5 text-gray-500 hover:text-indigo-400 transition-all uppercase font-bold tracking-tighter">
                Admin Panel
              </Link>
            </div>
          </div>


          <div className="relative group w-full md:w-80">
            <input
              type="text"
              placeholder="Buscar jogador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-gray-500"
            />
            <div className="absolute right-4 top-3.5 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
              🔍
            </div>
          </div>
        </header>

        {/* Player List */}
        <div className="grid grid-cols-1 gap-6">
          {players.map((player, index) => (
            <div
              key={player.id}
              className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 ${
                index === 0 
                  ? "bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/30 glow-yellow" 
                  : "bg-white/5 border-white/10 hover:border-white/20"
              }`}
            >
              {/* Main Card Info */}
              <div 
                className="flex flex-col md:flex-row md:items-center p-6 gap-6 cursor-pointer"
                onClick={() => setExpandedPlayer(expandedPlayer === player.id ? null : player.id)}
              >
                
                {/* ID & Name */}
                <div className="flex items-center gap-6 min-w-[260px]">
                  <div className="relative">
                    <span className={`text-3xl font-black italic ${
                      index === 0 ? "text-yellow-400" : index === 1 ? "text-gray-300" : index === 2 ? "text-amber-600" : "text-gray-500"
                    }`}>
                      #{player.id}
                    </span>
                    {index < 3 && (
                      <div className="absolute -top-3 -left-3 text-xl animate-bounce">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-wide group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                      {player.name}
                    </h2>
                    <div className={`text-sm font-bold uppercase tracking-widest mt-0.5 ${getRankColor(player.rank)}`}>
                      {player.rank}
                    </div>
                  </div>
                </div>


                {/* Champion Info Snapshot */}
                <div className="flex-1 border-l border-white/5 pl-6 flex items-center gap-4">
                  <div className="hidden sm:block w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-xl">
                    {getRoleIcon(player.mainChampion.name)}
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Main Champion</div>
                    <div className="font-semibold text-gray-200">
                      {player.mainChampion.name}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">Global WR: {player.mainChampion.winRate}</div>
                  </div>
                </div>

                {/* Achievement Medals */}
                <div className="flex flex-wrap gap-2 md:w-56 lg:w-72">
                   {player.stats.mvp > 0 && (
                     <div className="px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-black text-yellow-500 flex items-center gap-1">
                       MVP <span className="bg-yellow-500 text-black px-1 rounded-sm">{player.stats.mvp}</span>
                     </div>
                   )}
                   {player.stats.penta > 0 && (
                     <div className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-black text-red-500 flex items-center gap-1">
                       PENTA <span className="bg-red-500 text-white px-1 rounded-sm">{player.stats.penta}</span>
                     </div>
                   )}
                   <div className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 flex items-center gap-1">
                     S-RANK <span className="bg-blue-500 text-white px-1 rounded-sm">{player.stats.s}</span>
                   </div>
                </div>

                {/* Winrate */}
                <div className="md:w-32 flex flex-col items-end gap-1">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">{player.matches} Partidas</div>
                  <div className={`text-2xl font-black ${player.winRate >= 50 ? "text-indigo-100" : "text-red-400"}`}>
                    {player.winRate}%
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        player.winRate >= 55 ? "bg-cyan-500" : player.winRate >= 50 ? "bg-indigo-500" : "bg-red-500"
                      }`}
                      style={{ width: `${player.winRate}%` }}
                    />
                  </div>
                </div>

                <div className={`text-xs text-gray-600 transition-transform duration-300 ${expandedPlayer === player.id ? "rotate-180" : ""}`}>
                  ▼
                </div>
              </div>

              {/* Expandable Section: All Champions & Detailed Stats */}
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  expandedPlayer === player.id ? "max-h-[500px] border-t border-white/5 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-6 bg-white/[0.01] grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Detailed Medal Breakdown */}
                  <div>
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Medalhas & Proezas</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <StatItem label="First Bloods" value={player.stats.firstBlood} color="text-red-400" />
                      <StatItem label="Lendário" value={player.stats.lendario} color="text-yellow-400" />
                      <StatItem label="Triple Kills" value={player.stats.triple} color="text-orange-400" />
                      <StatItem label="Quadra Kills" value={player.stats.quadra} color="text-orange-500" />
                      <StatItem label="A-Rank" value={player.stats.a} color="text-gray-400" />
                      <StatItem label="S-Rank" value={player.stats.s} color="text-blue-400" />
                    </div>
                  </div>

                  {/* All Champions List */}
                  <div>
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Mastery: Todos os Campeões</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                      {player.allChampions.map((champ, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0">
                          <div className="flex items-center gap-3">
                            <span>{getRoleIcon(champ.name)}</span>
                            <span className="font-medium text-gray-200">{champ.name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-indigo-400">Lv.{champ.level}</span>
                            <span className="text-gray-400 w-12 text-right">{champ.winRate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-20 py-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-xs tracking-widest uppercase">
          <p>© 2026 Wild Rift Elo Consulta • Built with Antigravity</p>
          <div className="flex gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">Discord</span>
            <span className="hover:text-white transition-colors cursor-pointer">GitHub</span>
            <span className="hover:text-white transition-colors cursor-pointer">API Docs</span>
          </div>
        </footer>
      </div>
    </main>
  );
}

function StatItem({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
      <span className="text-[10px] font-bold text-gray-500 uppercase">{label}</span>
      <span className={`text-sm font-black ${color}`}>{value}</span>
    </div>
  );
}
