#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════════
📡 TEKNOLOJİK EVRİM 2026-2060 | TELEGRAM İSTİHBARAT SENKRONİZASYON KÖPRÜSÜ
═══════════════════════════════════════════════════════════════════════════════
Bu script, Telegram MTProto API (Telethon) kullanarak üyesi olduğunuz iki kaynak
kanaldan geçmiş ve anlık teknoloji/bilim haberlerini okur, önce kendi kanalınıza
aktarır. Uygulamadaki bot bu kanalı dinleyerek haberleri veritabanına gönderir.

Gereksinimler:
    pip install telethon

Kullanım:
  python telegram_sync.py
"""

import asyncio
import os
import sys
import json
from datetime import datetime

# Telethon kütüphanesini içe aktar
try:
    from telethon import TelegramClient, events
except ImportError as e:
    print("❌ 'telethon' kütüphanesi bulunamadı! Yüklemek için:")
    print("   pip install telethon")
    print(f"   Hata: {e}")
    sys.exit(1)

# ─────────────────────────────────────────────────────────────────────────────
# 1. TELEGRAM API YAPILANDIRMASI
# ─────────────────────────────────────────────────────────────────────────────
# my.telegram.org adresinden aldığınız bilgileri buraya girebilir veya
# ortam değişkeni (environment variable) olarak verebilirsiniz.

API_ID = int(os.getenv("TELEGRAM_API_ID", "33300402"))
API_HASH = os.getenv("TELEGRAM_API_HASH", "79e241623766827f9b2ac480065656b6")

# Hedef Kanallar (Sağladığınız iki kanal linkinin Telegram ID'leri)
# 1. https://web.telegram.org/a/#-1001091087098
# 2. https://web.telegram.org/a/#-1002747343915
SOURCE_CHANNELS = [
    -1001091087098,
    -1002747343915
]

# Kaynak mesajların önce aktarılacağı kendi kanalınız.
# Uygulamadaki bot bu kanalı dinleyip veriyi uygulamaya göndermelidir.
DESTINATION_CHANNEL = int(os.getenv("TELEGRAM_DESTINATION_CHANNEL", "-1004388658742"))

# Oturum dosya adı (İlk girişte oluşturulan Telegram login token'ı saklar)
SESSION_NAME = "teknolojik_evrim_tg_session"

# İstemciyi başlat
client = TelegramClient(SESSION_NAME, API_ID, API_HASH)

async def forward_to_destination(message):
    """Mesajı uygulama botunun dinlediği kanala aktarır."""
    await client.forward_messages(DESTINATION_CHANNEL, message)

# ─────────────────────────────────────────────────────────────────────────────
# 2. ANLIK YENİ MESAJLARI DİNLEME (CANLI BOT / LISTENER)
# ─────────────────────────────────────────────────────────────────────────────
@client.on(events.NewMessage(chats=SOURCE_CHANNELS))
async def on_new_message(event):
    msg = event.message
    if not msg.text or len(msg.text.strip()) < 15:
        return

    channel_id = event.chat_id

    print(f"\n⚡ [{datetime.now().strftime('%H:%M:%S')}] YENİ TELEGRAM MESAJI YAKALANDI!")
    print(f"   Kanal ID: {channel_id} | Mesaj ID: {msg.id}")
    print(f"   Metin Özeti: {msg.text[:120]}...")

    try:
        await forward_to_destination(msg)
        print(f"  ✅ Mesaj kendi kanalınıza aktarıldı: {DESTINATION_CHANNEL}")
    except Exception as err:
        print(f"  ⚠️ Mesaj hedef kanala aktarılırken hata oluştu: {err}")

# ─────────────────────────────────────────────────────────────────────────────
# 3. GEÇMİŞ MESAJLARI ÇEKME VE BAŞLATMA
# ─────────────────────────────────────────────────────────────────────────────
async def sync_history(limit_per_channel=50):
    print("\n" + "═" * 70)
    print("🚀 TEKNOLOJİK EVRİM 2026-2060 | TELEGRAM İSTİHBARAT KÖPRÜSÜ BAŞLATILIYOR")
    print(f"🎯 Kaynak Kanallar: {SOURCE_CHANNELS}")
    print(f"📤 Aktarım Kanalı: {DESTINATION_CHANNEL}")
    print("═" * 70 + "\n")

    for channel_id in SOURCE_CHANNELS:
        try:
            print(f"🔄 Kanal ({channel_id}) taranıyor (Son {limit_per_channel} mesaj)...")
            messages = []
            async for msg in client.iter_messages(channel_id, limit=limit_per_channel):
                if msg.text and len(msg.text.strip()) >= 15:
                    messages.append(msg)

            if messages:
                print(f"  📥 {len(messages)} adet metin mesajı toplandı, kendi kanalınıza aktarılıyor...")
                for msg in reversed(messages):
                    await forward_to_destination(msg)
                print(f"  ✅ {len(messages)} mesaj hedef kanala aktarıldı.")
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
