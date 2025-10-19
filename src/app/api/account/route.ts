import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameName = searchParams.get("gameName");
  const tagLine = searchParams.get("tagLine");

  if (!gameName || !tagLine) {
    return NextResponse.json({ message: "Faltam parâmetros" }, { status: 400 });
  }

  try {
    // 🔥 Aqui é onde buscamos os dados do jogador
    // ⚠️ Esse endpoint abaixo é apenas um exemplo — precisa ser substituído por uma API real
    const res = await fetch(`https://api.wr-meta.com/player/${encodeURIComponent(gameName)}-${encodeURIComponent(tagLine)}`);

    const text = await res.text();

    // Vamos tentar converter pra JSON — se falhar, retornamos o texto pra debug
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ error: "Resposta não é JSON", raw: text }, { status: 500 });
    }

  } catch (err: any) {
    return NextResponse.json({ message: err.message || "Erro ao buscar dados" }, { status: 500 });
  }
}
