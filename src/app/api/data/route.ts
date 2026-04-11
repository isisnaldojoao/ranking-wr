import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Check if KV is configured
    const isKVConfigured = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
    
    // Try to get data from KV
    let players = null;
    if (isKVConfigured) {
      players = await kv.get("ranking_data");
    }

    if (players) {
      console.log("Serving data from Vercel KV");
      return NextResponse.json(players);
    }

    // Fallback to local file if KV is empty (useful for first run/dev)
    console.log("KV empty, falling back to local data.json");
    const localPath = path.join(process.cwd(), "public", "data", "data.json");
    
    if (fs.existsSync(localPath)) {
      const fileContent = fs.readFileSync(localPath, "utf8");
      const data = JSON.parse(fileContent);
      return NextResponse.json(data);
    }

    return NextResponse.json([], { status: 200 });
  } catch (error: unknown) {
    console.error("Data fetch error:", error);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}

// Ensure results aren't cached too aggressively in production
export const revalidate = 0;
