import sharp from "sharp";
import fs from "fs";
import path from "path";

async function generateAssets() {
  const publicDir = path.join(process.cwd(), "public");

  // 1. Futuristic App Icon SVG (Futuristic neural node / brain core / cybernetic circle)
  const iconSvg = `
  <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0F172A" />
        <stop offset="50%" stop-color="#1E1B4B" />
        <stop offset="100%" stop-color="#020617" />
      </linearGradient>
      <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38BDF8" />
        <stop offset="50%" stop-color="#818CF8" />
        <stop offset="100%" stop-color="#C084FC" />
      </linearGradient>
      <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <!-- Background rounded squircle -->
    <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
    
    <!-- Outer Cybernetic Tech Ring -->
    <circle cx="256" cy="256" r="180" fill="none" stroke="#6366F1" stroke-width="6" stroke-dasharray="16 10" opacity="0.6"/>
    <circle cx="256" cy="256" r="150" fill="none" stroke="#38BDF8" stroke-width="4" opacity="0.8"/>
    
    <!-- Central Core Geometry -->
    <polygon points="256,120 370,186 370,326 256,392 142,326 142,186" fill="url(#glowGrad)" filter="url(#neonGlow)" opacity="0.9" />
    <polygon points="256,150 340,200 340,312 256,362 172,312 172,200" fill="#0B0F19" />

    <!-- Core Emblem / Quantum Node -->
    <circle cx="256" cy="256" r="42" fill="url(#glowGrad)" filter="url(#neonGlow)" />
    <circle cx="256" cy="256" r="24" fill="#FFFFFF" />

    <!-- Connecting Neural Nodes -->
    <line x1="256" y1="120" x2="256" y2="256" stroke="#38BDF8" stroke-width="4"/>
    <line x1="370" y1="326" x2="256" y2="256" stroke="#818CF8" stroke-width="4"/>
    <line x1="142" y1="326" x2="256" y2="256" stroke="#C084FC" stroke-width="4"/>

    <circle cx="256" cy="120" r="14" fill="#38BDF8"/>
    <circle cx="370" cy="186" r="10" fill="#818CF8"/>
    <circle cx="370" cy="326" r="14" fill="#818CF8"/>
    <circle cx="256" cy="392" r="10" fill="#C084FC"/>
    <circle cx="142" cy="326" r="14" fill="#C084FC"/>
    <circle cx="142" cy="186" r="10" fill="#38BDF8"/>

    <!-- 2060 Subtitle inside icon -->
    <text x="256" y="460" text-anchor="middle" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="28" font-weight="900" letter-spacing="4">2060 AI CORE</text>
  </svg>
  `;

  // 2. Generate 512x512 PNG
  await sharp(Buffer.from(iconSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, "icon-512.png"));
  console.log("✓ icon-512.png generated");

  // 3. Generate 192x192 PNG
  await sharp(Buffer.from(iconSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, "icon-192.png"));
  console.log("✓ icon-192.png generated");

  // 4. Generate maskable 512x512 with safe zone padding
  const maskableSvg = `
  <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="#0B0F19" />
    <g transform="translate(64, 64) scale(0.75)">
      ${iconSvg.replace(/<\/?svg[^>]*>/g, "")}
    </g>
  </svg>
  `;
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, "icon-maskable-512.png"));
  console.log("✓ icon-maskable-512.png generated");

  // 5. Generate Apple Touch Icon 180x180
  await sharp(Buffer.from(iconSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, "apple-touch-icon.png"));
  console.log("✓ apple-touch-icon.png generated");

  // 6. Generate Favicon PNG 32x32 and 64x64
  await sharp(Buffer.from(iconSvg))
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, "favicon.png"));

  // 7. Generate Screenshots for PWABuilder (Mobile & Desktop)
  const mobileScreenshotSvg = `
  <svg width="750" height="1334" viewBox="0 0 750 1334" xmlns="http://www.w3.org/2000/svg">
    <rect width="750" height="1334" fill="#0B0F19"/>
    <!-- Top bar -->
    <rect x="0" y="0" width="750" height="100" fill="#111827"/>
    <text x="50" y="60" fill="#38BDF8" font-family="system-ui" font-size="28" font-weight="bold">TEKNOLOJİK EVRİM TAKVİMİ</text>
    <text x="600" y="60" fill="#10B981" font-family="monospace" font-size="20">TRL 9 LIVE</text>
    
    <!-- Hero card -->
    <rect x="40" y="140" width="670" height="320" rx="24" fill="#1E293B" stroke="#6366F1" stroke-width="2"/>
    <text x="80" y="210" fill="#FFFFFF" font-family="system-ui" font-size="34" font-weight="bold">2026-2060 Otonom Sistem Beyni</text>
    <text x="80" y="270" fill="#94A3B8" font-family="system-ui" font-size="22">Yapay Zeka &amp; Biyoteknoloji Transhümanizm</text>
    <rect x="80" y="320" width="220" height="50" rx="12" fill="#38BDF8"/>
    <text x="190" y="355" fill="#000000" font-family="system-ui" font-size="20" font-weight="bold" text-anchor="middle">Zaman Çizelgesi</text>

    <!-- Timeline card 1 -->
    <rect x="40" y="490" width="670" height="240" rx="20" fill="#0F172A" stroke="#38BDF8" stroke-width="2"/>
    <text x="70" y="550" fill="#38BDF8" font-family="monospace" font-size="28" font-weight="bold">2028 - AGI &amp; Nöromorfik Çipler</text>
    <text x="70" y="600" fill="#E2E8F0" font-family="system-ui" font-size="20">Fiziksel gerçekleşebilirlik skoru: %82</text>
    <text x="70" y="640" fill="#94A3B8" font-family="system-ui" font-size="18">Shannon limiti ve Landauer ısı bariyeri optimizasyonu</text>

    <!-- Timeline card 2 -->
    <rect x="40" y="760" width="670" height="240" rx="20" fill="#0F172A" stroke="#C084FC" stroke-width="2"/>
    <text x="70" y="820" fill="#C084FC" font-family="monospace" font-size="28" font-weight="bold">2035 - Epigenetik Gençleşme</text>
    <text x="70" y="870" fill="#E2E8F0" font-family="system-ui" font-size="20">Yamanaka faktörleri ve telomer uzatma</text>
    
    <!-- Timeline card 3 -->
    <rect x="40" y="1030" width="670" height="240" rx="20" fill="#0F172A" stroke="#10B981" stroke-width="2"/>
    <text x="70" y="1090" fill="#10B981" font-family="monospace" font-size="28" font-weight="bold">2042 - Ticari Nükleer Füzyon</text>
    <text x="70" y="1140" fill="#E2E8F0" font-family="system-ui" font-size="20">SPARC / ITER manyetik hapis kararlılığı</text>
  </svg>
  `;

  await sharp(Buffer.from(mobileScreenshotSvg))
    .resize(750, 1334)
    .png()
    .toFile(path.join(publicDir, "screenshot-mobile.png"));
  console.log("✓ screenshot-mobile.png generated");

  const desktopScreenshotSvg = `
  <svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
    <rect width="1920" height="1080" fill="#0B0F19"/>
    <!-- Navigation header -->
    <rect x="0" y="0" width="1920" height="80" fill="#0F172A"/>
    <text x="80" y="50" fill="#38BDF8" font-family="system-ui" font-size="26" font-weight="bold">TEKNOLOJİK EVRİM TAKVİMİ • GELECEK PORTALI</text>
    <text x="1600" y="50" fill="#10B981" font-family="monospace" font-size="20">CANLI OTONOM BEYİN AKTİF</text>
    
    <!-- Main layout columns -->
    <rect x="80" y="120" width="840" height="900" rx="24" fill="#111827" stroke="#6366F1" stroke-width="2"/>
    <text x="120" y="180" fill="#FFFFFF" font-family="system-ui" font-size="32" font-weight="bold">2026 - 2060 Evrim Zaman Çizelgesi</text>
    
    <rect x="120" y="220" width="760" height="180" rx="16" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
    <text x="150" y="270" fill="#38BDF8" font-family="monospace" font-size="24" font-weight="bold">2028: İnsanüstü Yapay Genel Zeka (AGI)</text>
    <text x="150" y="310" fill="#94A3B8" font-family="system-ui" font-size="18">Bilimsel Feasibility: %82 • TRL 6 Saha Prototipi</text>

    <!-- Right details panel -->
    <rect x="960" y="120" width="880" height="900" rx="24" fill="#111827" stroke="#38BDF8" stroke-width="2"/>
    <text x="1000" y="180" fill="#38BDF8" font-family="system-ui" font-size="32" font-weight="bold">Otonom Bilimsel Kanıt &amp; Termodinamik Analiz</text>
    <rect x="1000" y="220" width="800" height="300" rx="16" fill="#1E293B"/>
    <text x="1030" y="270" fill="#E2E8F0" font-family="system-ui" font-size="20">⛓️ Zorunlu Öncül Koşullar:</text>
    <text x="1030" y="310" fill="#94A3B8" font-family="system-ui" font-size="18">• Nöromorfik hesaplama mimarilerinde enerji verimliliği</text>
    <text x="1030" y="350" fill="#94A3B8" font-family="system-ui" font-size="18">• Processing-in-Memory ve optik ara bağlantı hatları</text>
  </svg>
  `;

  await sharp(Buffer.from(desktopScreenshotSvg))
    .resize(1920, 1080)
    .png()
    .toFile(path.join(publicDir, "screenshot-desktop.png"));
  console.log("✓ screenshot-desktop.png generated");
}

generateAssets().catch(console.error);
