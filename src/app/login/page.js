"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", sifre: "" });
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setHata("");
    setYukleniyor(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mesaj || "Giriş başarısız.");
      localStorage.setItem("token", data.token);
      localStorage.setItem("kullanici", JSON.stringify(data.kullanici));
      router.push("/chat");
    } catch (err) {
      setHata(err.message);
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 border border-gray-800">
        <h1 className="text-white text-2xl font-semibold mb-2">Giriş Yap</h1>
        <p className="text-gray-400 text-sm mb-8">AI Orchestrator'a hoş geldin</p>

        {hata && (
          <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3 mb-6">
            {hata}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm block mb-1">E-posta</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              placeholder="ornek@mail.com"
              required
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm block mb-1">Şifre</label>
            <input
              type="password"
              value={form.sifre}
              onChange={(e) => setForm({ ...form, sifre: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              placeholder="••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={yukleniyor}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
          >
            {yukleniyor ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <p className="text-gray-500 text-sm text-center mt-6">
          Hesabın yok mu?{" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-300">
            Kayıt ol
          </Link>
        </p>
      </div>
    </div>
  );
}
