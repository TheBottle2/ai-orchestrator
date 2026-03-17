"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Chat() {
  const router = useRouter();
  const [kullanici, setKullanici] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [mesajlar, setMesajlar] = useState([]);
  const [input, setInput] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [pipeline, setPipeline] = useState(null);
  const [sessionHata, setSessionHata] = useState("");
  const altRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const k = localStorage.getItem("kullanici");
    if (!token || !k || k === "undefined" || k === "null") {
      localStorage.clear();
      router.push("/login");
      return;
    }
    try {
      const parsed = JSON.parse(k);
      setKullanici(parsed);
      oturumBaslat(parsed);
    } catch {
      localStorage.clear();
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    altRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mesajlar, yukleniyor]);

  async function oturumBaslat(k) {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kullanici_id: k.id, baslik: "Yeni Sohbet" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mesaj || "Oturum başlatılamadı.");
      setSessionId(data._id);
    } catch (err) {
      setSessionHata("Oturum başlatılamadı: " + err.message);
    }
  }

  async function mesajGonder() {
    if (!input.trim() || yukleniyor || !sessionId) return;
    const soru = input.trim();
    setInput("");
    setPipeline(null);
    setMesajlar((prev) => [...prev, { rol: "user", icerik: soru }]);
    setYukleniyor(true);

    try {
      const res = await fetch(`/api/chat/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mesaj: soru }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mesaj || "Hata oluştu.");
      setMesajlar((prev) => [...prev, { rol: "assistant", icerik: data.final_yanit }]);
      setPipeline(data.pipeline);
    } catch (err) {
      setMesajlar((prev) => [...prev, { rol: "hata", icerik: err.message }]);
    } finally {
      setYukleniyor(false);
    }
  }

  function cikisYap() {
    localStorage.clear();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white font-semibold">AI Orchestrator</h1>
          <p className="text-gray-500 text-xs">3 model pipeline · Yanıtlayıcı → Eleştirmen → Sentezci</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{kullanici?.ad}</span>
          <button onClick={cikisYap} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
            Çıkış
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-3xl w-full mx-auto">

        {sessionHata && (
          <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
            {sessionHata}
          </div>
        )}

        {mesajlar.length === 0 && !sessionHata && (
          <div className="text-center text-gray-600 mt-20">
            <p className="text-lg">Bir soru sor</p>
            <p className="text-sm mt-2">3 farklı model birlikte yanıt üretecek</p>
          </div>
        )}

        {mesajlar.map((m, i) => (
          <div key={i} className={`flex ${m.rol === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.rol === "user"
                ? "bg-blue-600 text-white"
                : m.rol === "hata"
                ? "bg-red-950 border border-red-800 text-red-300"
                : "bg-gray-800 text-gray-100"
            }`}>
              {m.icerik}
            </div>
          </div>
        ))}

        {yukleniyor && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl px-4 py-3 text-sm text-gray-400">
              <span className="animate-pulse">3 model çalışıyor...</span>
            </div>
          </div>
        )}

        {pipeline && (
          <div className="border border-gray-800 rounded-xl p-4 space-y-3">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Pipeline Detayı</p>
            {Object.values(pipeline).map((adim, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    i === 0 ? "bg-blue-900 text-blue-300" :
                    i === 1 ? "bg-orange-900 text-orange-300" :
                    "bg-purple-900 text-purple-300"
                  }`}>{adim.rol}</span>
                  <span className="text-gray-600 text-xs">{adim.model_id} · {adim.sure_ms}ms</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed pl-2 border-l border-gray-700">
                  {adim.icerik?.slice(0, 200)}{adim.icerik?.length > 200 ? "..." : ""}
                </p>
              </div>
            ))}
          </div>
        )}

        <div ref={altRef} />
      </div>

      <div className="border-t border-gray-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && mesajGonder()}
            placeholder={sessionId ? "Sorunuzu yazın..." : "Oturum başlatılıyor..."}
            className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            disabled={yukleniyor || !sessionId}
          />
          <button
            onClick={mesajGonder}
            disabled={yukleniyor || !input.trim() || !sessionId}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-xl px-5 py-3 text-sm font-medium transition-colors"
          >
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
