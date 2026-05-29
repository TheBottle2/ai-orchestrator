import { NextResponse } from "next/server";
// Ceviri endpointi: metni model ile hedef dile cevirir - kimlik dogrulama gerekli
import { config } from "../../../core/config.js";
import { getAuthUserId } from "../../../lib/auth.js";

const VALID_LANGUAGES = ["tr", "en", "de", "fr", "es", "it", "ru", "ar", "zh"];

export async function POST(req) {
try {
const kullanici_id = getAuthUserId(req);

let body;
try {
body = await req.json();
} catch {
return NextResponse.json({ mesaj: "Geçersiz JSON body" }, { status: 400 });
}

const text = (body?.text || "").trim();
const sourceLang = (body?.sourceLang || "").trim().toLowerCase();
const targetLang = (body?.targetLang || "").trim().toLowerCase();
const model = (body?.model || "translategemma:4b").trim();

if (!text || !sourceLang || !targetLang) {
return NextResponse.json({ mesaj: "Eksik alan" }, { status: 400 });
}

if (!VALID_LANGUAGES.includes(sourceLang) || !VALID_LANGUAGES.includes(targetLang)) {
return NextResponse.json({ mesaj: "Desteklenmeyen dil" }, { status: 400 });
}

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 60000);

try {
const response = await fetch(`${config.ollamaBaseUrl}/v1/chat/completions`, {
method: "POST",
headers: { "Content-Type": "application/json" },
signal: controller.signal,
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
{ status: 502 }
);
}

const data = await response.json();
const translation = data?.choices?.[0]?.message?.content || "";
return NextResponse.json({ translation });
} finally {
clearTimeout(timeout);
}
} catch (e) {
if (e.status === 401) {
return NextResponse.json({ mesaj: "Yetkisiz" }, { status: 401 });
}
return NextResponse.json({ mesaj: e.message }, { status: 500 });
}
}
