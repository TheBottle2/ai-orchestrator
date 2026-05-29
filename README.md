# AI Orchestrator

> 🇹🇷 Türkçe | 🇬🇧 [English](#english)

---

## 🇹🇷 Türkçe

### Proje Tanıtımı

AI Orchestrator, birden fazla yerel yapay zeka modelini sıralı bir pipeline ile çalıştıran, kullanıcı yönetimi ve sohbet geçmişi sunan bir web uygulamasıdır. Tüm modeller CPU üzerinde yerel olarak çalışır — bulut API gerektirmez.

Üç model birbiriyle "konuşarak" ortak bir sonuca ulaşır:

- **Model 1 — Yanıtlayıcı:** Kullanıcının sorusuna bağımsız bir ilk yanıt üretir.
- **Model 2 — Eleştirmen:** Model 1'in yanıtını analiz eder, eksik ve hatalı noktaları belirtir.
- **Model 3 — Sentezci:** Her iki çıktıyı birleştirerek tek, tutarlı bir final yanıt üretir.

Her adımın model kimliği, rolü, çıktısı ve süresi (ms) arayüzde **Pipeline Detayı** olarak görüntülenir.

---

### Kullanılan Teknolojiler

| Katman | Teknoloji |
|---|---|
| Frontend & Backend | Next.js 16 (App Router, saf JavaScript) |
| Veritabanı | MongoDB + Mongoose |
| AI Model Sunucusu | Ollama (OpenAI uyumlu `/v1/chat/completions` API) |
| Doğrulama | Zod |
| Kimlik Doğrulama | JWT + bcryptjs |
| Stil | Tailwind CSS 4 |

---

### Pipeline Akışı

```
Kullanıcı sorusu
      │
      ▼
Model 1 — Yanıtlayıcı
(qwen2.5:1.5b)
      │ ilk yanıt
      ▼
Model 2 — Eleştirmen
(qwen2.5:3b)
      │ yanıt + eleştiri
      ▼
Model 3 — Sentezci
(llama3.2:3b)
      │ final birleşik yanıt
      ▼
Kullanıcıya gösterilir + MongoDB'ye kaydedilir
```

Modeller oturum başına seçilebilir. **Hızlı**, **Dengeli** ve **Kaliteli** ön ayarları model boyutuna göre otomatik öneri sunar.

---

### Özellikler

- **3-Model Pipeline:** Yanıtlayıcı → Eleştirmen → Sentezci sıralı orkestrasyon
- **Oturum Yönetimi:** Sohbet oluşturma, yeniden adlandırma, silme
- **Pipeline Detayı:** Her adımın model ID, rol, çıktı ve süre bilgisi
- **Model Seçimi:** Oturum bazlı model atama, boyut tabanlı ön ayarlar
- **Çeviri:** 9 dilde metin çevirisi (`/translate` sayfası)
- **JWT Kimlik Doğrulama:** Bearer token ile korumalı API route'ları + middleware
- **Zengin Metin:** `**kalın**`, `*italik*`, `__altı çizili__`, `~~üstü çizili~~`, `` `kod` `` biçimleri
- **Sağlık Kontrolü:** `/api/health` endpoint'i ile MongoDB ve Ollama durum izleme
- **Dark Theme:** Tüm arayüz koyu temada

---

### Mimari — Klasör Yapısı

```
src/
├── core/
│   ├── config.js              # Ortam değişkenleri ve model ayarları
│   └── db.js                  # MongoDB bağlantısı (cached pooling)
│
├── base/
│   ├── BaseModel.js           # Ortak Mongoose şema alanları (DRY)
│   ├── BaseRepo.js            # Ortak CRUD işlemleri
│   └── BaseManager.js         # Ortak iş mantığı katmanı
│
├── lib/
│   ├── auth.js                # JWT token doğrulama yardımcısı
│   └── api-error.js           # Tutarlı API hata yönetimi utility'si
│
├── features/
│   ├── user/
│   │   ├── user.model.js      # Kullanıcı şeması
│   │   ├── user.repo.js       # Kullanıcı veritabanı işlemleri
│   │   ├── user.manager.js    # Kayıt, giriş, JWT üretimi
│   │   └── dto/user.dto.js    # Zod doğrulama + DTO dönüşümü
│   └── chat/
│       ├── chat.model.js      # Sohbet + pipeline şeması
│       ├── chat.repo.js       # Sohbet veritabanı işlemleri
│       ├── chat.manager.js    # 3-model pipeline orkestrasyonu
│       └── dto/chat.dto.js    # Zod doğrulama şemaları
│
├── middleware.js              # API route kimlik doğrulama katmanı
│
└── app/
    ├── api/
    │   ├── auth/register/route.js
    │   ├── auth/login/route.js
    │   ├── chat/route.js
    │   ├── chat/[id]/route.js
    │   ├── chat/[id]/messages/route.js
    │   ├── models/route.js
    │   ├── translate/route.js
    │   └── health/route.js
    ├── error.js               # React Error Boundary
    ├── login/page.js
    ├── register/page.js
    ├── chat/page.js
    └── translate/page.js
```

**Katman görevleri:**

- `core/` → Teknik altyapı (DB, config)
- `base/` → DRY ilkesi — tüm feature'ların miras aldığı temel sınıflar
- `lib/` → Yardımcı fonksiyonlar (auth, hata yönetimi)
- `features/` → Her özellik kendi klasöründe (package by feature)
- `middleware.js` → Next.js middleware ile API route koruması
- `app/api/` → Controller katmanı — sadece yönlendirme yapar, iş mantığı içermez

---

### Kurulum

#### Gereksinimler

- Node.js 18+
- MongoDB (yerel veya Atlas)
- [Ollama](https://ollama.com) (yerel model sunucusu)

#### 1. Repoyu klonla

```bash
git clone https://github.com/TheBottle2/ai-orchestrator.git
cd ai-orchestrator
```

#### 2. Bağımlılıkları yükle

```bash
npm install
```

#### 3. Ortam değişkenlerini ayarla

`.env.example` dosyasını `.env.local` olarak kopyala ve değerlerini düzenle:

```bash
cp .env.example .env.local
```

`.env.local` içerği:

```env
MONGODB_URI=mongodb://localhost:27017/ai-orchestrator
JWT_SECRET=<openssl rand -base64 32 ile üret>
OLLAMA_BASE_URL=http://localhost:11434
LM_MODEL_1=qwen2.5:1.5b
LM_MODEL_2=qwen2.5:3b
LM_MODEL_3=llama3.2:3b
MAX_TOKENS=128
TEMPERATURE=0.6
```

> **Önemli:** `JWT_SECRET` üretmek için: `openssl rand -base64 32`

#### 4. Ollama modellerini yükle

```bash
ollama pull qwen2.5:1.5b
ollama pull qwen2.5:3b
ollama pull llama3.2:3b
ollama pull translategemma:4b   # çeviri için (isteğe bağlı)
```

#### 5. MongoDB'yi başlat

```bash
sudo systemctl start mongod
```

#### 6. Uygulamayı çalıştır

```bash
npm run dev
```

`http://localhost:3000` adresine git, kayıt ol ve kullanmaya başla.

---

### API Endpoint'leri

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| POST | `/api/auth/register` | Yeni kullanıcı kaydı | Hayır |
| POST | `/api/auth/login` | Kullanıcı girişi | Hayır |
| GET | `/api/chat` | Kullanıcının sohbetlerini listeler | Evet |
| POST | `/api/chat` | Yeni sohbet oturumu oluşturur | Evet |
| GET | `/api/chat/[id]` | Sohbet detayını getirir | Evet |
| PATCH | `/api/chat/[id]` | Sohbet başlığını günceller | Evet |
| DELETE | `/api/chat/[id]` | Sohbeti siler (soft delete) | Evet |
| POST | `/api/chat/[id]/messages` | Mesaj gönderir, pipeline çalışır | Evet |
| GET | `/api/models` | Kullanılabilir Ollama modellerini listeler | Evet |
| POST | `/api/translate` | Metin çevirisi yapar | Evet |
| GET | `/api/health` | MongoDB + Ollama sağlık kontrolü | Hayır |

Tüm korumalı endpoint'ler `Authorization: Bearer <token>` header'ı gerektirir.

---

### Güvenlik

- JWT secret zorunlu — fallback yok (eksik ise uygulama başlamaz)
- Next.js middleware ile API route koruması
- MongoDB ObjectId validasyonu
- Zod ile girdi doğrulama (email, max uzunluk vb.)
- Güvenlik header'ları: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
- Kullanıcı sahipliği kontrolü (IDOR koruması)
- Çeviri endpoint'inde dil validasyonu (prompt injection önleme)

---

### Lisans

MIT

---

## 🇬🇧 English <a name="english"></a>

### About

AI Orchestrator is a web application that runs multiple local AI models in a sequential pipeline, providing user management and chat history. All models run locally on CPU — no cloud API required.

Three models "talk" to each other to reach a consensus:

- **Model 1 — Answerer:** Generates an independent initial response to the user's question.
- **Model 2 — Critic:** Analyzes Model 1's response and identifies weaknesses or errors.
- **Model 3 — Synthesizer:** Combines both outputs into a single, coherent final answer.

Each step's model ID, role, output and duration (ms) is displayed in the UI as **Pipeline Detail**.

---

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend & Backend | Next.js 16 (App Router, plain JavaScript) |
| Database | MongoDB + Mongoose |
| AI Model Server | Ollama (OpenAI-compatible `/v1/chat/completions` API) |
| Validation | Zod |
| Authentication | JWT + bcryptjs |
| Styling | Tailwind CSS 4 |

---

### Pipeline Flow

```
User question
      │
      ▼
Model 1 — Answerer
(qwen2.5:1.5b)
      │ initial answer
      ▼
Model 2 — Critic
(qwen2.5:3b)
      │ answer + critique
      ▼
Model 3 — Synthesizer
(llama3.2:3b)
      │ final merged answer
      ▼
Shown to user + saved to MongoDB
```

Models are selectable per session. **Fast**, **Balanced** and **Quality** presets auto-suggest based on model size.

---

### Features

- **3-Model Pipeline:** Answerer → Critic → Synthesizer sequential orchestration
- **Session Management:** Create, rename, delete chats
- **Pipeline Detail:** Model ID, role, output and duration for each step
- **Model Selection:** Per-session model assignment, size-based presets
- **Translation:** Text translation in 9 languages (`/translate` page)
- **JWT Authentication:** Bearer token protected API routes + middleware
- **Rich Text:** `**bold**`, `*italic*`, `__underline__`, `~~strikethrough~~`, `` `code` `` formats
- **Health Check:** MongoDB and Ollama status monitoring via `/api/health`
- **Dark Theme:** Full dark UI

---

### Architecture — Folder Structure

```
src/
├── core/
│   ├── config.js              # Environment variables and model config
│   └── db.js                  # MongoDB connection (cached pooling)
│
├── base/
│   ├── BaseModel.js           # Shared Mongoose schema fields (DRY)
│   ├── BaseRepo.js            # Shared CRUD operations
│   └── BaseManager.js         # Shared business logic layer
│
├── lib/
│   ├── auth.js                # JWT token verification helper
│   └── api-error.js           # Consistent API error handling utility
│
├── features/
│   ├── user/
│   │   ├── user.model.js      # User schema
│   │   ├── user.repo.js       # User database operations
│   │   ├── user.manager.js    # Registration, login, JWT generation
│   │   └── dto/user.dto.js    # Zod validation + DTO transformation
│   └── chat/
│       ├── chat.model.js      # Chat + pipeline schema
│       ├── chat.repo.js       # Chat database operations
│       ├── chat.manager.js    # 3-model pipeline orchestration
│       └── dto/chat.dto.js    # Zod validation schemas
│
├── middleware.js              # API route authentication layer
│
└── app/
    ├── api/
    │   ├── auth/register/route.js
    │   ├── auth/login/route.js
    │   ├── chat/route.js
    │   ├── chat/[id]/route.js
    │   ├── chat/[id]/messages/route.js
    │   ├── models/route.js
    │   ├── translate/route.js
    │   └── health/route.js
    ├── error.js               # React Error Boundary
    ├── login/page.js
    ├── register/page.js
    ├── chat/page.js
    └── translate/page.js
```

---

### Installation

#### Requirements

- Node.js 18+
- MongoDB (local or Atlas)
- [Ollama](https://ollama.com) (local model server)

#### 1. Clone the repo

```bash
git clone https://github.com/TheBottle2/ai-orchestrator.git
cd ai-orchestrator
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

`.env.local` contents:

```env
MONGODB_URI=mongodb://localhost:27017/ai-orchestrator
JWT_SECRET=<generate with: openssl rand -base64 32>
OLLAMA_BASE_URL=http://localhost:11434
LM_MODEL_1=qwen2.5:1.5b
LM_MODEL_2=qwen2.5:3b
LM_MODEL_3=llama3.2:3b
MAX_TOKENS=128
TEMPERATURE=0.6
```

> **Important:** Generate `JWT_SECRET` with: `openssl rand -base64 32`

#### 4. Pull Ollama models

```bash
ollama pull qwen2.5:1.5b
ollama pull qwen2.5:3b
ollama pull llama3.2:3b
ollama pull translategemma:4b   # for translation (optional)
```

#### 5. Start MongoDB

```bash
sudo systemctl start mongod
```

#### 6. Run the app

```bash
npm run dev
```

Go to `http://localhost:3000`, register and start using.

---

### API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/chat` | List user's chats | Yes |
| POST | `/api/chat` | Create new chat session | Yes |
| GET | `/api/chat/[id]` | Get chat detail | Yes |
| PATCH | `/api/chat/[id]` | Update chat title | Yes |
| DELETE | `/api/chat/[id]` | Delete chat (soft delete) | Yes |
| POST | `/api/chat/[id]/messages` | Send message, run pipeline | Yes |
| GET | `/api/models` | List available Ollama models | Yes |
| POST | `/api/translate` | Translate text | Yes |
| GET | `/api/health` | MongoDB + Ollama health check | No |

All protected endpoints require `Authorization: Bearer <token>` header.

---

### Security

- JWT secret mandatory — no fallback (app won't start without it)
- Next.js middleware for API route protection
- MongoDB ObjectId validation
- Zod input validation (email format, max length, etc.)
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
- User ownership checks (IDOR protection)
- Language validation on translate endpoint (prompt injection prevention)

---

### License

MIT
