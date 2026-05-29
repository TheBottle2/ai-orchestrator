import { NextResponse } from "next/server";
// Ollama canli model listesi endpointi - kimlik dogrulama gerekli
import { config } from "../../../core/config.js";
import { getAuthUserId } from "../../../lib/auth.js";

function fallbackModels() {
return [
config.models.model1.id,
config.models.model2.id,
config.models.model3.id,
];
}

export async function GET(req) {
try {
getAuthUserId(req);

const res = await fetch(`${config.ollamaBaseUrl}/api/tags`);
if (!res.ok) throw new Error("Ollama listesi alinamadi");
const data = await res.json();
const models = (data.models || []).map((m) => m.name).filter(Boolean);

if (!models.length) {
return NextResponse.json({ models: fallbackModels() });
}

return NextResponse.json({ models });
} catch (e) {
if (e.status === 401) {
return NextResponse.json({ mesaj: "Yetkisiz" }, { status: 401 });
}
return NextResponse.json({ models: fallbackModels() });
}
}
