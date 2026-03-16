import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const outputPath = path.join(process.cwd(), "public", "data", "data.json");
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

    return NextResponse.json({ message: "Data saved successfully" });
  } catch (error: unknown) {
    console.error("Save error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
