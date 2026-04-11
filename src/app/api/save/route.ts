import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!process.env.REDIS_URL) {
      return NextResponse.json({ 
        error: "Redis não configurado. Por favor, conecte o Storage Redis no painel da Vercel." 
      }, { status: 500 });
    }

    // Save to Redis instead of file
    const redis = await getRedisClient();
    await redis.set("ranking_data", JSON.stringify(data));

    return NextResponse.json({ message: "Data saved successfully" });
  } catch (error: unknown) {
    console.error("Save error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
