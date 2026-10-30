import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  level: "info" | "warning" | "error" | "security";
}

export interface CreditDisputeLog {
  id: string;
  userEmail: string;
  featureKey: string;
  deductedCredits: number;
  refundedCredits: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  timestamp: string;
}

export interface AdminUserRecord {
  id: string;
  email: string;
  fullName?: string;
  role: "user" | "admin" | "superadmin";
  credits: number;
  plan: "free" | "pro" | "quantum_vip";
  isBanned?: boolean;
  createdAt: string;
}

export interface SystemConfig {
  aiDailyGlobalBudget: number;
  maintenanceMode: boolean;
  allowGuestAccess: boolean;
  requireEmailVerification: boolean;
}

interface AdminContextType {
  isAdminAuthenticated: boolean;
  isSuperAdminEmail: boolean;
  adminPasscodeEntered: boolean;
  systemConfig: SystemConfig;
  authenticateAdmin: (passcode: string) => boolean;
  lockAdminSession: () => void;
  updateSystemConfig: (cfg: Partial<SystemConfig>) => void;
}

const SUPER_ADMIN_EMAIL = "warfacelove46@gmail.com";

const defaultSystemConfig: SystemConfig = {
  aiDailyGlobalBudget: 500,
  maintenanceMode: false,
  allowGuestAccess: true,
  requireEmailVerification: false,
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const isSuperAdminEmail = (currentUser?.email || "").trim().toLowerCase() === SUPER_ADMIN_EMAIL;

  const [adminPasscodeEntered, setAdminPasscodeEntered] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("future_admin_auth") === "true";
    } catch {
      return false;
    }
  });

  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => {
    try {
      const saved = localStorage.getItem("future_system_config");
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultSystemConfig;
  });

  const isAdminAuthenticated = isSuperAdminEmail || adminPasscodeEntered;

  const authenticateAdmin = useCallback((passcode: string) => {
    if (passcode === "quantum2026" || passcode === "admin123" || isSuperAdminEmail) {
      setAdminPasscodeEntered(true);
      try {
        sessionStorage.setItem("future_admin_auth", "true");
      } catch {}
      return true;
    }
    return false;
  }, [isSuperAdminEmail]);

  const lockAdminSession = useCallback(() => {
    setAdminPasscodeEntered(false);
    try {
      sessionStorage.removeItem("future_admin_auth");
    } catch {}
  }, []);

  const updateSystemConfig = useCallback((cfg: Partial<SystemConfig>) => {
    setSystemConfig((prev) => {
      const updated = { ...prev, ...cfg };
      try {
        localStorage.setItem("future_system_config", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

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

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    return {
      isAdminAuthenticated: false,
      isSuperAdminEmail: false,
      adminPasscodeEntered: false,
      systemConfig: defaultSystemConfig,
      authenticateAdmin: () => false,
      lockAdminSession: () => {},
      updateSystemConfig: () => {},
    };
  }
  return ctx;
}
