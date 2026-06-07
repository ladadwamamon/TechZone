# دليل نشر Nexus Store على سيرفرك الخاص (Docker + Portainer + Cloudflare)

دليل كامل لرفع متجر **Nexus Store** على سيرفرك (VPS) باستخدام Docker وPortainer، مع قسم منفصل
لإعداد Cloudflare للحماية والأداء بعد رفع الموقع. كل الملفات المذكورة جاهزة داخل مجلد `deploy/`.

---

## 1. نظرة عامة على البنية

المشروع يتكوّن من ٣ خدمات + قاعدة بيانات، تعمل كلها كحاويات Docker على سيرفرك:

| الخدمة | الوصف | المنفذ الداخلي | منشور للخارج؟ |
|--------|-------|----------------|----------------|
| `db` | PostgreSQL 16 (الطلبات، المنتجات، الأكواد، المستخدمون) | 5432 | لا (داخلي فقط) |
| `api` | سيرفر Express 5 — كل المسارات تحت `/api` | 8080 | لا (داخلي فقط) |
| `web` | Nginx يقدّم المتجر + لوحة التحكم ويمرّر `/api` للسيرفر | 80 | نعم (منفذ مضيف واحد) |

توجيه المسارات (يقوم به Nginx، وهو البديل عمّا كانت توفّره منصة Replit تلقائياً):

```
المتصفح / Cloudflare
        │
        ▼
   web (Nginx)  ──────────────┐
        │                     │
   /        → المتجر (ملفات ثابتة)
   /admin/  → لوحة التحكم (ملفات ثابتة)
   /api/    → ─────────────►  api (Express)  ────►  db (PostgreSQL)
```

نقطة مهمة: المتجر ولوحة التحكم والـ API كلها على **نفس الدومين** (same-origin)، وهذا ضروري حتى تعمل
الجلسات وملفات تعريف الارتباط (cookies) بشكل صحيح. لا تفصلها على دومينات مختلفة.

---

## 2. المتطلبات

على سيرفرك (متوفّر لديك: 16GB RAM / 4 CPU / 250GB — أكثر من كافٍ):

- **Docker Engine** + **Docker Compose v2** (`docker compose ...`).
- **Portainer** (موجود لديك) — لإدارة الـ Stack بصرياً، أو سطر الأوامر مباشرة.
- نسخة من هذا المستودع (repository) على السيرفر — عبر `git clone` أو رفع مضغوط.
- منفذ مضيف حر لخدمة `web` (الافتراضي `8088`، قابل للتغيير).

> لا تحتاج تثبيت Node.js أو pnpm أو PostgreSQL على السيرفر مباشرة — كل ذلك يتم داخل الحاويات.

---

## 3. متغيرات البيئة (Environment Variables)

انسخ ملف القيم وعبّئه:

```bash
cp deploy/.env.example deploy/.env
```

ثم عدّل `deploy/.env`:

| المتغيّر | الوصف |
|----------|-------|
| `POSTGRES_USER` | اسم مستخدم قاعدة البيانات |
| `POSTGRES_PASSWORD` | كلمة مرور قوية لقاعدة البيانات |
| `POSTGRES_DB` | اسم قاعدة البيانات |
| `SESSION_SECRET` | مفتاح سرّي لتوقيع جلسات الأدمن والعملاء — **إلزامي** |
| `LOG_LEVEL` | مستوى السجلّات (افتراضي `info`) |
| `WEB_PORT` | منفذ المضيف لخدمة Nginx (افتراضي `8088`) |

ولّد `SESSION_SECRET` قوياً:

```bash
openssl rand -hex 32
```

> **مهم:** لا ترفع `deploy/.env` إلى git أبداً. احفظه على السيرفر فقط.
> في الإنتاج تُفعَّل ملفات الكوكي بخاصية `Secure`، أي أنها تعمل عبر HTTPS فقط — وهذا
> مضمون لأن Cloudflare سيقدّم الموقع عبر HTTPS.

---

## 4. ملفات النشر الجاهزة (داخل `deploy/`)

| الملف | الدور |
|-------|-------|
| `docker-compose.yml` | تعريف الـ Stack الكامل (db + api + web + migrate) |
| `Dockerfile.api` | بناء سيرفر Express (حزمة esbuild مكتفية ذاتياً) |
| `Dockerfile.web` | بناء الواجهتين (Vite) وتقديمهما عبر Nginx |
| `Dockerfile.migrate` | تشغيل دفعة واحدة لإنشاء/تحديث مخطط قاعدة البيانات |
| `nginx/nginx.conf` | إعداد التوجيه + الضغط + التخزين المؤقت + رؤوس الأمان |
| `.env.example` | قالب متغيّرات البيئة |

---

## 5. خطوات النشر (سطر الأوامر)

نفّذ من **جذر المستودع** على السيرفر:

```bash
# 1) جهّز متغيّرات البيئة
cp deploy/.env.example deploy/.env
nano deploy/.env          # عبّئ القيم الحقيقية

# 2) ابنِ وشغّل الـ Stack (db + api + web)
docker compose -f deploy/docker-compose.yml --env-file deploy/.env up -d --build

# 3) أنشئ مخطط قاعدة البيانات (مرّة واحدة على أول نشر، ومع كل تغيير في المخطط)
docker compose -f deploy/docker-compose.yml --env-file deploy/.env --profile tools run --rm migrate

# 4) تأكّد أن الخدمات تعمل
docker compose -f deploy/docker-compose.yml ps
```

تحقّق من صحة الـ API:

```bash
curl -i http://localhost:8088/api/healthz
```

افتح المتجر على `http://SERVER_IP:8088/` ولوحة التحكم على `http://SERVER_IP:8088/admin/`
(قبل ربط الدومين/Cloudflare).

### (اختياري) بيانات تجريبية

ملف البذور `lib/db/seed/techzone-seed.sql` يضيف منتجات وأقساماً تجريبية (قابل لإعادة التشغيل):

```bash
docker compose -f deploy/docker-compose.yml --env-file deploy/.env \
  exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < lib/db/seed/techzone-seed.sql
```

> تجاوز هذه الخطوة إن أردت قاعدة بيانات نظيفة وستُدخل منتجاتك الحقيقية من لوحة التحكم.

### إنشاء حساب المدير الأول

قاعدة بيانات الإنتاج جديدة، لذا أنشئ أول حساب super_admin (يعمل فقط عند عدم وجود أي أدمن):

```bash
curl -X POST http://localhost:8088/api/admin/auth/setup \
  -H "Content-Type: application/json" \
  -d '{
        "username": "mamonladadwa",
        "fullName": "Mamon Ladadwa",
        "email": "mamonladadwa@gmail.com",
        "password": "ضع_كلمة_مرور_قوية_هنا"
      }'
```

ثم سجّل الدخول من `/admin/`.

---

## 6. النشر عبر Portainer (الواجهة الرسومية)

عندك طريقتان:

**أ) Stack من مستودع Git (الأفضل للتحديثات):**
1. في Portainer: **Stacks → Add stack → Repository**.
2. ضع رابط المستودع، والفرع، والمسار `deploy/docker-compose.yml`.
3. في **Environment variables** أضف نفس متغيّرات `deploy/.env` (POSTGRES_USER، POSTGRES_PASSWORD،
   POSTGRES_DB، SESSION_SECRET، LOG_LEVEL، WEB_PORT).
4. **Deploy the stack**. بعد نجاح النشر، شغّل خطوة الـ migrate لمرّة واحدة من **Containers**
   أو عبر سطر الأوامر (الأمر في القسم 5).

**ب) Stack من ملف (Web editor):**
1. **Stacks → Add stack → Web editor**، الصق محتوى `deploy/docker-compose.yml`.
2. ملاحظة: مسارات البناء (`context: ..`) تتطلّب أن يكون المستودع موجوداً على السيرفر، لذا
   هذه الطريقة تناسب من رفع المستودع يدوياً. إن لم تتوفّر، استخدم طريقة (أ).

> Portainer سيظهر لك الحاويات الأربع والسجلّات وصحة كل خدمة (healthcheck) بشكل مباشر.

---

## 7. الأداء (Performance)

مهيّأ مسبقاً في الإعداد:

- **حزمة API مكتفية ذاتياً** عبر esbuild → بدء تشغيل سريع وصورة صغيرة.
- **ملفات ثابتة ببصمة تجزئة (hashed)** + ترويسة `Cache-Control: immutable` لمدة سنة على JS/CSS/الصور/الخطوط.
- **ضغط gzip** مفعّل في Nginx (وCloudflare يضيف brotli على الحافة).
- **keepalive** بين Nginx والـ API لتقليل زمن الاتصال.
- قاعدة البيانات على **نفس السيرفر** (زمن وصول منخفض جداً)، وسيرفرك في فرنسا قريب من جمهور أوروبا/الشرق الأوسط.

توصيات إضافية:
- فعّل **HTTP/2 وHTTP/3** من Cloudflare (انظر القسم التالي) — تحسّن سرعة التحميل بشكل ملحوظ.
- خصّص موارد للحاويات إن شغّلت خدمات أخرى كثيرة على نفس السيرفر (Portainer → Container → Resources).
- راقب الذاكرة عبر Portainer؛ مواردك (16GB) أكثر من كافية لهذا المتجر.

---

## 8. Cloudflare — الحماية والأداء (يُنفَّذ بعد رفع الموقع)

هذا القسم منفصل عن النشر نفسه. نفّذه بعد أن يعمل الموقع على `SERVER_IP:WEB_PORT`.
لديك خياران؛ الأول أبسط، والثاني أكثر أماناً (يخفي سيرفرك تماماً).

### الخيار (أ): Cloudflare Proxy + شهادة Origin (الأبسط)

1. **أضف نطاقك (domain) في Cloudflare** وغيّر خوادم الأسماء (Nameservers) عند مزوّد النطاق.
2. **DNS:** أضف سجلّ `A` يشير إلى IP سيرفرك، مع تفعيل **السحابة البرتقالية (Proxied)**.
3. أمام منفذ Nginx ضع موجّهاً عكسياً على السيرفر (مثل Nginx Proxy Manager أو Traefik — غالباً موجود
   لديك بالفعل) ليستقبل 443 ويمرّر إلى منفذ `web` (`8088`)، أو انشر `web` مباشرة على 80/443.
4. **SSL/TLS:** اختر وضع **Full (strict)**:
   - أنشئ **Origin Certificate** من Cloudflare وثبّته على الموجّه العكسي/Nginx على السيرفر.
   - هذا يضمن تشفير المسار بين Cloudflare وسيرفرك.
5. فعّل **Always Use HTTPS** و **Automatic HTTPS Rewrites**.

### الخيار (ب): Cloudflare Tunnel — موصى به للحماية القصوى

يجعل سيرفرك بلا أي منفذ مفتوح للإنترنت (لا 80 ولا 443)، والاتصال يخرج من السيرفر نحو Cloudflare.

أضف حاوية `cloudflared` إلى الـ Stack:

```yaml
  cloudflared:
    image: cloudflare/cloudflared:latest
    restart: unless-stopped
    command: tunnel --no-autoupdate run
    environment:
      TUNNEL_TOKEN: ${CLOUDFLARE_TUNNEL_TOKEN}
    depends_on:
      - web
```

ثم في لوحة Cloudflare Zero Trust:
1. **Networks → Tunnels → Create a tunnel**، واحصل على `TUNNEL_TOKEN` وضعه في `deploy/.env`.
2. في **Public hostnames** وجّه نطاقك إلى الخدمة الداخلية: `http://web:80`.
3. لن تحتاج فتح أي منفذ على جدار الحماية، ويمكنك حتى إزالة `ports` من خدمة `web`.

### إعدادات Cloudflare للأداء والحماية (تنطبق على الخيارين)

**الأداء:**
- **Speed → Optimization:** فعّل Brotli، HTTP/2، HTTP/3 (QUIC), 0-RTT.
- **Caching → Cache Rules:** خزّن الأصول الثابتة بقوة، و**استثنِ `/api/*` من التخزين** (محتوى ديناميكي).
  مثال قاعدة: إن كان المسار يبدأ بـ `/api/` → **Bypass cache**.
- (اختياري مدفوع) فعّل **Tiered Cache** / **Argo** لتسريع إضافي.

**الحماية:**
- **SSL/TLS → Edge Certificates:** فعّل **Always Use HTTPS** و **Min TLS 1.2** و **HSTS**.
- **Security → WAF:** فعّل القواعد المُدارة (Managed Rules) لحجب الهجمات الشائعة.
- **Security → Bots:** فعّل **Bot Fight Mode**.
- **Security → DDoS:** الحماية تلقائية على Cloudflare.
- (اختياري) فعّل **Rate Limiting** على `/api/admin/auth/login` لتقليل محاولات التخمين.
- (اختياري) احمِ مسار `/admin/` بـ **Cloudflare Access** ليُطلب تسجيل دخول إضافي قبل الوصول للوحة التحكم.

> ملاحظة: السيرفر مضبوط على `trust proxy`، وNginx يمرّر `X-Forwarded-For`/`X-Forwarded-Proto`،
> لذا ستظهر عناوين الزوّار الحقيقية في السجلّات خلف Cloudflare.

---

## 9. التشغيل والصيانة

**عرض السجلّات:**
```bash
docker compose -f deploy/docker-compose.yml logs -f api
docker compose -f deploy/docker-compose.yml logs -f web
```
أو من Portainer → Containers → Logs.

**تحديث الموقع بعد تعديل الكود:**
```bash
git pull
docker compose -f deploy/docker-compose.yml --env-file deploy/.env up -d --build
# عند تغيّر مخطط قاعدة البيانات فقط:
docker compose -f deploy/docker-compose.yml --env-file deploy/.env --profile tools run --rm migrate
```
في Portainer (Stack من Git): استخدم زرّ **Pull and redeploy**.

**النسخ الاحتياطي لقاعدة البيانات (مهم جداً — الأكواد الرقمية تُخزَّن هنا):**
```bash
# نسخة احتياطية
docker compose -f deploy/docker-compose.yml exec -T db \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup_$(date +%F).sql

# استعادة
docker compose -f deploy/docker-compose.yml exec -T db \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < backup_2026-06-07.sql
```
أنشئ مهمة cron يومية لأخذ نسخة احتياطية تلقائياً واحفظها خارج السيرفر.

**إعادة التشغيل:**
```bash
docker compose -f deploy/docker-compose.yml restart api
```

---

## 10. حل المشكلات الشائعة

| العَرَض | السبب المحتمل | الحل |
|---------|----------------|------|
| الواجهة تظهر بيضاء | فشل بناء `web` أو مسار أساس خاطئ | راجع لوغ بناء `web`؛ تأكّد أن `/admin/` بشرطة مائلة في النهاية |
| `/api` يرجع 502 | حاوية `api` لم تبدأ / `SESSION_SECRET` مفقود | راجع `docker compose logs api` |
| الأدمن لا يسجّل دخول | الكوكي Secure بدون HTTPS | فعّل HTTPS عبر Cloudflare؛ لا تستخدم http في الإنتاج |
| `DATABASE_URL ... required` | متغيّرات `.env` لم تُمرَّر | استخدم `--env-file deploy/.env` أو أضفها في Portainer |
| خطأ عمود/جدول غير موجود | لم تُشغّل خطوة migrate | شغّل أمر الـ migrate في القسم 5 |
| `setup` يرجع 403 | يوجد أدمن مسبقاً | استخدم تسجيل الدخول العادي، لا setup |

---

## ملخّص سريع

1. `cp deploy/.env.example deploy/.env` ثم عبّئ القيم.
2. `docker compose -f deploy/docker-compose.yml --env-file deploy/.env up -d --build`
3. `... --profile tools run --rm migrate`
4. أنشئ حساب المدير عبر `/api/admin/auth/setup`.
5. اربط الدومين وفعّل Cloudflare (القسم 8).
6. اضبط نسخاً احتياطية يومية لقاعدة البيانات.

الموقع جاهز ويعمل بالدفع اليدوي (الدفع عند الاستلام / التحويل البنكي)، وخيار البطاقة معروض بوسم "قريباً".
