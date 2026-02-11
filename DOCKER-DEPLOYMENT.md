# نشر Docker على VPS - UniBus

## ✅ تم التنفيذ

المشروع يعمل الآن عبر **Docker** بدلاً من PM2 على السيرفر `72.60.185.100`.

### المكونات

| الخدمة | الحاوية | المنفذ | الملاحظات |
|--------|---------|--------|-----------|
| Backend | unitrans-backend | 3001 | يتصل بـ MongoDB على الـ host |
| Frontend | unitrans-frontend | 3000 | Next.js |
| MongoDB | على الـ host | 27017 | لم يُضف داخل Docker (بيانات موجودة مسبقاً) |

### أوامر مفيدة

```bash
# الاتصال بالسيرفر
ssh hostinger-vps

# إدارة الحاويات
cd /var/www/unitrans
docker compose ps          # عرض الحالة
docker compose logs -f     # عرض اللوجات
docker compose restart     # إعادة التشغيل
docker compose down        # إيقاف
docker compose up -d       # تشغيل
```

### التحديثات المستقبلية (تطبيق التعديلات على السيرفر)

**1) من جهازك المحلي:** دفع التعديلات إلى Git ثم على السيرفر تنفيذ التالي.

```bash
# على السيرفر بعد الدخول عبر SSH
cd /var/www/unitrans
git pull
docker compose build --no-cache
docker compose up -d
```

أو استخدم السكربت الجاهز (بعد `git pull`):

```bash
cd /var/www/unitrans
git pull
bash scripts/deploy-production.sh
```

**2) بناء Docker محلياً (للتجربة قبل النشر):**

إذا فشل `docker compose build` بسبب ملف `.env` في جذر المشروع، ابنِ الصور يدوياً:

```bash
# Backend
docker build -t unitrans-backend ./backend-new

# Frontend (مع رابط الإنتاج)
docker build -t unitrans-frontend \
  --build-arg NEXT_PUBLIC_BACKEND_URL=https://unibus.online \
  --build-arg NEXT_PUBLIC_API_URL=https://unibus.online \
  ./frontend-new
```

ثم على السيرفر: `git pull` ثم `docker compose up -d --build` لبناء الصور هناك من الكود المحدّث.

**ملاحظة:** إذا ظهر خطأ `unexpected character` عند تشغيل `docker compose build` محلياً، فغالباً ملف `.env` في جذر المشروع محفوظ بترميز خاطئ (مثلاً UTF-16). احذف أو أعد تسمية هذا الملف أو احفظه بترميز UTF-8 (ملف `backend-new/.env` يبقى كما هو).

### ملاحظات

- **PM2** تم إيقافه وتعطيل التشغيل التلقائي
- **MongoDB** ما زال يعمل على النظام (systemd) وليس داخل Docker
- الحاويات تعيد التشغيل تلقائياً مع إعادة تشغيل السيرفر (`restart: unless-stopped`)
- مجلد `uploads` مربوط كـ volume ليحافظ على الصور
