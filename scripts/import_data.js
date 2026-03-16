const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = 'C:\\Users\\isisn\\Downloads\\WILD RIFT.xlsx';
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'data', 'data.json');

try {
  const workbook = XLSX.readFile(EXCEL_PATH);
  
  // Sheet: Dados - Primary source
  const dadosSheet = workbook.Sheets['Dados'];
  const playersBase = XLSX.utils.sheet_to_json(dadosSheet);

  // Sheet: Rotas&Campeões - For extra champion info
  const rotasSheet = workbook.Sheets['Rotas&Campeões'];
  const championList = XLSX.utils.sheet_to_json(rotasSheet);

  const players = playersBase.map((p, index) => {
    // Collect all champions for this player from Rotas&Campeões
    const playerChamps = championList
      .filter(c => c.Jogador?.toLowerCase() === p.Jogador?.toLowerCase())
      .map(c => ({
        name: c.Campeão,
        winRate: (Math.round(c['Taxa (%)'] * 10) / 10) + '%',
        level: c.Nivel || '?'
      }))
      .sort((a, b) => {
        // Sort by level then by winrate
        if (b.level !== a.level) return b.level - a.level;
        return parseFloat(b.winRate) - parseFloat(a.winRate);
      });

    // Primary champion from 'Dados' sheet
    const mainChampName = p['Campeão']?.split(' - ')[0] || 'Unknown';
    const mainChampWR = p['Campeão']?.split(' - ')[1] || '0%';

    return {
      id: index + 1,
      name: p.Jogador,
      rank: p.Rank,
      matches: p.partidas,
      winRate: Math.round(p['Taxa de vitorias'] * 1000) / 10,
      stats: {
        mvp: p.MVP || 0,
        s: p.S || 0,
        a: p.A || 0,
        lendario: p.Lendário || 0,
        penta: p.Penta || 0,
        quadra: p.Quadra || 0,
        triple: p.Triple || 0,
        firstBlood: p['First Blood'] || 0
      },
      mainChampion: {
        name: mainChampName,
        winRate: mainChampWR,
      },
      allChampions: playerChamps
    };
  });


  // Rank ordering helper
  const rankOrder = {
    "Grão-Mestre": 100,
    "Mestre": 90,
    "Diamante I": 84,
    "Diamante II": 83,
    "Diamante III": 82,
    "Diamante IV": 81,
    "Esmeralda I": 74,
    "Esmeralda II": 73,
    "Esmeralda III": 72,
    "Esmeralda IV": 71,
    "Platina I": 61,
    "Ouro I": 51
  };

  const getRankValue = (rank) => {
    // Exact match or prefix match
    if (rankOrder[rank]) return rankOrder[rank];
    for (const key in rankOrder) {
      if (rank.startsWith(key)) return rankOrder[key];
    }
    return 0; // Unknown rank
  };

  // Sort by Rank DESC (lower value in rankOrder means higher rank for tiers, but I used higher values for higher tiers)
  // Wait, I should use: Higher score = Higher position
  players.sort((a, b) => {
    const rankA = getRankValue(a.rank);
    const rankB = getRankValue(b.rank);
    
    if (rankA !== rankB) return rankB - rankA; // Higher tier first
    if (b.winRate !== a.winRate) return b.winRate - a.winRate; // Higher winrate first
    return b.matches - a.matches; // More matches first
  });

  // Re-assign IDs based on ranking
  players.forEach((p, i) => p.id = i + 1);

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(players, null, 2));
  console.log(`Successfully imported ${players.length} players to ${OUTPUT_PATH}`);
} catch (error) {
  console.error('Error importing data:', error);
  process.exit(1);
}

