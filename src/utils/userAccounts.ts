import { UserProfile } from "../components/UserAuthModal";

const ACCOUNTS_DB_KEY = "future_timeline_accounts_db";

export interface StoredUserAccount extends UserProfile {
  hasClaimedWelcomeBonus: boolean;
}

const SUPER_ADMIN_EMAIL = "warfacelove46@gmail.com";

/**
 * Retrieve all registered user accounts from localStorage (sanitizing any legacy plaintext passwords)
 */
export function getAllAccounts(): Record<string, StoredUserAccount> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_DB_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    let modified = false;
    for (const key of Object.keys(parsed)) {
      if (parsed[key] && "password" in parsed[key]) {
        delete parsed[key].password;
        modified = true;
      }
    }
    if (modified) {
      localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    console.error("Failed to parse user accounts database", e);
    return {};
  }
}

/**
 * Find account by email (case-insensitive)
 */
export function getAccountByEmail(email: string): StoredUserAccount | null {
  if (!email) return null;
  const accounts = getAllAccounts();
  const normalized = email.trim().toLowerCase();
  const acc = accounts[normalized];
  if (acc) {
    if (normalized === SUPER_ADMIN_EMAIL) {
      acc.role = "superadmin";
    }
  }
  return acc || null;
}

/**
 * Save or update a user account in localStorage DB
 */
export function saveAccount(account: StoredUserAccount | UserProfile): StoredUserAccount {
  const accounts = getAllAccounts();
  const normalizedEmail = account.email.trim().toLowerCase();
  const isSuper = normalizedEmail === SUPER_ADMIN_EMAIL;

  const existing = accounts[normalizedEmail];

  const fullAccount: StoredUserAccount = {
    id: account.id || existing?.id || "usr_" + Date.now(),
    fullName: account.fullName || existing?.fullName || "Gelecek Gezgini",
    email: account.email,
    phone: account.phone || existing?.phone || "",
    role: isSuper ? "superadmin" : (account.role || existing?.role || "user"),
    isEmailVerified: account.isEmailVerified ?? true,
    isPhoneVerified: true,
    joinedDate: account.joinedDate || existing?.joinedDate || new Date().toLocaleDateString("tr-TR"),
    credits: account.credits !== undefined ? account.credits : (existing?.credits ?? (isSuper ? 9999 : 0)),
    plan: isSuper ? "quantum_vip" : (account.plan || existing?.plan || "free"),
    hasClaimedWelcomeBonus: existing?.hasClaimedWelcomeBonus ?? true,
    isBanned: account.isBanned ?? existing?.isBanned ?? false,
    banReason: account.banReason !== undefined ? account.banReason : existing?.banReason,
    unbanNoticePending: account.unbanNoticePending !== undefined ? account.unbanNoticePending : existing?.unbanNoticePending,
    isProbationRequired: account.isProbationRequired !== undefined ? account.isProbationRequired : existing?.isProbationRequired,
    probationAcceptedAt: account.probationAcceptedAt || existing?.probationAcceptedAt,
    location: account.location || existing?.location,
    device: account.device || existing?.device,
    cookieConsent: account.cookieConsent || existing?.cookieConsent,
    username: account.username !== undefined ? account.username : existing?.username,
    age: account.age !== undefined ? account.age : existing?.age,
    gender: account.gender !== undefined ? account.gender : existing?.gender,
    country: account.country !== undefined ? account.country : (existing?.country || "Türkiye"),
    city: account.city !== undefined ? account.city : existing?.city,
    isProfilePrivate: account.isProfilePrivate !== undefined ? account.isProfilePrivate : (existing?.isProfilePrivate ?? true),
    lifeRole: account.lifeRole !== undefined ? account.lifeRole : existing?.lifeRole,
    lifeRoleLabel: account.lifeRoleLabel !== undefined ? account.lifeRoleLabel : existing?.lifeRoleLabel,
    primaryGoal: account.primaryGoal !== undefined ? account.primaryGoal : existing?.primaryGoal,
    primaryGoalLabel: account.primaryGoalLabel !== undefined ? account.primaryGoalLabel : existing?.primaryGoalLabel,
    profession: account.profession !== undefined ? account.profession : existing?.profession,
    personalGoal: account.personalGoal !== undefined ? account.personalGoal : existing?.personalGoal,
    employmentStatus: account.employmentStatus !== undefined ? account.employmentStatus : existing?.employmentStatus,
    seniority: account.seniority !== undefined ? account.seniority : existing?.seniority,
    industrySector: account.industrySector !== undefined ? account.industrySector : existing?.industrySector,
    isOnboardingCompleted: account.isOnboardingCompleted !== undefined ? account.isOnboardingCompleted : existing?.isOnboardingCompleted,
  };

  accounts[normalizedEmail] = fullAccount;

  try {
    localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error("Failed to save account to localStorage", e);
  }

  // Asynchronously synchronize with authoritative server DB
  try {
    fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fullAccount.email,
        fullName: fullAccount.fullName,
        phone: fullAccount.phone,
        location: fullAccount.location,
        device: fullAccount.device,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.token) {
          try {
            localStorage.setItem("future_user_session_token", data.token);
          } catch {}
        }
      })
      .catch(() => {});
  } catch (_err) {}

  return fullAccount;
}

/**
 * Create a new account with 0 initial credits if email does not exist yet.
 * If account already exists, returns the existing account with its saved credits intact.
 */
export function registerOrGetAccount(
  email: string,
  fullName?: string,
  phone?: string,
  initialCredits = 0,
  isPhoneVerified = true
): StoredUserAccount {
  const normalizedEmail = email.trim().toLowerCase();
  const isSuper = normalizedEmail === SUPER_ADMIN_EMAIL;
  const existing = getAccountByEmail(email);
  if (existing) {
    // Return existing user account without resetting or adding credits!
    if (isSuper) {
      existing.role = "superadmin";
      existing.plan = "quantum_vip";
      existing.isPhoneVerified = true;
    }
    return existing;
  }

  const newAccount: StoredUserAccount = {
    id: "usr_" + Date.now(),
    fullName: fullName || (isSuper ? "Süper Yönetici" : email.split("@")[0].toUpperCase()),
    email: normalizedEmail,
    phone: phone || "",
    role: isSuper ? "superadmin" : "user",
    isEmailVerified: true,
    isPhoneVerified: true,
    joinedDate: new Date().toLocaleDateString("tr-TR"),
    credits: isSuper ? 9999 : initialCredits, // Initial credits (0 default; earned via spin wheel & ads) or unlimited for admin
    plan: isSuper ? "quantum_vip" : "free",
    hasClaimedWelcomeBonus: true,
  };

  return saveAccount(newAccount);
}

/**
 * Delete a user account from localStorage DB
 */
export function deleteAccount(email: string): boolean {
  if (!email) return false;
  try {
    const accounts = getAllAccounts();
    const normalized = email.trim().toLowerCase();
    if (accounts[normalized]) {
      delete accounts[normalized];
      localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(accounts));
      return true;
    }
    return false;
  } catch (e) {
    console.error("Failed to delete account from localStorage", e);
    return false;
  }
}

/**
 * Deep purge of all user-scoped data, caches, counters, and tokens in client storage
 * (Preserves non-user application settings such as themes or global configurations)
 */
export function purgeAllUserLocalData(rawEmail?: string): void {
  if (!rawEmail) return;
  const email = rawEmail.trim().toLowerCase();
  try {
    // 1. Remove from accounts DB
    deleteAccount(email);

    // 2. Remove user session and profile caches
    localStorage.removeItem("future_timeline_user");
    localStorage.removeItem("future_user_session_token");
    localStorage.removeItem("user_profile_account");
    localStorage.removeItem("future_timeline_pending_verification");
    localStorage.removeItem("future_user_badges");

    // 3. Remove user-keyed trackers and logs
    localStorage.removeItem(`future_rewarded_ads_${email}`);
    localStorage.removeItem(`future_sponsor_clicks_${email}`);
    localStorage.removeItem(`future_rate_limits_${email}`);
    localStorage.removeItem(`future_daily_feature_usage_${email}`);
    localStorage.removeItem(`future_user_agent_scans_${email}`);
    localStorage.removeItem(`future_user_predictions_${email}`);
    localStorage.removeItem(`future_timeline_custom_scenarios_${email}`);
    localStorage.removeItem(`future_unban_notice_${email}`);

    // 4. Remove session lock flags
    sessionStorage.removeItem("future_session_locked");
    sessionStorage.removeItem("future_session_lock_reason");
    sessionStorage.removeItem("future_admin_session_auth_key");
  } catch (e) {
    console.warn("Failed to complete local storage purge for user:", e);
  }
}
