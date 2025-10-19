"use client";

export default function Home() {
  const ranking = [
    { id: 1, name: "cole palmer", rank: "Mestre I", winRate: 55 },
    { id: 2, name: "JogadorDoMid", rank: "Mestre II", winRate: 51.2 },
    { id: 3, name: "Ojuara", rank: "Diamante I", winRate: 55.5 },
    { id: 4, name: "Vashtanerada", rank: "Diamante III", winRate: 54.5 },
    { id: 5, name: "pelicano raivoso", rank: "Esmeralda IV", winRate: 48.1 },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center p-8">
      <h1 className="text-4xl font-extrabold mb-10 text-center drop-shadow-md">
        🏆 <span className="text-indigo-400">Wild Rift</span> Ranking
      </h1>

      <section className="w-full max-w-3xl">
        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {ranking.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between px-6 py-5 transition-all hover:bg-white/10 ${
                index === 0
                  ? "bg-yellow-400/10 border-l-4 border-yellow-400"
                  : "border-l-4 border-transparent"
              }`}
            >
              <div className="flex items-center gap-5">
                {/* Rank position */}
                <span
                  className={`text-2xl font-bold ${
                    index === 0
                      ? "text-yellow-400"
                      : index === 1
                      ? "text-gray-300"
                      : index === 2
                      ? "text-amber-700"
                      : "text-indigo-400"
                  }`}
                >
                  #{player.id}
                </span>

                {/* Player info */}
                <div>
                  <p className="text-lg font-semibold capitalize">{player.name}</p>
                  <span className="inline-block bg-indigo-500/20 text-indigo-300 text-xs font-medium px-2 py-1 rounded-md mt-1">
                    {player.rank}
                  </span>
                </div>
              </div>

              {/* Winrate bar */}
              <div className="flex flex-col items-end w-32">
                <p className="text-sm text-gray-300 mb-1">{player.winRate}% WR</p>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      player.winRate >= 55
                        ? "bg-green-400"
                        : player.winRate >= 50
                        ? "bg-yellow-400"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${player.winRate}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-10 text-sm text-gray-500">
        Atualizado automaticamente • {new Date().toLocaleDateString("pt-BR")}
      </footer>
    </main>
  );
}
