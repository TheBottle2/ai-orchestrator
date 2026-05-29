"use client";
// React Error Boundary - component crash durumunda kullanici dostu hata ekrani

export default function GlobalError({ error, reset }) {
return (
<div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
<div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 border border-red-800 text-center space-y-4">
<h2 className="text-red-400 text-xl font-semibold">Bir şeyler ters gitti</h2>
<p className="text-gray-400 text-sm">{error?.message || "Beklenmeyen bir hata oluştu."}</p>
<button
onClick={reset}
className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm"
>
Tekrar Dene
</button>
</div>
</div>
);
}
