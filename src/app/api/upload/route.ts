import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("Starting file processing...");
    interface ExcelPlayer {
      Jogador: string;
      Rank: string;
      partidas: number;
      'Taxa de vitorias': number;
      MVP?: number;
      S?: number;
      A?: number;
      Lendário?: number;
      Penta?: number;
      Quadra?: number;
      Triple?: number;
      'First Blood'?: number;
      Campeão: string;
    }

    interface ExcelChampion {
      Jogador: string;
      Campeão: string;
      'Taxa (%)': number;
      Nivel?: number;
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("Reading workbook from buffer...");
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // Logic from import_data.js
    const dadosSheet = workbook.Sheets['Dados'];
    if (!dadosSheet) {
      console.error("Sheet 'Dados' not found in workbook. Available sheets:", workbook.SheetNames);
      throw new Error("Planilha 'Dados' não encontrada no arquivo.");
    }
    const playersBase = XLSX.utils.sheet_to_json(dadosSheet) as ExcelPlayer[];
    console.log(`Found ${playersBase.length} players in 'Dados'`);

    const rotasSheet = workbook.Sheets['Rotas&Campeões'];
    const championList = rotasSheet ? XLSX.utils.sheet_to_json(rotasSheet) as ExcelChampion[] : [];
    console.log(`Found ${championList.length} champions in 'Rotas&Campeões'`);

    const players = playersBase.map((p, index) => {
      const playerChamps = championList
        .filter(c => c.Jogador?.toLowerCase() === p.Jogador?.toLowerCase())
        .map(c => ({
          name: c.Campeão,
          winRate: (Math.round(c['Taxa (%)'] * 10) / 10) + '%',
          level: c.Nivel || '?'
        }))
        .sort((a, b) => {
          if (b.level !== a.level) return (Number(b.level) || 0) - (Number(a.level) || 0);
          return parseFloat(b.winRate) - parseFloat(a.winRate);
        });

      return {
        id: index + 1,
        name: p.Jogador,
        rank: p.Rank,
        matches: Number(p.partidas) || 0,
        winRate: Math.round((Number(p['Taxa de vitorias']) || 0) * 1000) / 10,
        stats: {
          mvp: Number(p.MVP) || 0,
          s: Number(p.S) || 0,
          a: Number(p.A) || 0,
          lendario: Number(p.Lendário) || 0,
          penta: Number(p.Penta) || 0,
          quadra: Number(p.Quadra) || 0,
          triple: Number(p.Triple) || 0,
          firstBlood: Number(p['First Blood']) || 0
        },
        mainChampion: {
          name: p['Campeão']?.split(' - ')[0] || 'Unknown',
          winRate: p['Campeão']?.split(' - ')[1] || '0%',
        },
        allChampions: playerChamps
      };
    });

    const rankOrder: Record<string, number> = {
      "Grão-Mestre": 100, "Mestre": 90,
      "Diamante I": 84, "Diamante II": 83, "Diamante III": 82, "Diamante IV": 81,
      "Esmeralda I": 74, "Esmeralda II": 73, "Esmeralda III": 72, "Esmeralda IV": 71,
      "Platina I": 61, "Ouro I": 51
    };

    const getRankValue = (rank: string) => {
      if (!rank) return 0;
      if (rankOrder[rank]) return rankOrder[rank];
      for (const key in rankOrder) {
        if (rank.startsWith(key)) return rankOrder[key];
      }
      return 0;
    };

    players.sort((a, b) => {
      const rankA = getRankValue(a.rank);
      const rankB = getRankValue(b.rank);
      if (rankA !== rankB) return rankB - rankA;
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      return b.matches - a.matches;
    });

    players.forEach((p, i) => p.id = i + 1);

    const outputPath = path.join(process.cwd(), "public", "data", "data.json");
    console.log("Saving processed data to:", outputPath);
    
    // Ensure the directory exists (just in case)
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      console.log("Creating output directory:", outputDir);
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(players, null, 2));

    console.log("Upload success!");
    return NextResponse.json({ message: "File processed successfully", count: players.length });
  } catch (error: unknown) {
    console.error("Upload error detail:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    const errorStack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json({ 
      error: errorMessage, 
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined 
    }, { status: 500 });
  }
}

