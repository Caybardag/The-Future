import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export interface AdminUserRecord {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  credits: number;
  plan: "free" | "pro" | "quantum_vip";
  role: "superadmin" | "admin" | "user";
  isBanned?: boolean;
  banReason?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  joinedDate: string;
  lastActive?: string;
  notes?: string;
  unbanNoticePending?: boolean;
  isProbationRequired?: boolean;
  probationAcceptedAt?: string;
}

export interface CreditDisputeLog {
  id: string;
  timestamp: string;
  userEmail: string;
  featureKey: string;
  featureName: string;
  deductedCredits: number;
  status: "failed_ai" | "auto_refunded" | "refunded" | "investigating" | "resolved";
  errorMessage?: string;
  refundedAt?: string;
  refundNote?: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  targetUser?: string;
  details: string;
  ip?: string;
  severity: "info" | "warning" | "critical";
}

export interface SystemConfig {
  maintenanceMode: boolean;
  aiEngineMode: "gemini_live" | "offline_simulation" | "hybrid";
  dailyFreeLimitMultiplier: number;
  globalRateLimitCooldownSec: number;
  welcomeBonusCredits: number;
  systemAnnouncement: string;
  allowNewRegistrations: boolean;
}

interface AdminContextType {
  isAdminAuthenticated: boolean;
  isSuperAdminEmail: boolean;
  adminPasscodeEntered: boolean;
  systemConfig: SystemConfig;
  authenticateAdmin: (passcode: string) => Promise<boolean>;
  lockAdminSession: () => void;
  updateSystemConfig: (newConfig: Partial<SystemConfig>) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  maintenanceMode: false,
  aiEngineMode: "hybrid",
  dailyFreeLimitMultiplier: 1,
  globalRateLimitCooldownSec: 3,
  welcomeBonusCredits: 0,
  systemAnnouncement: "",
  allowNewRegistrations: true,
};

const SUPER_ADMIN_EMAIL = "warfacelove46@gmail.com";
const ADMIN_STORAGE_PASSKEY = "future_admin_session_auth_key";
const ADMIN_CONFIG_STORAGE_KEY = "future_admin_system_config";

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [adminPasscodeEntered, setAdminPasscodeEntered] = useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem(ADMIN_STORAGE_PASSKEY) === "valid_unlocked" &&
        Boolean(sessionStorage.getItem("future_admin_session_token"))
      );
    } catch {
      return false;
    }
  });

  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_CONFIG_STORAGE_KEY);
      return saved ? { ...DEFAULT_SYSTEM_CONFIG, ...JSON.parse(saved) } : DEFAULT_SYSTEM_CONFIG;
    } catch {
      return DEFAULT_SYSTEM_CONFIG;
    }
  });

  const userEmail = (currentUser?.email || "").toLowerCase().trim();
  const isSuperAdminEmail = userEmail === SUPER_ADMIN_EMAIL || currentUser?.role === "superadmin" || currentUser?.role === "admin";
  const isAdminAuthenticated = isSuperAdminEmail && adminPasscodeEntered;

  // Verify server-side session validity on mount
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const token = sessionStorage.getItem("future_admin_session_token");
        if (!token) {
          setAdminPasscodeEntered(false);
          return;
        }
        const res = await fetch("/api/admin/verify-session", {
          headers: { "x-admin-token": token },
        });
        const data = await res.json();
        if (data.isAdminAuthenticated) {
          setAdminPasscodeEntered(true);
        } else {
          setAdminPasscodeEntered(false);
          sessionStorage.removeItem("future_admin_session_token");
          sessionStorage.removeItem(ADMIN_STORAGE_PASSKEY);
        }
      } catch {
        // preserve local status on network error
      }
    };
    checkActiveSession();
  }, [userEmail]);

  const authenticateAdmin = async (passcode: string): Promise<boolean> => {
    try {
      const email = userEmail || SUPER_ADMIN_EMAIL;
      const res = await fetch("/api/admin/verify-passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, passcode: passcode.trim() }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        setAdminPasscodeEntered(true);
        try {
          sessionStorage.setItem("future_admin_session_token", data.token);
          sessionStorage.setItem(ADMIN_STORAGE_PASSKEY, "valid_unlocked");
        } catch {}
        return true;
      }
    } catch (e) {
      console.warn("Admin verification network error:", e);
    }
    return false;
  };

  const lockAdminSession = () => {
    try {
      const token = sessionStorage.getItem("future_admin_session_token");
      if (token) {
        fetch("/api/admin/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-token": token },
        }).catch(() => {});
      }
      setAdminPasscodeEntered(false);
      sessionStorage.removeItem(ADMIN_STORAGE_PASSKEY);
      sessionStorage.removeItem("future_admin_session_token");
    } catch {}
  };

  const updateSystemConfig = (newConfig: Partial<SystemConfig>) => {
    setSystemConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      try {
        localStorage.setItem(ADMIN_CONFIG_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  return (
    <AdminContext.Provider
      value={{
        isAdminAuthenticated,
        isSuperAdminEmail,
        adminPasscodeEntered,
        systemConfig,
        authenticateAdmin,
        lockAdminSession,
        updateSystemConfig,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
};
