# دليل نشر Nexus Store

## نظرة عامة

دليل تقني خطوة بخطوة لنشر منصة Nexus Store في بيئة الإنتاج باستخدام خدمات مجانية وتكلفة منخفضة (Vercel + Railway + Firebase Storage).

## المكونات

- **المتجر** (واجهة العميل): React + Vite — `artifacts/techzone`
- **لوحة التحكم** (CMS): React + Vite — `artifacts/techzone-admin`
- **الخادم** (API): Express 5 + Node.js 24 — `artifacts/api-server`
- **قاعدة البيانات**: PostgreSQL (Drizzle ORM) — `lib/db`
- **المشروع**: PNPM Monorepo

## المخطط المعماري

```
┌──────────────┐     ┌──────────────┐
│  المتجر      │     │  لوحة التحكم │
│  (Vercel)    │     │  (Vercel)    │
│  techzone    │     │  techzone-admin
└──────┬───────┘     └──────┬───────┘
       │                    │
       │  HTTPS / API        │
       └────────┬───────────┘
                │
       ┌────────▼────────┐
       │   الخادم        │
       │  (Railway)      │
       │  api-server     │
       └────────┬────────┘
                │
       ┌────────▼────────┐
       │  PostgreSQL     │
       │  (Railway/Neon) │
       └─────────────────┘

صور المنتجات: Firebase Storage (Free Tier)
```

## متغيرات البيئة (Environment Variables)

### الخادم (Railway / Render)

| المتغير | الغرض | مثال |
|---------|-------|------|
| `DATABASE_URL` | سلسلة اتصال PostgreSQL | `postgres://user:pass@host:5432/db` |
| `SESSION_SECRET` | توقيع الكوكيز (جلسات الإدارة) | نص عشوائي 32+ بايت |
| `NODE_ENV` | وضع التشغيل | `production` |
| `PORT` | منفذ HTTP | يُحدده Railway تلقائياً |
| `CORS_ORIGIN` | نطاقات الواجهات المسموح بها | `https://nexus-store.vercel.app` |

### المتجر (Vercel — `artifacts/techzone`)

| المتغير | الغرض | مثال |
|---------|-------|------|
| `VITE_API_URL` | عنوان API | `https://api.nexus-store.com/api` |

### لوحة التحكم (Vercel — `artifacts/techzone-admin`)

| المتغير | الغرض | مثال |
|---------|-------|------|
| `VITE_API_URL` | عنوان API | `https://api.nexus-store.com/api` |

## الخطوة 1: تحضير المشروع

### متطلبات مسبقة

- حسابات على: GitHub, Vercel, Railway (أو Render), Firebase
- Node.js 24+ (يستخدم المشروع `pnpm`)

### إعداد المستودع

```bash
# داخل المشروع
pnpm install
pnpm run typecheck
pnpm --filter @workspace/api-spec run codegen
pnpm --filter @workspace/db run push
```

### رفع المشروع إلى GitHub

```bash
git init
git add .
git commit -m "Nexus Store — initial setup"
git remote add origin https://github.com/yourusername/nexus-store.git
git push -u origin main
```

## الخطوة 2: نشر الخادم (Railway)

### 1. إنشاء مشروع في Railway

1. اذهب إلى `https://railway.app`
2. اختر **New Project** → **Deploy from GitHub repo**
3. اختر مستودع `nexus-store`

### 2. تكوين الخدمة

في إعدادات الخدمة:

- **Root Directory**: `artifacts/api-server`
- **Build Command**: `pnpm install && pnpm run build`
- **Start Command**: `node dist/index.mjs`
- **Port**: `5000` (Railway يختار منفذاً تلقائياً — عادة 5000 أو آخر)

### 3. إضافة متغيرات البيئة

في Railway Dashboard → Variables:

```
DATABASE_URL = (سيُنشأ تلقائياً عند إضافة PostgreSQL)
SESSION_SECRET = (أنشئ نص عشوائي 32+ بايت: openssl rand -base64 32)
NODE_ENV = production
```

### 4. إضافة قاعدة بيانات PostgreSQL

1. Railway → New → Database → PostgreSQL
2. ستوفر لك PostgreSQL مجانية بسعة 1GB
3. ستُنشأ `DATABASE_URL` تلقائياً وتوصل بالخادم

### 5. إدخال البيانات الأولية

```bash
# عبر Railway CLI أو SSH
railway run

# ثم داخل المشروع:
pnpx tsx artifacts/api-server/src/scripts/seed.ts
```

> ملاحظة: ضع نصوص seeding في `artifacts/api-server/src/scripts/seed.ts` أو نفذها يدوياً.

### 6. ربط النطاق (اختياري)

Railway → Settings → Domains:
- اضبط نطاق مخصص: `api.nexus-store.com`
- أو استخدم النطاق التلقائي: `nexus-store.up.railway.app`

## الخطوة 3: نشر الواجهات (Vercel)

### المتجر (`artifacts/techzone`)

#### 1. مشروع جديد في Vercel

1. `https://vercel.com` → Import from GitHub
2. اختر مستودع `nexus-store`
3. اضغط **Import**

#### 2. إعدادات البناء

| الإعداد | القيمة |
|---------|--------|
| Framework Preset | Vite |
| Root Directory | `artifacts/techzone` |
| Build Command | `pnpm install && pnpm run build` |
| Output Directory | `dist/public` |
| Install Command | `pnpm install` |

#### 3. متغيرات البيئة

```
VITE_API_URL = https://api.nexus-store.com/api
```

#### 4. النطاق

Vercel يوفر نطاق تلقائي: `nexus-store.vercel.app`

للربط بنطاق مخصص: Vercel → Domains → أضف `nexus-store.com`

### لوحة التحكم (`artifacts/techzone-admin`)

#### 1. مشروع جديد منفصل

أنشئ مشروع Vercel منفصل للوحة التحكم.

#### 2. إعدادات البناء

| الإعداد | القيمة |
|---------|--------|
| Framework Preset | Vite |
| Root Directory | `artifacts/techzone-admin` |
| Build Command | `pnpm install && pnpm run build` |
| Output Directory | `dist/public` |

#### 3. متغيرات البيئة

```
VITE_API_URL = https://api.nexus-store.com/api
```

#### 4. النطاق

أضف subdomain مخصص: `admin.nexus-store.com`

## الخطوة 4: استراتيجية رفع الصور

### الخيار 1: Firebase Storage (مُوصى به)

أفضل حل مجاني (5GB) لصور المنتجات وإدارة الملفات.

#### 1. إنشاء مشروع Firebase

1. اذهب إلى `https://console.firebase.google.com`
2. أنشئ مشروعاً جديداً: `nexus-store-images`
3. فعّل **Storage** (البدء في وضع "الاختبار")

#### 2. الحصول على مفاتيح JSON

Firebase Console → Settings → Service Accounts:
- انقر "Generate new private key"
- احفظ ملف `serviceAccountKey.json` (لا ترفعه إلى GitHub)

#### 3. إعداد Firebase Storage في الخادم

```bash
# تثبيت في الخادم
cd artifacts/api-server
pnpm add firebase-admin
```

أضف المتغيرات البيئية:

```
FIREBASE_PROJECT_ID = nexus-store-images
FIREBASE_STORAGE_BUCKET = nexus-store-images.appspot.com
```

#### 4. كود رفع الصور

```typescript
// artifacts/api-server/src/lib/firebase.ts
import { initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);

const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

export const bucket = getStorage().bucket();
```

#### 5. نقطة رفع الصور

```typescript
// في أي route يحتاج رفع صور
import { bucket } from "../lib/firebase";

// رفع الملف
const upload = await bucket.upload(filePath, {
  destination: `products/${productId}/${filename}`,
  public: true,
});

// رابط الملف
const url = `https://storage.googleapis.com/${bucket.name}/${upload[0].name}`;
```

### الخيار 2: CDN خارجي

إذا كان حجم الصور صغيراً، استخدم CDN مجاني مثل:
- **Cloudflare R2** (أرخص S3)
- **AWS S3** + CloudFront (أفضل أداء)
- **Cloudinary** (تحويل تلقائي للصور)

### الخيار 3: تخزين محلي (غير مُوصى به للإنتاج)

```
UPLOAD_DIR = /tmp/uploads
```

لا تُستخدم في الإنتاج — ستفقد الملفات عند إعادة تشغيل الخادم.

## الخطوة 5: إدارة قاعدة البيانات

### المخطط

المخطط الحقيقي في المشروع (`lib/db/src/schema/`) يتضمن:
- `products`, `categories`, `brands`, `orders`, `orderItems`
- `customers`, `adminAccounts`, `sessions`
- `giftCards`, `subscriptionPlans`, `customerSubscriptions`
- `reviews`, `blogPosts`, `media`, `auditLogs`

### المهجرات

نستخدم **Drizzle Kit** لإدارة التغييرات على المخطط:

```bash
# توليد مهجرات جديدة
pnpm --filter @workspace/db run generate

# تطبيق المهجرات على الإنتاج
pnpm --filter @workspace/db run migrate

# أو الدفع المباشر (dev فقط)
pnpm --filter @workspace/db run push
```

> تحذير: `push` يغيّر المخطط مباشرة. في الإنتاج، استخدم `migrate` دائماً.

### تطبيق مهجرات على Railway

```bash
# عبر Railway CLI
railway run

# ثم داخل المشروع:
pnpm --filter @workspace/db run migrate
```

### نسخ احتياطي

#### 1. Railway PostgreSQL

Railway يعمل نسخاً احتياطياً تلقائياً.

#### 2. تصدير يدوي

```bash
# عبر pg_dump
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

## الخطوة 6: إعدادات الأمان

### HTTPS

- Vercel: يوفر HTTPS تلقائياً
- Railway: يوفر HTTPS تلقائياً
- CORS: تأكد من أن `CORS_ORIGIN` في الخادم يشمل نطاقات الواجهات فقط

### الكوكيز

في `artifacts/api-server/src/app.ts`:

```typescript
app.set("trust proxy", 1); // ثق بالبروكسي (Vercel / Railway)

app.use(cookieParser(SESSION_SECRET));
```

في الإنتاج، يجب تفعيل:

```typescript
res.cookie("session", token, {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

### سر `SESSION_SECRET`

```bash
# توليد سر آمن
openssl rand -base64 32
```

أضفه إلى Railway متغيرات البيئة.

## الخطوة 7: التحقق من النشر

### قائمة التحقق

- [ ] الخادم يستجيب على `/api/healthz` (أو أي route تختبره)
- [ ] المتجر يعرض المنتجات
- [ ] لوحة التحكم تُحمّل (أدخل `/admin`)
- [ ] تسجيل الدخول للإدارة يعمل
- [ ] رفع الصور يعمل
- [ ] قاعدة البيانات متصلة
- [ ] HTTPS مفعّل على كل النطاقات

### أمر اختبار سريع

```bash
# اختبار API
curl https://api.nexus-store.com/api/healthz

# اختبار المتجر
curl https://nexus-store.vercel.app

# اختبار لوحة التحكم
curl https://admin.nexus-store.vercel.app
```

## التحديثات والنشر المتكرر

### بعد أي تعديل على الكود

```bash
# 1. التأكد من أن الكود يعمل محلياً
pnpm run typecheck

# 2. دفع إلى GitHub
git add .
git commit -m "feat: description"
git push

# 3. سينشر Vercel + Railway تلقائياً (if auto-deploy enabled)
```

### تحديث قاعدة البيانات

```bash
# 1. تعديل المخطط في lib/db/src/schema/

# 2. توليد المهجرات
pnpm --filter @workspace/db run generate

# 3. تطبيق على الإنتاج
railway run
pnpm --filter @workspace/db run migrate

# 4. دفع الكود
```

## تكلفة الإنتاج (تقدير)

| الخدمة | التكلفة | السعة |
|--------|---------|-------|
| Vercel (الحصص المجانية) | $0 | 100GB Bandwidth, 100h Builds |
| Railway (الحصة المجانية) | $0 | 1GB RAM, 1GB Disk, 1GB DB |
| Firebase Storage | $0 | 5GB (Free tier) |
| النطاق المخصص | ~$10-$15/سنة | .com أو .net |
| **الإجمالي** | **$0–$15/سنة** | |

> إذا تجاوزت الحصص المجانية، ارفّع إلى Railway Pro ($5/شهر) أو Vercel Pro ($20/شهر).

## استكشاف الأخطاء

### الخطأ: `DATABASE_URL` غير موجود

```
DATABASE_URL must be set
```

- تأكد من إضافة PostgreSQL في Railway
- تأكد من وجود متغير `DATABASE_URL` في الإعدادات

### الخطأ: `PORT` غير موجود

```
PORT environment variable is required
```

- تأكد من أن Railway يُعيّن `PORT` تلقائياً
- أو أضفه يدوياً: `PORT=5000`

### الخطأ: CORS

```
blocked by CORS policy
```

- تأكد من أن `CORS_ORIGIN` في الخادم يشمل نطاق Vercel
- أو استخدم `app.use(cors())` مؤقتاً لحل المشكلة

### الخطأ: لا تتوفر صفحة البناء (Vercel)

```
404: NOT_FOUND
```

- تأكد من أن `Output Directory` هو `dist/public` (ليس `dist` فقط)

## مراجع

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Firebase Storage Docs](https://firebase.google.com/docs/storage)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs)
- [PNPM Workspaces](https://pnpm.io/workspaces)
