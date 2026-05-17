"use client";
// Sohbet UI: oturum listesi, mesajlasma, model secimi ve pipeline detaylari
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DEFAULT_TITLE = "Yeni Sohbet";

const defaultModelSelection = (models) => {
  if (!models?.length) return { model1: "", model2: "", model3: "" };
  return {
    model1: models[0] || "",
    model2: models[1] || models[0] || "",
    model3: models[2] || models[1] || models[0] || "",
  };
};

const toChatMessages = (turlar = []) => {
  const out = [];
  for (const tur of turlar) {
    if (tur?.kullanici_mesaji) {
      out.push({ id: makeMessageId(), rol: "user", icerik: tur.kullanici_mesaji });
    }
    if (tur?.final_cevap) {
      out.push({ id: makeMessageId(), rol: "assistant", icerik: tur.final_cevap, pipeline: tur.pipeline });
    }
  }
  return out;
};

const normalizePipeline = (pipeline) => {
  if (!pipeline) return null;
  if (Array.isArray(pipeline)) {
    return {
      model1: pipeline[0],
      model2: pipeline[1],
      model3: pipeline[2],
    };
  }
  return pipeline;
};

const makeMessageId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export default function Chat() {
  const router = useRouter();
  const [kullanici, setKullanici] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [mesajlar, setMesajlar] = useState([]);
  const [input, setInput] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sendingSessionId, setSendingSessionId] = useState(null);
  const [sessionHata, setSessionHata] = useState("");
  const [activeDetailId, setActiveDetailId] = useState(null);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showModelPanel, setShowModelPanel] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [modelSelection, setModelSelection] = useState({ model1: "", model2: "", model3: "" });
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState("");
  const altRef = useRef(null);
  const requestIdRef = useRef(0);
  const inFlightControllerRef = useRef(null);
  const activeSessionRef = useRef(null);

  const [token, setToken] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setToken(localStorage.getItem("token"));
  }, []);


  const authHeaders = useMemo(() => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const k = localStorage.getItem("kullanici");
    if (!k || k === "undefined" || k === "null") {
      localStorage.clear();
      router.push("/login");
      return;
    }

    try {
      const parsed = JSON.parse(k);
      setKullanici(parsed);
      loadSessions();
    } catch {
      localStorage.clear();
      router.push("/login");
    }
  }, [router, token]);

  const isActiveLoading = yukleniyor && sendingSessionId === activeSessionId;

  useEffect(() => {
    activeSessionRef.current = activeSessionId;
  }, [activeSessionId]);

  useEffect(() => {
    altRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mesajlar, isActiveLoading]);

  function abortInFlight() {
    if (inFlightControllerRef.current) {
      inFlightControllerRef.current.abort();
      inFlightControllerRef.current = null;
    }
    requestIdRef.current += 1;
    setYukleniyor(false);
    setSendingSessionId(null);
  }

  function handleAuthFailure(res) {
    if (res.status !== 401) return false;
    localStorage.clear();
    setSessions([]);
    setMesajlar([]);
    setActiveSessionId(null);
    setActiveDetailId(null);
    setSessionHata("");
    router.push("/login");
    return true;
  }

  async function loadSessions(selectedId) {
    try {
      setSessionHata("");
      const res = await fetch("/api/chat", { headers: { "Content-Type": "application/json", ...authHeaders } });
      const data = await res.json();
      if (handleAuthFailure(res)) return;
      if (!res.ok) throw new Error(data.mesaj || "Sohbetler alınamadı.");

      const list = Array.isArray(data) ? data : [];
      setSessions(list);

      const nextId = selectedId || list[0]?._id || null;
      setActiveSessionId(nextId);
      if (nextId) {
        await loadSessionDetail(nextId);
      } else {
        setMesajlar([]);
      }
    } catch (err) {
      setSessionHata(err.message);
    }
  }

  async function loadSessionDetail(sessionId) {
    try {
      setSessionHata("");
      const res = await fetch(`/api/chat/${sessionId}`, { headers: { "Content-Type": "application/json", ...authHeaders } });
      const data = await res.json();
      if (handleAuthFailure(res)) return;
      if (!res.ok) throw new Error(data.mesaj || "Sohbet detayı alınamadı.");
      setMesajlar(toChatMessages(data.turlar));
      setActiveDetailId(null);
    } catch (err) {
      setSessionHata(err.message);
    }
  }

  async function openModelPanel() {
    setShowModelPanel(true);
    setModelLoading(true);
    setModelError("");
    try {
      const res = await fetch("/api/models");
      const data = await res.json();
      const list = Array.isArray(data?.models) ? data.models : [];
      setAvailableModels(list);

      if (list.length === 0) {
        setModelError("Model listesi boş. Lütfen Ollama modellerini kontrol edin.");
      }

      const pick = (value, fallback) => (list.includes(value) ? value : fallback);
      const stored = localStorage.getItem("modelSelection");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setModelSelection({
            model1: pick(parsed.model1, list[0] || ""),
            model2: pick(parsed.model2, list[1] || list[0] || ""),
            model3: pick(parsed.model3, list[2] || list[1] || list[0] || ""),
          });
        } catch {
          setModelSelection(defaultModelSelection(list));
        }
      } else {
        setModelSelection(defaultModelSelection(list));
      }
    } catch {
      setModelError("Model listesi alınamadı. Varsayılan liste kullanılacak.");
      setAvailableModels([]);
      setModelSelection(defaultModelSelection([]));
    } finally {
      setModelLoading(false);
    }
  }

  const presets = useMemo(() => {
    if (!availableModels.length) return [];

    const filtered = availableModels.filter((name) => !name.includes(":cloud"));
    const candidates = filtered.length ? filtered : availableModels;

    const withSize = candidates.map((name, index) => {
      const match = name.match(/:(\d+(?:\.\d+)?)b/i);
      return {
        name,
        index,
        size: match ? Number(match[1]) : Number.POSITIVE_INFINITY,
      };
    });

    const sorted = [...withSize].sort((a, b) => {
      if (a.size === b.size) return a.index - b.index;
      return a.size - b.size;
    });

    const pickAt = (idx) => sorted[Math.min(idx, sorted.length - 1)]?.name || candidates[0];
    const small = pickAt(0);
    const mid = pickAt(Math.floor((sorted.length - 1) / 2));
    const large = pickAt(sorted.length - 1);

    return [
      {
        key: "hizli",
        label: "Hızlı",
        values: {
          model1: small,
          model2: small,
          model3: small,
        },
      },
      {
        key: "dengeli",
        label: "Dengeli",
        values: {
          model1: small,
          model2: mid,
          model3: mid,
        },
      },
      {
        key: "kaliteli",
        label: "Kaliteli",
        values: {
          model1: mid,
          model2: large,
          model3: large,
        },
      },
    ];
  }, [availableModels]);

  async function createSession() {
    if (!modelSelection.model1 || !modelSelection.model2 || !modelSelection.model3) return;
    try {
      if (sendingSessionId) {
        abortInFlight();
      }
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          baslik: DEFAULT_TITLE,
          models: modelSelection,
        }),
      });
      const data = await res.json();
      if (handleAuthFailure(res)) return;
      if (!res.ok) throw new Error(data.mesaj || "Oturum oluşturulamadı.");

      localStorage.setItem("modelSelection", JSON.stringify(modelSelection));
      setShowModelPanel(false);
      await loadSessions(data._id);
      setInput("");
    } catch (err) {
      setSessionHata(err.message);
    }
  }

  async function mesajGonder() {
    if (!input.trim() || yukleniyor || !activeSessionId) return;
    const soru = input.trim();
    const sessionId = activeSessionId;
    const messageBaseId = makeMessageId();
    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    inFlightControllerRef.current = controller;
    setInput("");
    setActiveDetailId(null);
    setMesajlar((prev) => [...prev, { id: `${messageBaseId}-user`, rol: "user", icerik: soru }]);
    setYukleniyor(true);
    setSendingSessionId(sessionId);

    const baslik = messagesNeedTitle() ? titleFromPrompt(soru) : undefined;

    try {
      const res = await fetch(`/api/chat/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        signal: controller.signal,
        body: JSON.stringify({ mesaj: soru, baslik }),
      });
      const data = await res.json();
      if (handleAuthFailure(res)) return;
      if (!res.ok) throw new Error(data.mesaj || "Hata oluştu.");
      if (controller.signal.aborted || requestId !== requestIdRef.current) return;
      if (activeSessionRef.current !== sessionId) return;
      setMesajlar((prev) => [
        ...prev,
        {
          id: `${messageBaseId}-assistant`,
          rol: "assistant",
          icerik: data.final_yanit,
          pipeline: data.pipeline,
        },
      ]);
      if (data.baslik) {
        await loadSessions(sessionId);
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      if (requestId !== requestIdRef.current) return;
      if (activeSessionRef.current !== sessionId) return;
      setMesajlar((prev) => [...prev, { rol: "hata", icerik: err.message }]);
    } finally {
      if (requestId === requestIdRef.current) {
        setYukleniyor(false);
        setSendingSessionId(null);
        inFlightControllerRef.current = null;
      }
    }
  }

  function messagesNeedTitle() {
    const session = sessions.find((s) => s._id === activeSessionId);
    if (!session) return false;
    if (session.ad !== DEFAULT_TITLE) return false;
    return !mesajlar.some((m) => m.rol === "assistant" || m.rol === "user");
  }

  function titleFromPrompt(text) {
    const temiz = text.replace(/\s+/g, " ").trim();
    if (!temiz) return DEFAULT_TITLE;
    return temiz.slice(0, 60);
  }

  function startEditing(session) {
    setEditingSessionId(session._id);
    setEditingTitle(session.ad || "");
  }

  async function saveTitle() {
    const baslik = (editingTitle || "").trim();
    if (!editingSessionId) {
      setSessionHata("Sohbet seçili değil.");
      return;
    }
    if (!baslik) {
      setSessionHata("Başlık boş olamaz.");
      return;
    }
    try {
      setSessionHata("");
      const res = await fetch(`/api/chat/${editingSessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ baslik }),
      });
      const data = await res.json();
      if (handleAuthFailure(res)) return;
      if (!res.ok) throw new Error(data.mesaj || "Baslik guncellenemedi.");
      setSessions((prev) => prev.map((s) => (s._id === editingSessionId ? data : s)));
      if (activeSessionId === editingSessionId) {
        setActiveSessionId(data._id);
      }
      setEditingSessionId(null);
      setEditingTitle("");
    } catch (err) {
      setSessionHata(err.message);
    }
  }

  async function deleteSession(sessionId) {
    try {
      if (sendingSessionId) {
        abortInFlight();
      }
      const res = await fetch(`/api/chat/${sessionId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeaders },
      });
      const data = await res.json();
      if (handleAuthFailure(res)) return;
      if (!res.ok) throw new Error(data.mesaj || "Sohbet silinemedi.");

      const nextSessions = sessions.filter((s) => s._id !== sessionId);
      setSessions(nextSessions);

      if (activeSessionId === sessionId) {
        const nextId = nextSessions[0]?._id || null;
        setActiveSessionId(nextId);
        if (nextId) {
          await loadSessionDetail(nextId);
        } else {
          setMesajlar([]);
        }
      }
    } catch (err) {
      setSessionHata(err.message);
    }
  }

  function cancelEditing() {
    setEditingSessionId(null);
    setEditingTitle("");
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
          <Link href="/translate" className="text-gray-400 hover:text-gray-200 text-sm">
            Çeviri
          </Link>
          <span className="text-gray-400 text-sm">{kullanici?.ad}</span>
          <button onClick={cikisYap} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
            Çıkış
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 px-6 py-6">
        <aside className="col-span-12 md:col-span-4 lg:col-span-3 border border-gray-800 rounded-2xl p-4 bg-gray-900/40 h-fit self-start">
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-900/80 backdrop-blur py-2">
            <p className="text-gray-200 text-sm font-medium">Sohbetler</p>
            <button
              onClick={openModelPanel}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Yeni Sohbet
            </button>
          </div>

          <div className="space-y-2 max-h-[65vh] overflow-y-auto">
            {sessions.length === 0 && (
              <div className="text-gray-500 text-xs">Henüz sohbet yok. “Yeni Sohbet” ile başlat.</div>
            )}
            {sessions.map((s) => (
              <div
                key={s._id}
                className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm cursor-pointer border ${
                  s._id === activeSessionId
                    ? "border-blue-500 bg-blue-950/40 text-white shadow-[inset_3px_0_0_0_rgba(59,130,246,0.8)]"
                    : "border-transparent hover:border-gray-700 text-gray-300"
                }`}
                onClick={() => {
                  if (sendingSessionId && sendingSessionId !== s._id) {
                    abortInFlight();
                  }
                  setActiveSessionId(s._id);
                  loadSessionDetail(s._id);
                }}
              >
                <span className="truncate">{s.ad || DEFAULT_TITLE}</span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(s);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-300"
                    title="Sohbet adını düzenle"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(s._id);
                    }}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col border border-gray-800 rounded-2xl bg-gray-900/30">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
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

            {mesajlar.map((m) => {
              const pipeline = normalizePipeline(m.pipeline);
              const showDetail = pipeline && activeDetailId === m.id;
              return (
                <div key={m.id || makeMessageId()} className="space-y-2">
                  <div className={`flex ${m.rol === "user" ? "justify-end" : "justify-start"}`}>
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
                  {pipeline && (
                    <div className={`flex ${m.rol === "user" ? "justify-end" : "justify-start"}`}>
                      <button
                        onClick={() => setActiveDetailId(showDetail ? null : m.id)}
                        className="text-xs text-gray-400 hover:text-gray-200"
                      >
                        {showDetail ? "Detayı Kapat" : "Detay"}
                      </button>
                    </div>
                  )}
                  {pipeline && showDetail && (
                    <div className="border border-gray-800 rounded-xl p-4 space-y-3 bg-gray-900/60">
                      <div className="flex items-center justify-between">
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Pipeline Detayı</p>
                        <button
                          className="text-xs text-gray-500 hover:text-gray-300"
                          onClick={() => setActiveDetailId(null)}
                        >
                          Kapat
                        </button>
                      </div>
                      {[pipeline.model1, pipeline.model2, pipeline.model3].filter(Boolean).map((adim, idx) => (
                        <div key={`${idx}-${adim?.model_id || "step"}`} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              idx === 0 ? "bg-blue-900 text-blue-300" :
                              idx === 1 ? "bg-orange-900 text-orange-300" :
                              "bg-purple-900 text-purple-300"
                            }`}>{adim?.rol}</span>
                            <span className="text-gray-600 text-xs">{adim?.model_id} · {adim?.sure_ms}ms</span>
                          </div>
                          <p className="text-gray-400 text-xs leading-relaxed pl-2 border-l border-gray-700">
                            {adim?.icerik?.slice(0, 200)}{adim?.icerik?.length > 200 ? "..." : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isActiveLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-2xl px-4 py-3 text-sm text-gray-400">
                  <span className="animate-pulse">3 model çalışıyor...</span>
                </div>
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
                placeholder={activeSessionId ? "Sorunuzu yazın..." : "Oturum seçin veya oluşturun..."}
                className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                disabled={isActiveLoading || !activeSessionId}
              />
              <button
                onClick={mesajGonder}
                disabled={isActiveLoading || !input.trim() || !activeSessionId}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-xl px-5 py-3 text-sm font-medium transition-colors"
              >
                Gönder
              </button>
            </div>
          </div>
        </section>
      </div>

      {showModelPanel && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-lg font-semibold">Yeni Sohbet</h2>
              <button
                onClick={() => setShowModelPanel(false)}
                className="text-gray-500 hover:text-gray-300"
              >
                Kapat
              </button>
            </div>

            <p className="text-gray-400 text-sm">Model seçimlerini yap ve sohbeti başlat.</p>

            {modelError && (
              <div className="bg-amber-950/60 border border-amber-800 text-amber-200 text-xs rounded-lg px-3 py-2">
                {modelError}
              </div>
            )}

            {modelLoading && (
              <p className="text-gray-500 text-sm">Model listesi yükleniyor...</p>
            )}

            {!modelLoading && (
              <div className="space-y-4">
                {presets.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {presets.map((preset) => (
                      <button
                        key={preset.key}
                        onClick={() => setModelSelection(preset.values)}
                        className="text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                )}
                <div className="space-y-3">
                  {(["model1", "model2", "model3"]).map((key, idx) => (
                    <div key={key} className="space-y-1">
                      <label className="text-gray-400 text-xs">Model {idx + 1}</label>
                      <select
                        value={modelSelection[key]}
                        onChange={(e) => setModelSelection((prev) => ({ ...prev, [key]: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                      >
                        {availableModels.length === 0 && (
                          <option value="">Model bulunamadı</option>
                        )}
                        {availableModels.map((m) => (
                          <option key={`${key}-${m}`} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModelPanel(false)}
                className="text-gray-400 text-sm"
              >
                Vazgeç
              </button>
              <button
                onClick={createSession}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm"
                disabled={modelLoading}
              >
                Sohbeti Başlat
              </button>
            </div>
          </div>
        </div>
      )}

      {editingSessionId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-white text-lg font-semibold">Sohbet Adını Düzenle</h2>
            <input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
            />
            <div className="flex items-center justify-end gap-3">
              <button onClick={cancelEditing} className="text-gray-400 text-sm">Vazgeç</button>
              <button onClick={saveTitle} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
