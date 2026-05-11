"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  // Oturum kontrolu: token varsa sohbet, yoksa giris sayfasina yonlendir
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/chat");
    } else {
      router.push("/login");
    }
  }, [router]);

  // Yukleme ekrani: yonlendirme bitene kadar gorunur
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-400 text-sm">Yükleniyor...</div>
    </div>
  );
}
