"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const LANGUAGES = [
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "ru", label: "Русский" },
  { code: "ar", label: "العربية" },
  { code: "zh", label: "中文" },
];

export default function Translate() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [sourceLang, setSourceLang] = useState("tr");
  const [targetLang, setTargetLang] = useState("en");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [model, setModel] = useState("translategemma:4b");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("token");
    if (!stored) {
      localStorage.clear();
      router.push("/login");
      return;
    }
    setToken(stored);
  }, [router]);

  const authHeaders = useMemo(() => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  function handleAuthFailure(res) {
    if (res.status !== 401) return false;
    localStorage.clear();
    router.push("/login");
    return true;
  }

  async function translate() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          text,
          sourceLang,
          targetLang,
          model,
        }),
      });
      const data = await res.json();
      if (handleAuthFailure(res)) return;
      if (!res.ok) throw new Error(data.mesaj || "Çeviri başarısız.");
      setResult(data.translation || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white font-semibold">Çeviri</h1>
          <p className="text-gray-500 text-xs">Hızlı ve sade çeviri aracı</p>
        </div>
        <button
          onClick={() => router.push("/chat")}
          className="text-gray-400 hover:text-gray-200 text-sm"
        >
          Sohbete Dön
        </button>
      </div>

      <div className="flex-1 px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {error && (
            <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-gray-400 text-xs">Kaynak Dil</label>
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1 text-xs"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Çevirmek istediğin metni yaz..."
                className="w-full min-h-[240px] bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-gray-400 text-xs">Hedef Dil</label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1 text-xs"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
              </div>
              <div className="w-full min-h-[240px] bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm text-gray-100">
                {loading ? <span className="text-gray-500">Çeviriliyor...</span> : (result || "Sonuç burada görünecek")}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-gray-400 text-xs">Model</label>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1 text-xs"
                placeholder="translategemma:4b"
              />
            </div>
            <button
              onClick={translate}
              disabled={loading || !text.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg px-4 py-2 text-sm"
            >
              Çevir
            </button>
            <button
              onClick={() => {
                setText("");
                setResult("");
                setError("");
              }}
              className="text-gray-400 hover:text-gray-200 text-sm"
            >
              Temizle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
