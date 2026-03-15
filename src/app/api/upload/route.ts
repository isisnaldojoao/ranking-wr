import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save temporary file to process with XLSX
    const tempPath = path.join(process.cwd(), "tmp_upload.xlsx");
    fs.writeFileSync(tempPath, buffer);

    const workbook = XLSX.readFile(tempPath);

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

    // Logic from import_data.js
    const dadosSheet = workbook.Sheets['Dados'];
    if (!dadosSheet) throw new Error("Sheet 'Dados' not found");
    const playersBase = XLSX.utils.sheet_to_json(dadosSheet) as ExcelPlayer[];

    const rotasSheet = workbook.Sheets['Rotas&Campeões'];
    const championList = rotasSheet ? XLSX.utils.sheet_to_json(rotasSheet) as ExcelChampion[] : [];

    const players = playersBase.map((p, index) => {
      const playerChamps = championList
        .filter(c => c.Jogador?.toLowerCase() === p.Jogador?.toLowerCase())
        .map(c => ({
          name: c.Campeão,
          winRate: (Math.round(c['Taxa (%)'] * 10) / 10) + '%',
          level: c.Nivel || '?'
        }))
        .sort((a, b) => {
          if (b.level !== a.level) return (b.level as number) - (a.level as number);
          return parseFloat(b.winRate) - parseFloat(a.winRate);
        });

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

    const outputPath = path.join(process.cwd(), "src", "data", "data.json");
    fs.writeFileSync(outputPath, JSON.stringify(players, null, 2));

    // Clean up
    fs.unlinkSync(tempPath);

    return NextResponse.json({ message: "File processed successfully", count: players.length });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

