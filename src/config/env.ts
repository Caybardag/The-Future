/**
 * EVRENSEL ORTAM VE TAŞINABİLİRLİK KÖPRÜSÜ (Environment & Custom Domain Config)
 * 
 * Bu dosya projenin mevcut AI Studio / Cloud Run ortamından çıkarılıp
 * bağımsız bir sunucuya (Vercel, DigitalOcean, VPS, AWS, Cloud Run)
 * veya kendi özel alan adınıza (örn: https://teknolojikevrim.com)
 * taşınırken tek bir noktadan yönetilmesini sağlar.
 */

// İstemci tarafı dinamik ortam değişkenleri
const metaEnv = typeof import.meta !== "undefined" && (import.meta as any).env ? (import.meta as any).env : {};

export const APP_CONFIG = {
  // 1. Alan Adı & Origin Yönetimi
  CUSTOM_DOMAIN: metaEnv.VITE_CUSTOM_DOMAIN || "",
  ALLOWED_ORIGINS: [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    ...(metaEnv.VITE_CUSTOM_DOMAIN ? [metaEnv.VITE_CUSTOM_DOMAIN] : []),
    ...(metaEnv.VITE_ADDITIONAL_ORIGINS ? metaEnv.VITE_ADDITIONAL_ORIGINS.split(",") : []),
  ],

  // 2. Dinamik Firebase Yapılandırması (Kendi Bağımsız Firebase Projenize Geçiş İçin)
  // Eğer ortam değişkenlerinde tanımlıysa (.env) bunları kullanır, yoksa yerel config dosyasına fallback yapar.
  FIREBASE: {
    apiKey: metaEnv.VITE_FIREBASE_API_KEY || "",
    authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: metaEnv.VITE_FIREBASE_APP_ID || "",
    databaseId: metaEnv.VITE_FIREBASE_DATABASE_ID || "(default)",
  },

  // 3. Süper Yönetici İletişim & Güvenlik
  SUPER_ADMIN_EMAIL: "warfacelove46@gmail.com",
  VERSION: "2026.3.1-PROD-SECURE",
};
