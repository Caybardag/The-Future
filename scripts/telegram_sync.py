#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════════
📡 TEKNOLOJİK EVRİM 2026-2060 | TELEGRAM İSTİHBARAT SENKRONİZASYON KÖPRÜSÜ
═══════════════════════════════════════════════════════════════════════════════
Bu script, Telegram MTProto API (Telethon) kullanarak üyesi olduğunuz kanallardan
tüm geçmiş ve anlık paylaşılan teknoloji/bilim haberlerini okur, yapay zeka
analiz motorumuza (Gemini 3.7) gönderir ve veritabanını sürekli güncel tutar.

Gereksinimler:
  pip install telethon requests

Kullanım:
  python telegram_sync.py
"""

import asyncio
import os
import sys
import json
import requests
from datetime import datetime

# Telethon kütüphanesini içe aktar
try:
    from telethon import TelegramClient, events
except ImportError:
    print("❌ 'telethon' kütüphanesi bulunamadı! Yüklemek için:")
    print("   pip install telethon requests")
    sys.exit(1)

# ─────────────────────────────────────────────────────────────────────────────
# 1. TELEGRAM API YAPILANDIRMASI
# ─────────────────────────────────────────────────────────────────────────────
# my.telegram.org adresinden aldığınız bilgileri buraya girebilir veya
# ortam değişkeni (environment variable) olarak verebilirsiniz.

API_ID = int(os.getenv("TELEGRAM_API_ID", "33300402"))
API_HASH = os.getenv("TELEGRAM_API_HASH", "79e241623766827f9b2ac480065656b6")

# Hedef Kanallar (Sağladığınız iki kaynak kanal + sizin özel kanalınız)
# 1. https://web.telegram.org/a/#-1001091087098 (Yapay Zeka & Bilişim)
# 2. https://web.telegram.org/a/#-1002747343915 (Gelecek & Trend Analiz)
# 3. https://web.telegram.org/a/#-1004388658742 (Senkronize Edilen Özel Kanalınız)
TARGET_CHANNELS = [
    -1001091087098,
    -1002747343915,
    -1004388658742
]

# Web Uygulamanızın Ingestion API Adresi (Canlı Yayınlanmış Cloud Run URL)
APP_INGEST_URL = os.getenv(
    "APP_INGEST_URL", 
    "https://teknolojik-evrim-takvimi-2026-2060-1066595428768.europe-west2.run.app/api/telegram/ingest"
)

# Oturum dosya adı (İlk girişte oluşturulan Telegram login token'ı saklar)
SESSION_NAME = "teknolojik_evrim_tg_session"
LOCAL_DUMP_FILE = "telegram_feed.json"

# İstemciyi başlat
client = TelegramClient(SESSION_NAME, API_ID, API_HASH)

def save_to_local_backup(messages):
    """Mesajları yerel JSON dosyasına da yedekler."""
    try:
        existing = []
        if os.path.exists(LOCAL_DUMP_FILE):
            with open(LOCAL_DUMP_FILE, "r", encoding="utf-8") as f:
                existing = json.load(f)
        
        items_to_add = messages if isinstance(messages, list) else [messages]
        existing_ids = {f"{x.get('channelId')}_{x.get('id')}" for x in existing}
        
        for item in items_to_add:
            key = f"{item.get('channelId')}_{item.get('id')}"
            if key not in existing_ids:
                existing.append(item)
                existing_ids.add(key)
                
        with open(LOCAL_DUMP_FILE, "w", encoding="utf-8") as f:
            json.dump(existing, f, ensure_ascii=False, indent=2)
        print(f"  💾 {len(items_to_add)} mesaj yerel '{LOCAL_DUMP_FILE}' dosyasına kaydedildi.")
    except Exception as e:
        print(f"  ⚠️ Yerel yedekleme hatası: {e}")

def send_to_app_database(messages_payload):
    """Mesajları web uygulamamızın AI Ingestion API'sine gönderir."""
    # 1. Önce her halükarda yerel dosyaya kaydet
    save_to_local_backup(messages_payload)
    
    # 2. Canlı API'ye gönder
    try:
        headers = {
            "Content-Type": "application/json",
            "x-source": "telethon-bridge-daemon"
        }
        response = requests.post(
            APP_INGEST_URL,
            json=messages_payload,
            headers=headers,
            timeout=45
        )
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ [AI ENTEGRASYON BAŞARILI] {data.get('processedCount', 0)} adet haber analiz edilip canlı veritabanına işlendi.")
            return True
        else:
            print(f"  [UYARI] Sunucu yanıt kodu: {response.status_code}")
            return False
    except Exception as e:
        print(f"  ℹ️ Not: Canlı API bağlantısı bekleniyor. Veriler '{LOCAL_DUMP_FILE}' içine kaydedildi. Web arayüzündeki 'JSON Dosyası Yükle' butonuyla da tek tıkla yükleyebilirsiniz.")
        return False

# ─────────────────────────────────────────────────────────────────────────────
# 2. ANLIK YENİ MESAJLARI DİNLEME (CANLI BOT / LISTENER)
# ─────────────────────────────────────────────────────────────────────────────
@client.on(events.NewMessage(chats=TARGET_CHANNELS))
async def on_new_message(event):
    msg = event.message
    if not msg.text or len(msg.text.strip()) < 15:
        return

    channel_id = event.chat_id
    date_str = msg.date.isoformat() if hasattr(msg.date, "isoformat") else str(msg.date)

    print(f"\n⚡ [{datetime.now().strftime('%H:%M:%S')}] YENİ TELEGRAM MESAJI YAKALANDI!")
    print(f"   Kanal ID: {channel_id} | Mesaj ID: {msg.id}")
    print(f"   Metin Özeti: {msg.text[:120]}...")

    payload = {
        "id": msg.id,
        "channelId": channel_id,
        "text": msg.text,
        "date": date_str,
        "views": getattr(msg, "views", 0),
        "forwards": getattr(msg, "forwards", 0)
    }

    send_to_app_database(payload)

# ─────────────────────────────────────────────────────────────────────────────
# 3. GEÇMİŞ MESAJLARI ÇEKME VE BAŞLATMA
# ─────────────────────────────────────────────────────────────────────────────
async def sync_history(limit_per_channel=50):
    print("\n" + "═" * 70)
    print("🚀 TEKNOLOJİK EVRİM 2026-2060 | TELEGRAM İSTİHBARAT KÖPRÜSÜ BAŞLATILIYOR")
    print(f"🎯 Hedef Kanallar: {TARGET_CHANNELS}")
    print(f"🔗 Hedef API Adresi: {APP_INGEST_URL}")
    print("═" * 70 + "\n")

    for channel_id in TARGET_CHANNELS:
        try:
            print(f"🔄 Kanal ({channel_id}) taranıyor (Son {limit_per_channel} mesaj)...")
            batch = []
            async for msg in client.iter_messages(channel_id, limit=limit_per_channel):
                if msg.text and len(msg.text.strip()) >= 15:
                    date_str = msg.date.isoformat() if hasattr(msg.date, "isoformat") else str(msg.date)
                    batch.append({
                        "id": msg.id,
                        "channelId": channel_id,
                        "text": msg.text,
                        "date": date_str,
                        "views": getattr(msg, "views", 0),
                        "forwards": getattr(msg, "forwards", 0)
                    })

            if batch:
                print(f"  📥 {len(batch)} adet metin mesajı toplandı, AI analizine gönderiliyor...")
                send_to_app_database(batch)
            else:
                print(f"  ℹ️ Kanalda uygun metin mesajı bulunamadı.")
        except Exception as err:
            print(f"  ⚠️ Kanal ({channel_id}) taranırken hata oluştu: {err}")

    print("\n✅ Geçmiş tarama tamamlandı!")
    print("📡 Canlı dinleme moduna geçildi. Kanala yeni mesaj düştüğünde anında veritabanına eklenecektir...\n")

def main():
    with client:
        # 1. Önce geçmişi tara
        client.loop.run_until_complete(sync_history(limit_per_channel=50))
        # 2. Canlı dinleme modunda açık kal
        client.run_until_disconnected()

if __name__ == "__main__":
    main()
