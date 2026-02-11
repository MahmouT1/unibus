#!/bin/bash
# نشر التحديثات على السيرفر (UniBus) - يشمل ميزة سجل حضور الطالب من Student Search
# الاستخدام: على السيرفر بعد git pull، أو تشغيل هذا السكربت من مجلد المشروع على السيرفر

set -e
echo "=== UniBus - نشر التحديثات ==="

# إذا تم استدعاء السكربت من جذر المشروع
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

echo "المجلد: $PROJECT_DIR"
echo "جاري البناء وإعادة التشغيل..."
docker compose build --no-cache
docker compose up -d
echo "تم. عرض الحالة:"
docker compose ps
