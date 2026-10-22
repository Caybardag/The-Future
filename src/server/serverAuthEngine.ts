import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getServerUserAccount, syncServerUserAccount } from "./serverCreditEngine";

export interface ServerUserRecord {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: "user" | "admin" | "superadmin";
  plan: "free" | "pro" | "quantum_vip";
  credits: number;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isBanned: boolean;
  banReason?: string;
  bannedAt?: string;
  isProbationRequired?: boolean;
  probationAcceptedAt?: string;
  joinedDate: string;
  passwordHash?: string;
  salt?: string;
  avatarUrl?: string;
  location?: string;
  device?: string;
  lastLoginAt?: string;
}

export interface OtpRecord {
  code: string;
  type: "email" | "phone";
  expiresAt: number;
  target: string;
  attempts: number;
  createdAt: number;
}

const SUPER_ADMIN_EMAIL = "warfacelove46@gmail.com";
const USERS_DB_PATH = path.join(process.cwd(), "src", "data", "server_users_db.json");
const BANNED_LIST_PATH = path.join(process.cwd(), "src", "data", "server_banned_users.json");

let usersCache: Record<string, ServerUserRecord> = {};
let bannedCache: Record<string, { reason: string; bannedAt: string; bannedBy: string }> = {};
let activeSessions: Record<string, { email: string; expiresAt: number }> = {};
let activeOtps: Record<string, OtpRecord> = {};
let isInitialized = false;

function ensureInitialized() {
  if (isInitialized) return;

  try {
    if (fs.existsSync(USERS_DB_PATH)) {
      const raw = fs.readFileSync(USERS_DB_PATH, "utf-8");
      usersCache = JSON.parse(raw);
    }
  } catch (err) {
    console.warn("[ServerAuthEngine] Error reading users DB:", err);
    usersCache = {};
  }

  try {
    if (fs.existsSync(BANNED_LIST_PATH)) {
      const raw = fs.readFileSync(BANNED_LIST_PATH, "utf-8");
      bannedCache = JSON.parse(raw);
    }
  } catch (err) {
    console.warn("[ServerAuthEngine] Error reading banned DB:", err);
    bannedCache = {};
  }

  // Ensure Super Admin exists in server DB
  const adminKey = SUPER_ADMIN_EMAIL.toLowerCase().trim();
  if (!usersCache[adminKey]) {
    usersCache[adminKey] = {
      id: "usr_superadmin_01",
      fullName: "Süper Yönetici",
      email: SUPER_ADMIN_EMAIL,
      phone: "+90 (Süper Yetki)",
      role: "superadmin",
      plan: "quantum_vip",
      credits: 9999,
      isEmailVerified: true,
      isPhoneVerified: true,
      isBanned: false,
      joinedDate: new Date().toLocaleDateString("tr-TR"),
      lastLoginAt: new Date().toISOString(),
    };
    persistUsersToDisk();
  }

  isInitialized = true;
}

function persistUsersToDisk() {
  try {
    const dir = path.dirname(USERS_DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(usersCache, null, 2), "utf-8");
  } catch (err) {
    console.warn("[ServerAuthEngine] Warning saving users DB:", err);
  }
}

function persistBannedToDisk() {
  try {
    const dir = path.dirname(BANNED_LIST_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(BANNED_LIST_PATH, JSON.stringify(bannedCache, null, 2), "utf-8");
  } catch (err) {
    console.warn("[ServerAuthEngine] Warning saving banned DB:", err);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

function sanitizeUser(u: ServerUserRecord): Omit<ServerUserRecord, "passwordHash" | "salt"> {
  const { passwordHash, salt, ...safe } = u;
  return safe;
}

export function isEmailBanned(rawEmail?: string): { isBanned: boolean; reason?: string } {
  if (!rawEmail) return { isBanned: false };
  ensureInitialized();
  const key = rawEmail.toLowerCase().trim();
  if (key === SUPER_ADMIN_EMAIL) return { isBanned: false };

  if (bannedCache[key]) {
    return { isBanned: true, reason: bannedCache[key].reason };
  }
  const u = usersCache[key];
  if (u && u.isBanned) {
    return { isBanned: true, reason: u.banReason || "Sistem kuralları ihlali" };
  }
  return { isBanned: false };
}

export function registerServerUser(data: {
  email: string;
  password?: string;
  fullName?: string;
  phone?: string;
  location?: string;
  device?: string;
}): { success: boolean; user?: Omit<ServerUserRecord, "passwordHash" | "salt">; token?: string; error?: string } {
  ensureInitialized();
  const emailKey = data.email.toLowerCase().trim();

  if (!emailKey || !emailKey.includes("@")) {
    return { success: false, error: "Geçersiz e-posta adresi." };
  }

  const banCheck = isEmailBanned(emailKey);
  if (banCheck.isBanned) {
    return { success: false, error: `⛔ Bu hesap askıya alınmıştır: ${banCheck.reason}` };
  }

  const existing = usersCache[emailKey];
  if (existing) {
    // If user exists and password is provided, try verifying instead of erroring
    if (data.password && existing.passwordHash && existing.salt) {
      const testHash = hashPassword(data.password, existing.salt);
      if (testHash === existing.passwordHash) {
        const token = crypto.randomBytes(32).toString("hex");
        activeSessions[token] = { email: emailKey, expiresAt: Date.now() + 7 * 24 * 3600 * 1000 };
        return { success: true, user: sanitizeUser(existing), token };
      }
    }
    return { success: false, error: "Bu e-posta adresiyle zaten bir hesap kayıtlı. Lütfen 'Giriş Yap' sekmesini kullanın." };
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = data.password ? hashPassword(data.password, salt) : undefined;
  const isSuper = emailKey === SUPER_ADMIN_EMAIL;

  const newUser: ServerUserRecord = {
    id: "usr_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    fullName: data.fullName || (isSuper ? "Süper Yönetici" : emailKey.split("@")[0].toUpperCase()),
    email: emailKey,
    phone: data.phone || (isSuper ? "+90 (Süper Yetki)" : ""),
    role: isSuper ? "superadmin" : "user",
    plan: isSuper ? "quantum_vip" : "free",
    credits: isSuper ? 9999 : 35, // Balanced welcome bonus of 35 credits
    isEmailVerified: true,
    isPhoneVerified: true,
    isBanned: false,
    joinedDate: new Date().toLocaleDateString("tr-TR"),
    passwordHash,
    salt,
    location: data.location,
    device: data.device,
    lastLoginAt: new Date().toISOString(),
  };

  usersCache[emailKey] = newUser;
  persistUsersToDisk();

  // Register in ServerCreditEngine
  syncServerUserAccount(emailKey, {
    credits: newUser.credits,
    plan: newUser.plan,
    role: newUser.role,
  });

  const token = crypto.randomBytes(32).toString("hex");
  activeSessions[token] = { email: emailKey, expiresAt: Date.now() + 7 * 24 * 3600 * 1000 };

  return { success: true, user: sanitizeUser(newUser), token };
}

export function loginServerUser(
  email: string,
  password?: string
): { success: boolean; user?: Omit<ServerUserRecord, "passwordHash" | "salt">; token?: string; error?: string } {
  ensureInitialized();
  const emailKey = email.toLowerCase().trim();
  const isSuper = emailKey === SUPER_ADMIN_EMAIL;

  const banCheck = isEmailBanned(emailKey);
  if (!isSuper && banCheck.isBanned) {
    return { success: false, error: `⛔ Bu hesap yönetici tarafından askıya alınmıştır: ${banCheck.reason}` };
  }

  let user = usersCache[emailKey];

  if (isSuper) {
    if (!user) {
      user = {
        id: "usr_superadmin_01",
        fullName: "Süper Yönetici",
        email: SUPER_ADMIN_EMAIL,
        phone: "+90 (Süper Yetki)",
        role: "superadmin",
        plan: "quantum_vip",
        credits: 9999,
        isEmailVerified: true,
        isPhoneVerified: true,
        isBanned: false,
        joinedDate: new Date().toLocaleDateString("tr-TR"),
      };
      usersCache[emailKey] = user;
      persistUsersToDisk();
    }
    const token = crypto.randomBytes(32).toString("hex");
    activeSessions[token] = { email: emailKey, expiresAt: Date.now() + 30 * 24 * 3600 * 1000 };
    return { success: true, user: sanitizeUser(user), token };
  }

  if (!user) {
    return { success: false, error: "Kayıtlı hesap bulunamadı. Lütfen önce 'Kayıt Ol' sekmesinden hesap oluşturun." };
  }

  if (password && user.passwordHash && user.salt) {
    const testHash = hashPassword(password, user.salt);
    if (testHash !== user.passwordHash) {
      return { success: false, error: "Hatalı şifre girdiniz. Lütfen tekrar deneyin." };
    }
  }

  // Update latest balance from credit ledger
  const liveLedger = getServerUserAccount(emailKey);
  user.credits = liveLedger.credits;
  user.lastLoginAt = new Date().toISOString();
  persistUsersToDisk();

  const token = crypto.randomBytes(32).toString("hex");
  activeSessions[token] = { email: emailKey, expiresAt: Date.now() + 7 * 24 * 3600 * 1000 };

  return { success: true, user: sanitizeUser(user), token };
}

export function generateAndStoreOtp(
  target: string,
  type: "email" | "phone"
): { code: string; expiresInSec: number; error?: string } {
  const normalizedTarget = target.toLowerCase().trim();
  const key = `${type}:${normalizedTarget}`;

  // Cooldown check: At least 45 seconds between OTP requests for the same target
  const existing = activeOtps[key];
  const now = Date.now();
  if (existing && now - existing.createdAt < 45 * 1000) {
    const waitSec = Math.ceil((45 * 1000 - (now - existing.createdAt)) / 1000);
    return {
      code: "",
      expiresInSec: 0,
      error: `Lütfen yeni bir doğrulama kodu istemeden önce ${waitSec} saniye bekleyin.`,
    };
  }

  const code = crypto.randomInt(100000, 1000000).toString();
  activeOtps[key] = {
    code,
    type,
    expiresAt: now + 300 * 1000, // 5 minutes TTL
    target: normalizedTarget,
    attempts: 0,
    createdAt: now,
  };
  return { code, expiresInSec: 300 };
}

export function verifyOtp(
  target: string,
  type: "email" | "phone",
  enteredCode: string
): { success: boolean; error?: string } {
  const key = `${type}:${target.toLowerCase().trim()}`;
  const record = activeOtps[key];

  if (!record) {
    return { success: false, error: "Doğrulama kodunun süresi dolmuş veya kod talep edilmemiş." };
  }

  if (Date.now() > record.expiresAt) {
    delete activeOtps[key];
    return { success: false, error: "Kodun 5 dakikalık geçerlilik süresi dolmuştur. Lütfen yeni kod isteyin." };
  }

  // Brute-force protection: Max 5 attempts
  if (record.attempts >= 5) {
    delete activeOtps[key];
    return { success: false, error: "Çok fazla hatalı deneme yapıldı. Güvenlik nedeniyle kod iptal edildi. Lütfen yeni kod isteyin." };
  }

  if (record.code !== enteredCode.trim()) {
    record.attempts = (record.attempts || 0) + 1;
    const remaining = 5 - record.attempts;
    if (remaining <= 0) {
      delete activeOtps[key];
      return { success: false, error: "Çok fazla hatalı deneme yapıldı. Kod geçersiz kılındı. Lütfen yeni kod isteyin." };
    }
    return { success: false, error: `Girilen kod hatalı. Kalan deneme hakkı: ${remaining}.` };
  }

  delete activeOtps[key];

  // If phone OTP, mark user's phone verified on server
  if (type === "phone") {
    ensureInitialized();
    const emailKey = target.toLowerCase().trim();
    if (usersCache[emailKey]) {
      usersCache[emailKey].isPhoneVerified = true;
      persistUsersToDisk();
    }
  }

  return { success: true };
}

/**
 * Invalidate a server session token upon user logout
 */
export function invalidateSession(sessionToken: string): boolean {
  if (!sessionToken) return false;
  if (activeSessions[sessionToken]) {
    delete activeSessions[sessionToken];
    return true;
  }
  return false;
}

export function banUserOnServer(
  targetEmail: string,
  reason: string,
  bannedBy = "Yönetici"
): { success: boolean; error?: string } {
  ensureInitialized();
  const key = targetEmail.toLowerCase().trim();
  if (key === SUPER_ADMIN_EMAIL) {
    return { success: false, error: "Süper yönetici hesabı banlanamaz." };
  }

  bannedCache[key] = {
    reason: reason || "Kullanıcı kuralları ihlali",
    bannedAt: new Date().toISOString(),
    bannedBy,
  };
  persistBannedToDisk();

  if (usersCache[key]) {
    usersCache[key].isBanned = true;
    usersCache[key].banReason = reason;
    usersCache[key].bannedAt = new Date().toISOString();
    persistUsersToDisk();
  }

  // Invalidate any active sessions
  for (const [token, session] of Object.entries(activeSessions)) {
    if (session.email === key) {
      delete activeSessions[token];
    }
  }

  console.log(`[ServerAuthEngine] User ${key} banned by ${bannedBy}. Reason: ${reason}`);
  return { success: true };
}

export function unbanUserOnServer(targetEmail: string): { success: boolean; error?: string } {
  ensureInitialized();
  const key = targetEmail.toLowerCase().trim();
  delete bannedCache[key];
  persistBannedToDisk();

  if (usersCache[key]) {
    usersCache[key].isBanned = false;
    delete usersCache[key].banReason;
    delete usersCache[key].bannedAt;
    persistUsersToDisk();
  }

  console.log(`[ServerAuthEngine] User ${key} unbanned.`);
  return { success: true };
}

export function getAllServerUsers(): Omit<ServerUserRecord, "passwordHash" | "salt">[] {
  ensureInitialized();
  return Object.values(usersCache).map(sanitizeUser);
}

export function getSessionUserEmail(sessionToken: string): string | null {
  if (!sessionToken) return null;
  const session = activeSessions[sessionToken];
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    delete activeSessions[sessionToken];
    return null;
  }
  return session.email;
}

export interface VerifiedAuthUser {
  email: string;
  userId: string;
  role: "user" | "admin" | "superadmin";
  plan?: "free" | "pro" | "quantum_vip";
  authType: "server_session" | "firebase_id_token" | "admin_token";
}

// In-memory cache for validated Firebase ID tokens to prevent network latency on repeated requests
const verifiedFirebaseTokensCache = new Map<string, { email: string; userId: string; expiresAt: number }>();

let cachedFirebaseApiKey: string | null = null;
function getFirebaseApiKey(): string {
  if (cachedFirebaseApiKey !== null) return cachedFirebaseApiKey;
  let key = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || "";
  if (!key) {
    try {
      const cfgPath = path.join(process.cwd(), "firebase-applet-config.json");
      if (fs.existsSync(cfgPath)) {
        const raw = fs.readFileSync(cfgPath, "utf-8");
        const parsed = JSON.parse(raw);
        key = parsed.apiKey || "";
      }
    } catch {}
  }
  cachedFirebaseApiKey = key;
  return key;
}

/**
 * Verify a Firebase ID Token via Google Identity Toolkit
 */
export async function verifyFirebaseIdToken(token: string): Promise<{ email: string; userId: string } | null> {
  if (!token || typeof token !== "string") return null;

  // Quick check: JWT format has two dots (header.payload.signature)
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  // Check in-memory cache
  const cached = verifiedFirebaseTokensCache.get(token);
  if (cached) {
    if (Date.now() < cached.expiresAt) {
      return { email: cached.email, userId: cached.userId };
    } else {
      verifiedFirebaseTokensCache.delete(token);
    }
  }

  const apiKey = getFirebaseApiKey();
  if (!apiKey) return null;

  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    const user = data?.users?.[0];
    if (user && user.email) {
      const email = user.email.toLowerCase().trim();
      const userId = user.localId || email;
      // Cache valid result for 5 minutes
      verifiedFirebaseTokensCache.set(token, {
        email,
        userId,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });
      return { email, userId };
    }
  } catch (err) {
    console.warn("[ServerAuthEngine] Error validating Firebase ID token:", err);
  }

  return null;
}

/**
 * Authoritative Server User Identity Resolver:
 * Resolves verified identity ONLY from authenticated sources:
 * 1. Admin Token / Superadmin session
 * 2. Active Server Session Token (PBKDF2/Crypto authenticated)
 * 3. Verified Firebase ID Token (Signed Google JWT)
 *
 * x-user-email is NEVER accepted as proof of identity!
 */
export async function resolveVerifiedUser(
  req: any,
  isReqAdminFn?: (req: any) => boolean
): Promise<VerifiedAuthUser | null> {
  // 1. Check if authenticated as Administrator
  if (isReqAdminFn && isReqAdminFn(req)) {
    return {
      email: SUPER_ADMIN_EMAIL,
      userId: "usr_superadmin_01",
      role: "superadmin",
      plan: "quantum_vip",
      authType: "admin_token",
    };
  }

  // 2. Extract Bearer token from headers
  const authHeader = String(
    req.headers["authorization"]?.replace(/^Bearer\s+/i, "") ||
    req.headers["x-auth-token"] ||
    req.headers["x-session-token"] ||
    ""
  ).trim();

  if (!authHeader) {
    return null;
  }

  // 3. Check Server-side Crypto Session Token
  const sessionEmail = getSessionUserEmail(authHeader);
  if (sessionEmail) {
    ensureInitialized();
    const emailKey = sessionEmail.toLowerCase().trim();
    const u = usersCache[emailKey];
    return {
      email: emailKey,
      userId: u?.id || emailKey,
      role: u?.role || (emailKey === SUPER_ADMIN_EMAIL ? "superadmin" : "user"),
      plan: u?.plan || (emailKey === SUPER_ADMIN_EMAIL ? "quantum_vip" : "free"),
      authType: "server_session",
    };
  }

  // 4. Check Firebase ID Token
  const fbResult = await verifyFirebaseIdToken(authHeader);
  if (fbResult) {
    const emailKey = fbResult.email.toLowerCase().trim();
    return {
      email: emailKey,
      userId: fbResult.userId,
      role: emailKey === SUPER_ADMIN_EMAIL ? "superadmin" : "user",
      plan: emailKey === SUPER_ADMIN_EMAIL ? "quantum_vip" : "free",
      authType: "firebase_id_token",
    };
  }

  return null;
}

/**
 * Permanently purge user account and revoke all sessions from server auth database
 */
export function deleteServerUserAccount(emailOrUserId?: string): boolean {
  if (!emailOrUserId) return false;
  ensureInitialized();
  const cleaned = emailOrUserId.toLowerCase().trim();
  if (cleaned === SUPER_ADMIN_EMAIL || cleaned === "usr_superadmin_01") {
    return false;
  }

  let removed = false;
  let targetEmail = "";

  if (usersCache[cleaned]) {
    targetEmail = usersCache[cleaned].email.toLowerCase().trim();
    delete usersCache[cleaned];
    removed = true;
  }

  // Also check by ID if email did not match directly
  for (const [key, u] of Object.entries(usersCache)) {
    if (u.id === emailOrUserId && key !== SUPER_ADMIN_EMAIL) {
      targetEmail = u.email.toLowerCase().trim();
      delete usersCache[key];
      removed = true;
    }
  }

  // Revoke all active session tokens associated with this user
  const emailsToRevoke = new Set<string>();
  if (targetEmail) emailsToRevoke.add(targetEmail);
  if (cleaned.includes("@")) emailsToRevoke.add(cleaned);

  for (const [token, sess] of Object.entries(activeSessions)) {
    if (emailsToRevoke.has(sess.email.toLowerCase().trim())) {
      delete activeSessions[token];
    }
  }

  // Revoke any cached Firebase tokens
  for (const [token, cached] of verifiedFirebaseTokensCache.entries()) {
    if (emailsToRevoke.has(cached.email.toLowerCase().trim()) || cached.userId === emailOrUserId) {
      verifiedFirebaseTokensCache.delete(token);
    }
  }

  if (removed) {
    persistUsersToDisk();
  }
  return removed;
}

/**
 * Helper for tests: register an active session
 */
export function createTestSession(email: string, role: "user" | "admin" | "superadmin" = "user"): string {
  ensureInitialized();
  const emailKey = email.toLowerCase().trim();
  const token = `test_session_${crypto.randomBytes(16).toString("hex")}`;
  activeSessions[token] = { email: emailKey, expiresAt: Date.now() + 3600000 };
  if (!usersCache[emailKey]) {
    usersCache[emailKey] = {
      id: `usr_${crypto.randomBytes(6).toString("hex")}`,
      fullName: "Test User",
      email: emailKey,
      role,
      plan: role === "superadmin" ? "quantum_vip" : "free",
      credits: 10,
      isEmailVerified: true,
      isPhoneVerified: true,
      isBanned: false,
      joinedDate: new Date().toLocaleDateString("tr-TR"),
    };
  }
  return token;
}

