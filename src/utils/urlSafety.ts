/**
 * URL Safety & Malicious Link Protection Utility
 *
 * Provides inspection, validation, protocol enforcement and safe inspection links
 * (VirusTotal, Google Safe Browsing) for external links submitted in inquiries
 * or sponsor campaigns.
 */

// Dangerous executable and script file extensions
const DANGEROUS_EXTENSIONS = [
  ".exe",
  ".scr",
  ".bat",
  ".cmd",
  ".sh",
  ".vbs",
  ".msi",
  ".dll",
  ".jar",
  ".pif",
  ".hta",
  ".cpl",
  ".ps1",
  ".apk",
];

// Dangerous URI schemes
const DANGEROUS_PROTOCOLS = [
  "javascript:",
  "data:",
  "vbscript:",
  "file:",
  "blob:",
];

export interface UrlSafetyReport {
  isSecureProtocol: boolean;
  isDangerousExtension: boolean;
  isRawIpAddress: boolean;
  isSuspicious: boolean;
  riskLevel: "SAFE" | "SUSPICIOUS" | "DANGEROUS";
  warningReason?: string;
  hostname: string;
  virusTotalUrl: string;
  googleSafeBrowsingUrl: string;
}

export function inspectUrlSafety(rawUrl: string): UrlSafetyReport {
  const trimmed = (rawUrl || "").trim();
  const lower = trimmed.toLowerCase();

  // Check dangerous protocol
  for (const proto of DANGEROUS_PROTOCOLS) {
    if (lower.startsWith(proto)) {
      return {
        isSecureProtocol: false,
        isDangerousExtension: true,
        isRawIpAddress: false,
        isSuspicious: true,
        riskLevel: "DANGEROUS",
        warningReason: `Yasaklı Güvenliksiz Protokol: ${proto}`,
        hostname: "blocked",
        virusTotalUrl: "https://www.virustotal.com/gui/home/url",
        googleSafeBrowsingUrl: "https://transparencyreport.google.com/safe-browsing/search",
      };
    }
  }

  // Parse URL safely
  let parsed: URL | null = null;
  try {
    // If lacks protocol, test with https
    const urlToParse = trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
    parsed = new URL(urlToParse);
  } catch {
    return {
      isSecureProtocol: false,
      isDangerousExtension: false,
      isRawIpAddress: false,
      isSuspicious: true,
      riskLevel: "SUSPICIOUS",
      warningReason: "Geçersiz veya bozuk URL biçimi",
      hostname: "unknown",
      virusTotalUrl: "https://www.virustotal.com/gui/home/url",
      googleSafeBrowsingUrl: "https://transparencyreport.google.com/safe-browsing/search",
    };
  }

  const hostname = parsed.hostname;
  const pathname = parsed.pathname.toLowerCase();
  const isSecureProtocol = parsed.protocol === "https:";

  // Check raw IP address instead of domain name (common in phishing/botnet C2)
  const isRawIpAddress =
    /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
    hostname.startsWith("[") && hostname.endsWith("]");

  // Check dangerous extension in path
  let hasDangerousExt = false;
  let matchedExt = "";
  for (const ext of DANGEROUS_EXTENSIONS) {
    if (pathname.endsWith(ext) || pathname.includes(`${ext}?`)) {
      hasDangerousExt = true;
      matchedExt = ext;
      break;
    }
  }

  // VirusTotal inspection link for this specific domain or url
  const encodedForScan = encodeURIComponent(trimmed);
  const virusTotalUrl = `https://www.virustotal.com/gui/url/${btoa(trimmed).replace(/=/g, "")}/detection`;
  const googleSafeBrowsingUrl = `https://transparencyreport.google.com/safe-browsing/search?url=${encodeURIComponent(hostname)}`;

  if (hasDangerousExt) {
    return {
      isSecureProtocol,
      isDangerousExtension: true,
      isRawIpAddress,
      isSuspicious: true,
      riskLevel: "DANGEROUS",
      warningReason: `Çalıştırılabilir / Zararlı Dosya Uzantısı (${matchedExt})`,
      hostname,
      virusTotalUrl,
      googleSafeBrowsingUrl,
    };
  }

  if (isRawIpAddress) {
    return {
      isSecureProtocol,
      isDangerousExtension: false,
      isRawIpAddress: true,
      isSuspicious: true,
      riskLevel: "SUSPICIOUS",
      warningReason: "Ham IP Adresi (Alan adı tescili bulunmuyor - Şüpheli)",
      hostname,
      virusTotalUrl,
      googleSafeBrowsingUrl,
    };
  }

  if (!isSecureProtocol) {
    return {
      isSecureProtocol: false,
      isDangerousExtension: false,
      isRawIpAddress: false,
      isSuspicious: true,
      riskLevel: "SUSPICIOUS",
      warningReason: "Şifresiz HTTP Bağlantısı (SSL/TLS sertifikası yok)",
      hostname,
      virusTotalUrl,
      googleSafeBrowsingUrl,
    };
  }

  return {
    isSecureProtocol: true,
    isDangerousExtension: false,
    isRawIpAddress: false,
    isSuspicious: false,
    riskLevel: "SAFE",
    hostname,
    virusTotalUrl,
    googleSafeBrowsingUrl,
  };
}
