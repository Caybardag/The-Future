import crypto from "crypto";

export interface VerifiedAuthUser {
  email: string;
  userId?: string;
  role: "user" | "admin" | "superadmin";
  isSuperAdmin: boolean;
  isBanned?: boolean;
}

export interface StoredServerUser {
  email: string;
  userId: string;
  fullName?: string;
  role: "user" | "admin" | "superadmin";
  isBanned: boolean;
  banReason?: string;
  createdAt: string;
  phone?: string;
}

const SUPER_ADMIN_EMAIL = "warfacelove46@gmail.com";
const memoryUsers = new Map<string, StoredServerUser>();
const bannedEmails = new Set<string>();
const testSessions = new Map<string, { email: string; role: "user" | "admin" | "superadmin" }>();
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export function isEmailBanned(email: string): { isBanned: boolean; reason?: string } {
  const norm = (email || "").trim().toLowerCase();
  if (norm === SUPER_ADMIN_EMAIL) return { isBanned: false };
  if (bannedEmails.has(norm)) {
    return { isBanned: true, reason: "Kullanım şartları ihlali / Güvenlik kısıtlaması" };
  }
  return { isBanned: false };
}

export function banUserOnServer(email: string, reason: string = "Şüpheli aktivite"): void {
  const norm = (email || "").trim().toLowerCase();
  if (norm === SUPER_ADMIN_EMAIL) return;
  bannedEmails.add(norm);
  const user = memoryUsers.get(norm);
  if (user) {
    user.isBanned = true;
    user.banReason = reason;
  }
}

export function unbanUserOnServer(email: string): void {
  const norm = (email || "").trim().toLowerCase();
  bannedEmails.delete(norm);
  const user = memoryUsers.get(norm);
  if (user) {
    user.isBanned = false;
    user.banReason = undefined;
  }
}

export function registerServerUser(data: {
  email: string;
  password?: string;
  fullName?: string;
  phone?: string;
  location?: any;
  device?: any;
}): { success: boolean; user?: StoredServerUser; error?: string } {
  const norm = (data.email || "").trim().toLowerCase();
  if (!norm) return { success: false, error: "Geçersiz e-posta" };

  const isSuper = norm === SUPER_ADMIN_EMAIL;
  const user: StoredServerUser = {
    email: norm,
    userId: `usr_${crypto.randomBytes(6).toString("hex")}`,
    fullName: data.fullName || norm.split("@")[0],
    role: isSuper ? "superadmin" : "user",
    isBanned: false,
    createdAt: new Date().toISOString(),
    phone: data.phone,
  };

  memoryUsers.set(norm, user);
  return { success: true, user };
}

export function loginServerUser(email: string, password?: string): { success: boolean; user?: StoredServerUser; token?: string; error?: string } {
  const norm = (email || "").trim().toLowerCase();
  const ban = isEmailBanned(norm);
  if (ban.isBanned) return { success: false, error: ban.reason };

  let user = memoryUsers.get(norm);
  if (!user) {
    const reg = registerServerUser({ email: norm });
    user = reg.user!;
  }

  const token = `tok_${crypto.randomBytes(16).toString("hex")}`;
  testSessions.set(token, { email: user.email, role: user.role });
  return { success: true, user, token };
}

export function createTestSession(email: string, role: "user" | "admin" | "superadmin" = "user"): string {
  const token = `test_sess_${crypto.randomBytes(8).toString("hex")}`;
  testSessions.set(token, { email: email.toLowerCase().trim(), role });
  return token;
}

export async function resolveVerifiedUser(req: any, isReqAdminFn?: (req: any) => boolean): Promise<VerifiedAuthUser | null> {
  const authHeader = req.headers?.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  // 1. Test / mock session check
  if (token && testSessions.has(token)) {
    const s = testSessions.get(token)!;
    return {
      email: s.email,
      role: s.role,
      isSuperAdmin: s.role === "superadmin" || s.email === SUPER_ADMIN_EMAIL,
      isBanned: false,
    };
  }

  // 2. Custom header or email query for development/testing
  const clientEmail = (req.headers?.["x-user-email"] || req.query?.userEmail || req.body?.userEmail || "").trim().toLowerCase();
  if (clientEmail) {
    const isSuper = clientEmail === SUPER_ADMIN_EMAIL;
    const ban = isEmailBanned(clientEmail);
    return {
      email: clientEmail,
      role: isSuper ? "superadmin" : "user",
      isSuperAdmin: isSuper,
      isBanned: ban.isBanned,
    };
  }

  // 3. Fallback admin check
  if (isReqAdminFn && isReqAdminFn(req)) {
    return {
      email: SUPER_ADMIN_EMAIL,
      role: "superadmin",
      isSuperAdmin: true,
      isBanned: false,
    };
  }

  return null;
}

export function getSessionUserEmail(reqOrToken: any): string | null {
  if (typeof reqOrToken === "string") {
    const token = reqOrToken.replace(/^Bearer\s+/i, "").trim();
    if (token && testSessions.has(token)) {
      return testSessions.get(token)!.email;
    }
    return null;
  }
  const authHeader = reqOrToken?.headers?.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (token && testSessions.has(token)) {
    return testSessions.get(token)!.email;
  }
  return (reqOrToken?.headers?.["x-user-email"] || reqOrToken?.query?.userEmail || reqOrToken?.body?.userEmail || "").trim().toLowerCase() || null;
}

export function invalidateSession(token: string): void {
  testSessions.delete(token);
}

export function deleteServerUserAccount(identifier: string): boolean {
  const norm = (identifier || "").trim().toLowerCase();
  memoryUsers.delete(norm);
  for (const [key, user] of memoryUsers.entries()) {
    if (user.userId === identifier) {
      memoryUsers.delete(key);
    }
  }
  return true;
}

export function getAllServerUsers(): StoredServerUser[] {
  return Array.from(memoryUsers.values());
}

export function generateAndStoreOtp(email: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email.toLowerCase().trim(), { code, expiresAt: Date.now() + 10 * 60 * 1000 });
  return code;
}

export function verifyOtp(email: string, code: string): boolean {
  const norm = email.toLowerCase().trim();
  const found = otpStore.get(norm);
  if (found && found.code === code && Date.now() < found.expiresAt) {
    otpStore.delete(norm);
    return true;
  }
  return false;
}
