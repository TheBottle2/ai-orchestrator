// MongoDB bağlantı yönetimi - Connection pooling ile performans optimizasyonu
import mongoose from "mongoose";
// MongoDB bağlantı adresini .env.local'den al
const MONGODB_URI = process.env.MONGODB_URI;
// Güvenlik kontrolü: MONGODB_URI yoksa uygulamayı durdur
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI tanımlanmamış (.env.local dosyasını kontrol et)");
}
// Connection pooling: Her istekte yeni bağlantı açmamak için global cache
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}
// Ana bağlantı fonksiyonu - Tüm API route'ları bunu kullanır
export async function connectDB() {
  // Zaten bağlantı varsa direkt döndür (hızlı)
  if (cached.conn) return cached.conn;
  // Bağlantı yoksa, yeni bağlantı kur (ama sadece bir tane - pooling)
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => m);
  }
  // Bağlantıyı cache'le ve döndür
  cached.conn = await cached.promise;
  return cached.conn;
}
