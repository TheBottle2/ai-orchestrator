import { NextResponse } from "next/server";
import { config } from "../../../core/config.js";
import { getAuthUserId } from "../../../lib/auth.js";

export async function POST(req) {
  try {
    getAuthUserId(req);
    const body = await req.json();
    const text = (body?.text || "").trim();
    const sourceLang = (body?.sourceLang || "").trim();
    const targetLang = (body?.targetLang || "").trim();
    const model = (body?.model || "translategemma:4b").trim();

    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json({ mesaj: "Eksik alan" }, { status: 400 });
    }

    const response = await fetch(`${config.ollamaBaseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate from ${sourceLang} to ${targetLang}. Output only the translation.`,
          },
          { role: "user", content: text },
        ],
        temperature: 0.2,
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { mesaj: `Model hatası: HTTP ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const translation = data?.choices?.[0]?.message?.content || "";
    return NextResponse.json({ translation });
  } catch (e) {
    if (e.status === 401) {
      return NextResponse.json({ mesaj: "Yetkisiz" }, { status: 401 });
    }
    return NextResponse.json({ mesaj: e.message }, { status: 500 });
  }
}
