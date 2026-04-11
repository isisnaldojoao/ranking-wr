import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return NextResponse.json({ 
        error: "Vercel KV não configurado. Por favor, conecte o Storage KV no painel da Vercel para que o upload funcione em produção." 
      }, { status: 500 });
    }

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

    // Save to Vercel KV instead of file
    console.log("Saving processed data to Vercel KV...");
    await kv.set("ranking_data", players);

    console.log("Upload success!");
    return NextResponse.json({ message: "File processed successfully", count: players.length });
  } catch (error: unknown) {
    console.error("Upload error detail:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ 
      error: errorMessage 
    }, { status: 500 });
  }
}

