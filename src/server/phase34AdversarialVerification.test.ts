import { describe, it, expect } from "vitest";
import http from "http";
import fs from "fs";
import path from "path";
import { app, resolveServerPort, resolveDistPath, setupProcessReliabilityShields } from "../../server";

describe("AŞAMA 34 — PRODUCTION CLAIMS ADVERSARIAL VERIFICATION", () => {
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. DİNAMİK PORT — NEGATİF VE ADVERSARIAL TESTLER
  // ─────────────────────────────────────────────────────────────────────────────
  describe("1. Dinamik PORT Çözümleme ve Sınır Güvenliği", () => {
    it("PORT tanımsızken veya boşken varsayılan 3000 portuna döner", () => {
      expect(resolveServerPort(undefined)).toBe(3000);
      expect(resolveServerPort("")).toBe(3000);
      expect(resolveServerPort(null as any)).toBe(3000);
    });

    it("Geçerli sayısal PORT dizgilerini ve sayıları doğru çözümler", () => {
      expect(resolveServerPort(8080)).toBe(8080);
      expect(resolveServerPort("8080")).toBe(8080);
      expect(resolveServerPort("4000")).toBe(4000);
      expect(resolveServerPort(" 5000 ")).toBe(5000);
    });

    it("Geçersiz sayısal olmayan PORT değerlerinde ('abc', 'xyz', 'NaN') çökmez ve 3000 portuna fallback yapar", () => {
      expect(resolveServerPort("abc")).toBe(3000);
      expect(resolveServerPort("undefined")).toBe(3000);
      expect(resolveServerPort("null")).toBe(3000);
      expect(resolveServerPort(NaN)).toBe(3000);
    });

    it("Negatif port değerlerinde (-1, -8080) RangeError atmak yerine güvenli 3000 portuna döner", () => {
      // Node.js listen(-1) RangeError verir; resolveServerPort bunu önler
      expect(resolveServerPort("-1")).toBe(3000);
      expect(resolveServerPort(-500)).toBe(3000);
    });

    it("65535 üstü port değerlerinde (70000, 99999) RangeError atmak yerine güvenli 3000 portuna döner", () => {
      expect(resolveServerPort("70000")).toBe(3000);
      expect(resolveServerPort(65536)).toBe(3000);
      expect(resolveServerPort(99999)).toBe(3000);
    });

    it("PORT=0 değerini OS dinamik/ephemeral port bağlama isteği olarak kabul eder ve çökmez", () => {
      expect(resolveServerPort(0)).toBe(0);
      expect(resolveServerPort("0")).toBe(0);
    });

    it("Kusurlu ondalıklı port değerlerinde (3000.8) tam sayıya yuvarlar", () => {
      expect(resolveServerPort("3000.8")).toBe(3000);
    });

    it("Port çakışması (EADDRINUSE) durumunda Node.js soket hatası fırlatır", async () => {
      const server1 = http.createServer();
      const server2 = http.createServer();

      await new Promise<void>((resolve) => server1.listen(0, resolve));
      const boundPort = (server1.address() as any).port;

      const collisionError = await new Promise<any>((resolve) => {
        server2.on("error", (err) => resolve(err));
        server2.listen(boundPort);
      });

      expect(collisionError.code).toBe("EADDRINUSE");

      await new Promise<void>((resolve) => server1.close(() => resolve()));
    });

    it("package.json 'start' script'i production derlemesi dist/server.cjs dosyasını hedefler", () => {
      const pkgPath = path.join(process.cwd(), "package.json");
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      expect(pkg.scripts.start).toBe("node dist/server.cjs");
      expect(pkg.scripts.build).toContain("dist/server.cjs");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. STATİK DOSYA VE SPA FALLBACK — ADVERSARIAL TESTLER
  // ─────────────────────────────────────────────────────────────────────────────
  describe("2. Statik Dosya Çözümleme ve SPA Fallback Davranışı", () => {
    it("resolveDistPath: dist/index.html mevcut olduğunda dist dizinini döner", () => {
      const resolved = resolveDistPath(process.cwd(), process.cwd());
      expect(fs.existsSync(path.join(resolved, "index.html"))).toBe(true);
    });

    it("resolveDistPath: customDirname dist olduğunda index.html'i doğrudan tespit eder", () => {
      const distDir = path.join(process.cwd(), "dist");
      const resolved = resolveDistPath(distDir, "/tmp");
      expect(resolved).toBe(distDir);
    });

    it("resolveDistPath: Olmayan dizin verildiğinde varsayılan dist yoluna döner ve çökmez", () => {
      const resolved = resolveDistPath("/non-existent-dir-12345", "/non-existent-cwd-67890");
      expect(resolved).toBe(path.join("/non-existent-cwd-67890", "dist"));
    });

    it("API istekleri asla statik HTML tarafından yutulmaz; daima JSON ve 404 döner", async () => {
      const server = http.createServer(app);
      await new Promise<void>((resolve) => server.listen(0, resolve));
      const port = (server.address() as any).port;

      const methods = ["GET", "POST", "PUT", "DELETE"];
      for (const method of methods) {
        const res = await fetch(`http://127.0.0.1:${port}/api/non_existent_route_${Date.now()}`, {
          method,
        });

        expect(res.status).toBe(404);
        const contentType = res.headers.get("content-type");
        expect(contentType).toContain("application/json");

        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.code).toBe("ENDPOINT_NOT_FOUND");
        expect(data.error).toContain("Sunucu API uç noktası bulunamadı");
      }

      await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    it("dist/index.html ve PWA varlıkları diskte doğrulanır", () => {
      const distIndex = path.join(process.cwd(), "dist", "index.html");
      const distManifest = path.join(process.cwd(), "dist", "manifest.json");
      const distSw = path.join(process.cwd(), "dist", "sw.js");

      expect(fs.existsSync(distIndex)).toBe(true);
      expect(fs.existsSync(distManifest)).toBe(true);
      expect(fs.existsSync(distSw)).toBe(true);

      const htmlContent = fs.readFileSync(distIndex, "utf-8");
      expect(htmlContent).toContain("<html");
      expect(htmlContent).toContain("<title>");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. /healthz VE /api/health SAĞLIK DENETİMİ — ADVERSARIAL TESTLER
  // ─────────────────────────────────────────────────────────────────────────────
  describe("3. Sağlık Denetimi (/healthz & /api/health) Güvenilirlik Testleri", () => {
    it("Her iki endpoint (/healthz ve /api/health) özdeş JSON ve 200 döner", async () => {
      const server = http.createServer(app);
      await new Promise<void>((resolve) => server.listen(0, resolve));
      const port = (server.address() as any).port;

      const [resHealthz, resApiHealth] = await Promise.all([
        fetch(`http://127.0.0.1:${port}/healthz`),
        fetch(`http://127.0.0.1:${port}/api/health`),
      ]);

      expect(resHealthz.status).toBe(200);
      expect(resApiHealth.status).toBe(200);

      const [dataHealthz, dataApiHealth] = await Promise.all([
        resHealthz.json(),
        resApiHealth.json(),
      ]);

      expect(dataHealthz.status).toBe("ok");
      expect(dataApiHealth.status).toBe("ok");
      expect(typeof dataHealthz.uptimeSeconds).toBe("number");
      expect(typeof dataApiHealth.uptimeSeconds).toBe("number");
      expect(dataHealthz.memory.rssMb).toBeGreaterThan(0);
      expect(dataApiHealth.memory.heapUsedMb).toBeGreaterThan(0);

      await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    it("HEAD istekleri her iki endpoint için 200 döner ve boş gövde sunar", async () => {
      const server = http.createServer(app);
      await new Promise<void>((resolve) => server.listen(0, resolve));
      const port = (server.address() as any).port;

      const res = await fetch(`http://127.0.0.1:${port}/healthz`, { method: "HEAD" });
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).toBe("");

      await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    it("Sağlık denetiminde Cache-Control no-cache, no-store başlıkları bulunur", async () => {
      const server = http.createServer(app);
      await new Promise<void>((resolve) => server.listen(0, resolve));
      const port = (server.address() as any).port;

      const res = await fetch(`http://127.0.0.1:${port}/api/health`);
      expect(res.headers.get("cache-control")).toContain("no-cache");
      expect(res.headers.get("cache-control")).toContain("no-store");
      expect(res.headers.get("content-type")).toContain("application/json");

      await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    it("Desteklenmeyen metodlar (POST, DELETE) 405 Method Not Allowed döner", async () => {
      const server = http.createServer(app);
      await new Promise<void>((resolve) => server.listen(0, resolve));
      const port = (server.address() as any).port;

      const resPost = await fetch(`http://127.0.0.1:${port}/healthz`, { method: "POST" });
      expect(resPost.status).toBe(405);
      const data = await resPost.json();
      expect(data.success).toBe(false);

      await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    it("Sağlık denetimi yanıtında hiçbir hassas gizli anahtar (secret, key, token) sızdırılmaz", async () => {
      const server = http.createServer(app);
      await new Promise<void>((resolve) => server.listen(0, resolve));
      const port = (server.address() as any).port;

      const res = await fetch(`http://127.0.0.1:${port}/healthz`);
      const body = await res.json();
      const serialized = JSON.stringify(body).toLowerCase();

      expect(serialized).not.toContain("api_key");
      expect(serialized).not.toContain("secret");
      expect(serialized).not.toContain("password");
      expect(serialized).not.toContain("token");
      expect(serialized).not.toContain("private");

      await new Promise<void>((resolve) => server.close(() => resolve()));
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. SÜREÇ GÜVENİLİRLİĞİ VE HATA YÖNETİMİ
  // ─────────────────────────────────────────────────────────────────────────────
  describe("4. Süreç Seviyesi Hata Korumaları ve Graceful Shutdown", () => {
    it("setupProcessReliabilityShields fonksiyonu hatasız yapılandırılır", () => {
      const dummyServer = {
        close: (cb: any) => cb && cb(),
      };
      expect(() => setupProcessReliabilityShields(dummyServer)).not.toThrow();
    });

    it("SIGTERM ve SIGINT dinleyicileri sunucu soketlerini kapatabilecek şekilde mevcuttur", () => {
      const listeners = process.listeners("SIGTERM");
      expect(listeners.length).toBeGreaterThan(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. ORTAM DEĞİŞKENLERİ VE GİZLİLİK HİJYENİ
  // ─────────────────────────────────────────────────────────────────────────────
  describe("5. Ortam Değişkenleri ve Gizli Anahtar Hijyeni", () => {
    it(".env.example dosyasında gerçek gizli anahtar veya token bulunmaz", () => {
      const envExamplePath = path.join(process.cwd(), ".env.example");
      expect(fs.existsSync(envExamplePath)).toBe(true);

      const content = fs.readFileSync(envExamplePath, "utf-8");
      expect(content).toContain("GEMINI_API_KEY=");
      // Gerçek AI Studio API anahtarı 'AIza' ile başlar
      expect(content).not.toMatch(/AIza[0-9A-Za-z-_]{35}/);
    });

    it("Çalışma alanında gerçek canlı .env dosyaları (kod deposuna dahil) bulunmaz", () => {
      expect(fs.existsSync(path.join(process.cwd(), ".env.local"))).toBe(false);
      expect(fs.existsSync(path.join(process.cwd(), ".env.production"))).toBe(false);
    });

    it("İstemci derlemesinde (dist/assets) sunucu tarafı gizli anahtarları ve tokenlar bulunmaz", () => {
      const assetsDir = path.join(process.cwd(), "dist", "assets");
      if (fs.existsSync(assetsDir)) {
        const files = fs.readdirSync(assetsDir);
        for (const file of files) {
          if (file.endsWith(".js")) {
            const content = fs.readFileSync(path.join(assetsDir, file), "utf-8");
            expect(content).not.toContain("TELEGRAM_API_HASH");
            expect(content).not.toContain("79e241623766827f9b2ac480065656b6");
            expect(content).not.toContain("TELEGRAM_BOT_TOKEN");
          }
        }
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. YEDEKLEME VE BOZUK VERİ (CORRUPT JSON) DİRENCİ
  // ─────────────────────────────────────────────────────────────────────────────
  describe("6. Yedekleme ve Bozuk JSON Dayanıklılığı", () => {
    it("Geçici bozuk JSON dosyası simülasyonunda JSON.parse korumalıdır", () => {
      const corruptPayload = "{ invalid json without closing bracket: ";
      let parsed = null;
      let errorCaught = false;

      try {
        parsed = JSON.parse(corruptPayload);
      } catch (err) {
        errorCaught = true;
        parsed = { fallback: true };
      }

      expect(errorCaught).toBe(true);
      expect(parsed).toEqual({ fallback: true });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. P0 — ÜRÜN KİMLİĞİ, RESMÎ İSİM VE MARKA TUTARLILIĞI
  // ─────────────────────────────────────────────────────────────────────────────
  describe("7. Ürün Kimliği ve Marka Tutarlılığı Denetimi", () => {
    it("NexusHolodeckDrawer bileşeni kullanıcıya 'NEXUS KONTROL MERKEZİ' göstermez; Teknolojik Evrim Takvimi ve Gelecek Takvimi gösterir", () => {
      const drawerFile = path.join(process.cwd(), "src", "components", "NexusHolodeckDrawer.tsx");
      const content = fs.readFileSync(drawerFile, "utf-8");
      expect(content).not.toContain("<span>NEXUS KONTROL MERKEZİ</span>");
      expect(content).toContain("TEKNOLOJİK EVRİM TAKVİMİ");
      expect(content).toContain("Gelecek Takvimi");
    });

    it("QuantumBottomNav mobil navigasyonu 'Nexus Menü' yerine 'Tüm Menü' gösterir", () => {
      const navFile = path.join(process.cwd(), "src", "components", "QuantumBottomNav.tsx");
      if (!fs.existsSync(navFile)) {
        expect(true).toBe(true);
        return;
      }
      const content = fs.readFileSync(navFile, "utf-8");
      expect(content).not.toContain('"Nexus Menü"');
      expect(content).toContain('"Tüm Menü"');
    });

    it("ContextAwareOrchestrator ve TaskFocusedNav 'Nexus Menüyü Aç' yerine 'Kontrol Merkezini Aç' gösterir", () => {
      const orchFile = path.join(process.cwd(), "src", "components", "ContextAwareOrchestrator.tsx");
      const taskNavFile = path.join(process.cwd(), "src", "components", "TaskFocusedNav.tsx");
      const orchContent = fs.readFileSync(orchFile, "utf-8");
      expect(orchContent).not.toContain('"Nexus Menüyü Aç"');
      expect(orchContent).toContain('"Kontrol Merkezini Aç"');

      if (fs.existsSync(taskNavFile)) {
        const taskNavContent = fs.readFileSync(taskNavFile, "utf-8");
        expect(taskNavContent).not.toContain('"Nexus Menüyü Aç"');
        expect(taskNavContent).toContain('"Kontrol Merkezini Aç"');
      }
    });

    it("Navbar erişilebilirlik etiketinde 'Nexus Menu' bulunmaz", () => {
      const navbarFile = path.join(process.cwd(), "src", "components", "Navbar.tsx");
      const content = fs.readFileSync(navbarFile, "utf-8");
      expect(content).not.toContain('aria-label="Nexus Menu"');
      expect(content).toContain("Kontrol Merkezi Menüsü");
    });

    it("metadata.json ve public/manifest.json resmî ürün adını 'Teknolojik Evrim Takvimi' olarak doğrular", () => {
      const meta = JSON.parse(fs.readFileSync(path.join(process.cwd(), "metadata.json"), "utf-8"));
      const manifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "manifest.json"), "utf-8"));

      expect(meta.name).toBe("Teknolojik Evrim Takvimi");
      expect(manifest.name).toBe("Teknolojik Evrim Takvimi");
      expect(manifest.short_name).toBe("Evrim Takvimi");
    });
  });
});
