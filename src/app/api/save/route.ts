import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return NextResponse.json({ 
        error: "Vercel KV não configurado. Por favor, conecte o Storage KV no painel da Vercel." 
      }, { status: 500 });
    }

    // Save to Vercel KV instead of file
    await kv.set("ranking_data", data);

    return NextResponse.json({ message: "Data saved successfully" });
  } catch (error: unknown) {
    console.error("Save error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
