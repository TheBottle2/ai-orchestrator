import { NextResponse } from "next/server";
import { config } from "../../../core/config.js";

function fallbackModels() {
  return [
    config.models.model1.id,
    config.models.model2.id,
    config.models.model3.id,
  ];
}

export async function GET() {
  try {
    const res = await fetch(`${config.ollamaBaseUrl}/api/tags`);
    if (!res.ok) throw new Error("Ollama listesi alinamadi");
    const data = await res.json();
    const models = (data.models || []).map((m) => m.name).filter(Boolean);

    if (!models.length) {
      return NextResponse.json({ models: fallbackModels() });
    }

    return NextResponse.json({ models });
  } catch {
    return NextResponse.json({ models: fallbackModels() });
  }
}
