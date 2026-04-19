# AI Orchestrator

> 🇹🇷 Türkçe | 🇬🇧 [English](#english)

---

## 🇹🇷 Türkçe

### Proje Tanıtımı

AI Orchestrator, birden fazla yerel yapay zeka modelini sıralı bir pipeline ile çalıştıran, kullanıcı yönetimi ve sohbet geçmişi sunan bir web uygulamasıdır.

Üç model birbiriyle "konuşarak" ortak bir sonuca ulaşır:
- **Model 1 — Yanıtlayıcı:** Kullanıcının sorusuna bağımsız bir ilk yanıt üretir.
- **Model 2 — Eleştirmen:** Model 1'in yanıtını analiz eder, eksik ve hatalı noktaları belirtir.
- **Model 3 — Sentezci:** Her iki çıktıyı birleştirerek tek, tutarlı bir final yanıt üretir.

---

### Kullanılan Teknolojiler

| Katman | Teknoloji |
|---|---|
| Frontend & Backend | Next.js 16 (App Router, saf JavaScript) |
| Veritabanı | MongoDB + Mongoose |
| AI Model Sunucusu | LM Studio (OpenAI uyumlu API) |
| Doğrulama | Zod |
| Kimlik Doğrulama | JWT + bcryptjs |

---

### Pipeline Akışı

```
Kullanıcı sorusu
    │
    ▼
Model 1 — Yanıtlayıcı
(qwen/qwen3-1.7b)
    │  ilk yanıt
    ▼
Model 2 — Eleştirmen
(mistralai/ministral-3-3b)
    │  yanıt + eleştiri
    ▼
Model 3 — Sentezci
(liquid/lfm2-1.2b)
    │  final birleşik yanıt
    ▼
Kullanıcıya gösterilir + MongoDB'ye kaydedilir
```

Her adımın model kimliği, rolü, çıktısı ve süresi (ms) arayüzde **Pipeline Detayı** olarak görüntülenir.

---

### Mimari — Klasör Yapısı

```
src/
├── core/
│   ├── config.js          # Ortam değişkenleri ve model ayarları
│   └── db.js              # MongoDB bağlantısı (cached)
│
├── base/
│   ├── BaseModel.js       # Ortak Mongoose şema alanları (DRY)
│   ├── BaseRepo.js        # Ortak CRUD işlemleri
│   └── BaseManager.js     # Ortak iş mantığı katmanı
│
├── features/
│   ├── user/
│   │   ├── user.model.js       # Kullanıcı şeması
│   │   ├── user.repo.js        # Kullanıcı veritabanı işlemleri
│   │   ├── user.manager.js     # Kayıt, giriş, JWT
│   │   └── dto/user.dto.js     # Zod doğrulama şemaları
│   └── chat/
│       ├── chat.model.js       # Sohbet + pipeline şeması
│       ├── chat.repo.js        # Sohbet veritabanı işlemleri
│       ├── chat.manager.js     # 3-model pipeline orkestrasyonu
│       └── dto/chat.dto.js     # Zod doğrulama şemaları
│
└── app/
    ├── api/
    │   ├── auth/register/route.js
    │   ├── auth/login/route.js
    │   └── chat/[id]/messages/route.js
    ├── login/page.js
    ├── register/page.js
    └── chat/page.js
```

**Katman görevleri:**
- `core/` → Teknik altyapı (DB, config)
- `base/` → DRY ilkesi — tüm feature'ların miras aldığı temel sınıflar
- `features/` → Her özellik kendi klasöründe (package by feature)
- `app/api/` → Controller katmanı — sadece yönlendirme yapar, iş mantığı içermez

---

### Kurulum

#### Gereksinimler
- Node.js 18+
- MongoDB
- LM Studio (yerel model sunucusu)

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
`.env.local` dosyası oluştur:
```env
MONGODB_URI=mongodb://localhost:27017/ai-orchestrator
LM_STUDIO_BASE_URL=http://127.0.0.1:1234
LM_MODEL_1=qwen/qwen3-1.7b
LM_MODEL_2=mistralai/ministral-3-3b
LM_MODEL_3=liquid/lfm2-1.2b
JWT_SECRET=gizli-anahtar-degistir
```

#### 4. LM Studio'yu başlat
LM Studio'yu aç → 3 modeli yükle → Local Server'ı aktif et.

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

---

## 🇬🇧 English <a name="english"></a>

### About

AI Orchestrator is a web application that runs multiple local AI models in a sequential pipeline, providing user management and chat history.

Three models "talk" to each other to reach a consensus:
- **Model 1 — Answerer:** Generates an independent initial response to the user's question.
- **Model 2 — Critic:** Analyzes Model 1's response and identifies weaknesses or errors.
- **Model 3 — Synthesizer:** Combines both outputs into a single, coherent final answer.

---

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend & Backend | Next.js 16 (App Router, plain JavaScript) |
| Database | MongoDB + Mongoose |
| AI Model Server | LM Studio (OpenAI-compatible API) |
| Validation | Zod |
| Authentication | JWT + bcryptjs |

---

### Pipeline Flow

```
User question
    │
    ▼
Model 1 — Answerer
(qwen/qwen3-1.7b)
    │  initial answer
    ▼
Model 2 — Critic
(mistralai/ministral-3-3b)
    │  answer + critique
    ▼
Model 3 — Synthesizer
(liquid/lfm2-1.2b)
    │  final merged answer
    ▼
Shown to user + saved to MongoDB
```

Each step's model ID, role, output and duration (ms) is displayed in the UI as **Pipeline Detail**.

---

### Architecture — Folder Structure

```
src/
├── core/
│   ├── config.js          # Environment variables and model config
│   └── db.js              # MongoDB connection (cached)
│
├── base/
│   ├── BaseModel.js       # Shared Mongoose schema fields (DRY)
│   ├── BaseRepo.js        # Shared CRUD operations
│   └── BaseManager.js     # Shared business logic layer
│
├── features/
│   ├── user/
│   │   ├── user.model.js
│   │   ├── user.repo.js
│   │   ├── user.manager.js
│   │   └── dto/user.dto.js
│   └── chat/
│       ├── chat.model.js
│       ├── chat.repo.js
│       ├── chat.manager.js
│       └── dto/chat.dto.js
│
└── app/
    ├── api/
    │   ├── auth/register/route.js
    │   ├── auth/login/route.js
    │   └── chat/[id]/messages/route.js
    ├── login/page.js
    ├── register/page.js
    └── chat/page.js
```

---

### Installation

#### Requirements
- Node.js 18+
- MongoDB
- LM Studio (local model server)

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
Create `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/ai-orchestrator
LM_STUDIO_BASE_URL=http://127.0.0.1:1234
LM_MODEL_1=qwen/qwen3-1.7b
LM_MODEL_2=mistralai/ministral-3-3b
LM_MODEL_3=liquid/lfm2-1.2b
JWT_SECRET=change-this-secret
```

#### 4. Start LM Studio
Open LM Studio → load 3 models → activate Local Server.

#### 5. Start MongoDB
```bash
sudo systemctl start mongod
```

#### 6. Run the app
```bash
npm run dev
```

Go to `http://localhost:3000`, register and start using.
