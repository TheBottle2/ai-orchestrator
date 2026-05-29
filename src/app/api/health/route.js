import { NextResponse } from "next/server";
// Saglik kontrolu endpointi - MongoDB ve Ollama baglantilarini kontrol eder
import { connectDB } from "../../../core/db.js";

export async function GET() {
const checks = {
status: "healthy",
timestamp: new Date().toISOString(),
services: {},
};

try {
await connectDB();
checks.services.mongodb = "ok";
} catch {
checks.services.mongodb = "unavailable";
checks.status = "degraded";
}

const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
try {
const res = await fetch(`${ollamaUrl}/api/tags`, {
signal: AbortSignal.timeout(5000),
});
checks.services.ollama = res.ok ? "ok" : "error";
} catch {
checks.services.ollama = "unavailable";
checks.status = "degraded";
}

const statusCode = checks.status === "healthy" ? 200 : 503;
return NextResponse.json(checks, { status: statusCode });
}
