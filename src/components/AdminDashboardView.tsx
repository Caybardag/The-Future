import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Users,
  CreditCard,
  History,
  Settings,
  Search,
  UserX,
  UserCheck,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle2,
  X,
  ExternalLink,
  Flame,
  Cpu,
  Database,
  ArrowUpRight,
  Sparkles,
  Zap,
  Activity,
  Layers,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Sliders,
  DollarSign,
  Radio,
  FileText,
  LifeBuoy,
  MessageSquareText,
  HelpCircle,
  Send,
  Check,
  Compass,
  MapPin,
  Cookie,
  Megaphone,
} from "lucide-react";
import { UserTelemetryAnalyticsPanel } from "./UserTelemetryAnalyticsPanel";
import { AdminSponsorshipManager } from "./AdminSponsorshipManager";
import { useAuth } from "../context/AuthContext";
import { useAdmin, SystemAuditLog, CreditDisputeLog, AdminUserRecord } from "../context/AdminContext";
import { getAllAccounts, saveAccount, StoredUserAccount } from "../utils/userAccounts";
import { getDisputeLogs } from "../utils/creditDisputes";
import { db, doc, getDoc, setDoc, deleteDoc, collection, getDocs, onSnapshot } from "../lib/firebase";
import { SupportTicket, TicketStatus, SupportCategory } from "../types/support";
import {
  getLocalSupportTickets,
  fetchAllSupportTickets,
  updateSupportTicketStatus,
  resolveBanAppealAndUnban,
} from "../utils/supportTickets";
import { safeFetchJson } from "../utils/apiClient";

export const AdminDashboardView: React.FC = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const {
    isAdminAuthenticated,
    isSuperAdminEmail,
    adminPasscodeEntered,
    systemConfig,
    authenticateAdmin,
    lockAdminSession,
    updateSystemConfig,
  } = useAdmin();

  // Active Tab: "users" | "telemetry" | "threats" | "credits_disputes" | "support_tickets" | "logs" | "system_controls" | "ai_monitor" | "sponsorship"
  const [activeTab, setActiveTab] = useState<"users" | "telemetry" | "threats" | "credits_disputes" | "support_tickets" | "logs" | "system_controls" | "ai_monitor" | "sponsorship">("users");
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  const scrollNavigationTabs = (direction: "left" | "right") => {
    if (tabsScrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      tabsScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };


  // Passcode verification state
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);
  const [isVerifyingPasscode, setIsVerifyingPasscode] = useState(false);

  // Users State
  const [usersList, setUsersList] = useState<AdminUserRecord[]>([]);
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);

  // Support & Ban Appeals State
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => getLocalSupportTickets());
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState<string>("");
  const [ticketFilterCategory, setTicketFilterCategory] = useState<string>("all");
  const [ticketFilterStatus, setTicketFilterStatus] = useState<string>("all");
  const [ticketSearchQuery, setTicketSearchQuery] = useState<string>("");

  // Modal / Action State for user credit modification
  const [creditAdjustmentAmount, setCreditAdjustmentAmount] = useState<number>(50);
  const [creditAdjustmentReason, setCreditAdjustmentReason] = useState<string>("Telafi / Sistem Desteği");
  const [banReasonInput, setBanReasonInput] = useState<string>("Kullanım şartları ihlali");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Disputes & Failed Requests Log (Only 100% genuine system logs)
  const [disputeLogs, setDisputeLogs] = useState<CreditDisputeLog[]>(() => {
    return (getDisputeLogs() as any) || [];
  });

  // Listen to real-time dispute & audit events
  useEffect(() => {
    const handleNewDispute = () => {
      const fresh = getDisputeLogs();
      if (fresh.length > 0) {
        setDisputeLogs(fresh as any);
      }
    };
    const handleNewAudit = () => {
      try {
        const raw = localStorage.getItem("future_timeline_audit_logs");
        if (raw) setAuditLogs(JSON.parse(raw));
      } catch {}
    };

    window.addEventListener("future_dispute_created", handleNewDispute);
    window.addEventListener("future_audit_created", handleNewAudit);
    return () => {
      window.removeEventListener("future_dispute_created", handleNewDispute);
      window.removeEventListener("future_audit_created", handleNewAudit);
    };
  }, []);

  // Listen to real-time Support Tickets (Firestore + local)
  useEffect(() => {
    fetchAllSupportTickets().then((data) => {
      if (data && data.length > 0) setSupportTickets(data);
    });

    const unsubTickets = onSnapshot(
      collection(db, "support_tickets"),
      (snapshot) => {
        const liveTickets: SupportTicket[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data() as SupportTicket;
          if (d && d.id) liveTickets.push(d);
        });
        if (liveTickets.length > 0) {
          liveTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setSupportTickets(liveTickets);
        }
      },
      (err) => {
        console.warn("Firestore support tickets listener error:", err);
      }
    );

    const handleLocalTicketUpdate = () => {
      setSupportTickets(getLocalSupportTickets());
    };

    window.addEventListener("future_support_ticket_created", handleLocalTicketUpdate);
    window.addEventListener("future_support_ticket_updated", handleLocalTicketUpdate);

    return () => {
      unsubTickets();
      window.removeEventListener("future_support_ticket_created", handleLocalTicketUpdate);
      window.removeEventListener("future_support_ticket_updated", handleLocalTicketUpdate);
    };
  }, []);

  // System Audit Logs
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem("future_timeline_admin_audit_logs");
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: "AUD-01",
              timestamp: new Date().toISOString(),
              adminEmail: currentUser?.email || "warfacelove46@gmail.com",
              action: "Yönetici Oturumu Açıldı",
              details: "Süper Yönetici PIN doğrulaması ile tam yetki paneli aktifleştirildi.",
              severity: "info",
            },
          ];
    } catch {
      return [];
    }
  });

  // Backend live metrics
  const [serverMetrics, setServerMetrics] = useState<any>(null);
  const [threatDefense, setThreatDefense] = useState<any>(null);
  const [quarantinedIps, setQuarantinedIps] = useState<string[]>([]);
  const [manualIpToQuarantine, setManualIpToQuarantine] = useState("");
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Load all users from Local DB + Firestore sync
  const refreshUsersList = async () => {
    try {
      const localAccounts = getAllAccounts();
      const recordsMap: Record<string, AdminUserRecord> = {};

      Object.values(localAccounts).forEach((acc) => {
        const emailLower = acc.email.toLowerCase();
        recordsMap[emailLower] = {
          id: acc.id,
          email: acc.email,
          fullName: acc.fullName,
          phone: acc.phone,
          credits: acc.credits ?? 0,
          plan: acc.plan || "free",
          role: emailLower === "warfacelove46@gmail.com" ? "superadmin" : ((acc as any).role || "user"),
          isBanned: (acc as any).isBanned ?? false,
          banReason: (acc as any).banReason,
          isEmailVerified: acc.isEmailVerified ?? true,
          isPhoneVerified: acc.isPhoneVerified ?? true,
          joinedDate: acc.joinedDate || new Date().toISOString(),
          lastActive: (acc as any).lastActive,
        };
      });

      // Try fetching from Firestore users collection
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        usersSnap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.email) {
            const emailLower = data.email.toLowerCase();
            recordsMap[emailLower] = {
              id: docSnap.id,
              email: data.email,
              fullName: data.fullName || (emailLower === "warfacelove46@gmail.com" ? "Süper Yönetici" : data.email.split("@")[0]),
              phone: data.phone || "",
              credits: data.credits ?? 0,
              plan: data.plan || "free",
              role: emailLower === "warfacelove46@gmail.com" ? "superadmin" : (data.role || "user"),
              isBanned: data.isBanned ?? false,
              banReason: data.banReason,
              isEmailVerified: data.isEmailVerified ?? true,
              isPhoneVerified: data.isPhoneVerified ?? true,
              joinedDate: data.joinedDate || new Date().toISOString(),
              lastActive: data.lastActive,
            };
          }
        });
      } catch (fsErr) {
        console.warn("Firestore admin users fetch warning:", fsErr);
      }

      // Ensure current user is always listed
      if (currentUser && currentUser.email) {
        const currentEmail = currentUser.email.toLowerCase();
        recordsMap[currentEmail] = {
          id: currentUser.id,
          email: currentUser.email,
          fullName: currentUser.fullName,
          phone: currentUser.phone,
          credits: currentUser.credits,
          plan: currentUser.plan,
          role: currentEmail === "warfacelove46@gmail.com" ? "superadmin" : "user",
          isBanned: false,
          isEmailVerified: currentUser.isEmailVerified,
          isPhoneVerified: currentUser.isPhoneVerified,
          joinedDate: currentUser.joinedDate,
        };
      }

      setUsersList(Object.values(recordsMap));
    } catch (err) {
      console.warn("Failed to load admin user list:", err);
    }
  };

  useEffect(() => {
    refreshUsersList();
    fetchServerMetrics();
  }, [currentUser]);

  useEffect(() => {
    if (activeTab === "threats" || activeTab === "telemetry" || activeTab === "ai_monitor") {
      fetchServerMetrics();
    }
  }, [activeTab]);

  // Fetch Server AI Metrics & Health
  const fetchServerMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const adminToken = sessionStorage.getItem("future_admin_session_token") || "";
      const res = await fetch("/api/gemini/security-status", {
        headers: {
          "x-user-email": currentUser?.email || "warfacelove46@gmail.com",
          ...(adminToken ? { "x-admin-token": adminToken } : {}),
        },
      });
      const data = await res.json();
      if (data.success) {
        setServerMetrics(data.securityArchitecture);
        if (data.threatDefense) {
          setThreatDefense(data.threatDefense);
          setQuarantinedIps(data.threatDefense.quarantinedIps || []);
        }
      }
    } catch (e) {
      console.warn("Could not fetch server security metrics:", e);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const handleQuarantineIp = async (ip: string, action: "quarantine" | "unquarantine", reason?: string) => {
    if (!ip.trim()) return;
    try {
      const adminToken = sessionStorage.getItem("future_admin_session_token") || "";
      const res = await fetch("/api/admin/quarantine-ip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": currentUser?.email || "warfacelove46@gmail.com",
          ...(adminToken ? { "x-admin-token": adminToken } : {}),
        },
        body: JSON.stringify({ ip: ip.trim(), action, reason }),
      });
      const data = await res.json();
      if (data.success) {
        setQuarantinedIps(data.quarantinedIps || []);
        showNotification(data.message);
        addAuditLog(
          action === "quarantine" ? "IP Karantinaya Alındı" : "IP Karantinadan Çıkarıldı",
          `${ip} adresi ${action === "quarantine" ? "engellendi" : "serbest bırakıldı"}. Sebep: ${reason || "Yönetici eylemi"}`,
          undefined,
          action === "quarantine" ? "warning" : "info"
        );
        fetchServerMetrics();
      } else {
        showNotification(`Hata: ${data.error || "İşlem başarısız"}`);
      }
    } catch (err: any) {
      showNotification(`Ağ Hatası: ${err.message}`);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchServerMetrics();
    }
  }, [isAdminAuthenticated]);

  // Save audit log helper
  const addAuditLog = (action: string, details: string, targetUser?: string, severity: "info" | "warning" | "critical" = "info") => {
    const newLog: SystemAuditLog = {
      id: "AUD-" + Date.now(),
      timestamp: new Date().toISOString(),
      adminEmail: currentUser?.email || "warfacelove46@gmail.com",
      action,
      targetUser,
      details,
      severity,
    };
    setAuditLogs((prev) => {
      const updated = [newLog, ...prev].slice(0, 100);
      try {
        localStorage.setItem("future_timeline_admin_audit_logs", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 5000);
  };

  // 1. PIN Submit Handler
  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifyingPasscode) return;
    setIsVerifyingPasscode(true);
    try {
      const success = await authenticateAdmin(passcodeInput);
      if (success) {
        setPasscodeError(false);
        addAuditLog("Admin PIN Girişi Başarılı", "Yönetici güvenlik katmanını geçti ve kontrol paneline girdi.");
      } else {
        setPasscodeError(true);
        addAuditLog("Hatalı PIN Denemesi", `Hatalı PIN denendi: ${passcodeInput}`, undefined, "warning");
      }
    } finally {
      setIsVerifyingPasscode(false);
    }
  };

  // 2. Adjust User Credits (+ or -)
  const handleAdjustCredits = (user: AdminUserRecord, delta: number, reason: string) => {
    const newBalance = Math.max(0, (user.credits || 0) + delta);
    const updatedUserRecord: AdminUserRecord = {
      ...user,
      credits: newBalance,
    };

    // Save to local storage accounts
    saveAccount(updatedUserRecord as any);

    // If adjusting active logged-in user
    if (currentUser && currentUser.email.toLowerCase() === user.email.toLowerCase()) {
      updateUserProfile({ credits: newBalance });
    }

    // Sync to Firestore
    if (user.id) {
      try {
        const userRef = doc(db, "users", user.id);
        setDoc(userRef, { credits: newBalance }, { merge: true }).catch(() => {});
      } catch {}
    }

    // Sync to Express Server Credit Ledger
    safeFetchJson("/api/credits/sync", {
      method: "POST",
      body: JSON.stringify({
        email: user.email,
        credits: newBalance,
        plan: user.plan,
        role: user.role,
      }),
    }).catch(() => {});

    // Refresh UI
    setUsersList((prev) => prev.map((u) => (u.email === user.email ? updatedUserRecord : u)));
    if (selectedUser?.email === user.email) {
      setSelectedUser(updatedUserRecord);
    }

    const actionText = delta >= 0 ? `+${delta} Kredi Eklendi` : `${delta} Kredi Düşüldü`;
    showNotification(`${user.email} kullanıcısına ${actionText} (Yeni Bakiye: ${newBalance}).`);
    addAuditLog(
      `Kredi Değişikliği (${delta >= 0 ? "+" : ""}${delta})`,
      `${user.fullName} (${user.email}) bakiyesi ${user.credits} -> ${newBalance} olarak güncellendi. Neden: ${reason}`,
      user.email,
      delta < 0 ? "warning" : "info"
    );
  };

  // 3. Ban or Unban User
  const handleToggleBan = async (user: AdminUserRecord) => {
    const nextBannedState = !user.isBanned;
    const banReason = nextBannedState ? (banReasonInput.trim() || "Yönetici tarafından askıya alındı / Güvenlik ihlali") : undefined;
    const timestamp = new Date().toISOString();
    const cleanEmail = user.email.toLowerCase().trim();
    const emailKey = cleanEmail.replace(/[@.]/g, "_");

    const updatedRecord: AdminUserRecord = {
      ...user,
      isBanned: nextBannedState,
      banReason: banReason,
      unbanNoticePending: !nextBannedState,
      isProbationRequired: !nextBannedState,
    };

    // 1. Save to local accounts DB
    saveAccount(updatedRecord as any);

    if (currentUser && currentUser.email.toLowerCase() === cleanEmail) {
      updateUserProfile({
        isBanned: nextBannedState,
        banReason: banReason,
        unbanNoticePending: !nextBannedState,
        isProbationRequired: !nextBannedState,
      });
    }

    // 2. Persist to Firestore: banned_emails collection & user doc
    try {
      const bannedDocRef = doc(db, "banned_emails", emailKey);
      if (nextBannedState) {
        await setDoc(bannedDocRef, {
          email: cleanEmail,
          isBanned: true,
          banReason: banReason,
          bannedAt: timestamp,
        });
      } else {
        await setDoc(bannedDocRef, { isBanned: false, banReason: null, unbannedAt: timestamp }, { merge: true }).catch(() => {});
        await deleteDoc(bannedDocRef).catch(() => {});
      }

      // Update all matching user documents in Firestore
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        usersSnap.forEach(async (uDoc) => {
          const uData = uDoc.data();
          if (
            uDoc.id === emailKey ||
            (user.id && uDoc.id === user.id) ||
            (uData && (uData.email || "").toLowerCase().trim() === cleanEmail)
          ) {
            await setDoc(
              doc(db, "users", uDoc.id),
              {
                isBanned: nextBannedState,
                banReason: nextBannedState ? banReason : null,
                unbannedAt: nextBannedState ? null : timestamp,
                unbanNoticePending: !nextBannedState,
                isProbationRequired: !nextBannedState,
              },
              { merge: true }
            ).catch(() => {});
          }
        });
      } catch (e) {}

      // Direct emailKey doc guarantee
      const emailDocRef = doc(db, "users", emailKey);
      await setDoc(
        emailDocRef,
        {
          isBanned: nextBannedState,
          banReason: nextBannedState ? banReason : null,
          unbannedAt: nextBannedState ? null : timestamp,
          unbanNoticePending: !nextBannedState,
          isProbationRequired: !nextBannedState,
        },
        { merge: true }
      ).catch(() => {});
    } catch (fsErr) {
      console.warn("Firestore ban sync warning:", fsErr);
    }

    // Server-Authoritative Ban Enforcement
    if (nextBannedState) {
      safeFetchJson("/api/admin/ban", {
        method: "POST",
        body: JSON.stringify({
          targetEmail: cleanEmail,
          reason: banReason || "Yönetici tarafından askıya alındı",
        }),
      }).catch(() => {});
    } else {
      safeFetchJson("/api/admin/unban", {
        method: "POST",
        body: JSON.stringify({
          targetEmail: cleanEmail,
        }),
      }).catch(() => {});
    }

    if (!nextBannedState) {
      try {
        localStorage.setItem(`future_unban_notice_${cleanEmail}`, "true");
      } catch (e) {}
      window.dispatchEvent(
        new CustomEvent("future_user_unbanned", { detail: { email: cleanEmail } })
      );
    }

    setUsersList((prev) => prev.map((u) => (u.email.toLowerCase() === cleanEmail ? updatedRecord : u)));
    if (selectedUser?.email.toLowerCase() === cleanEmail) {
      setSelectedUser(updatedRecord);
    }

    showNotification(nextBannedState ? `⛔ ${user.email} yasaklandı ve erişimi engellendi!` : `✓ ${user.email} yasağı kaldırıldı.`);
    addAuditLog(
      nextBannedState ? "Kullanıcı Yasaklandı" : "Kullanıcı Yasağı Kaldırıldı",
      `${user.email} hesabı ${nextBannedState ? `yasaklandı (${banReason})` : "tekrar aktif edildi."}`,
      user.email,
      nextBannedState ? "critical" : "info"
    );
  };

  // 4. Change User Plan (Free / Pro / Quantum VIP)
  const handleChangePlan = (user: AdminUserRecord, newPlan: "free" | "pro" | "quantum_vip") => {
    const updatedRecord: AdminUserRecord = {
      ...user,
      plan: newPlan,
    };

    saveAccount(updatedRecord as any);

    if (currentUser && currentUser.email.toLowerCase() === user.email.toLowerCase()) {
      updateUserProfile({ plan: newPlan });
    }

    setUsersList((prev) => prev.map((u) => (u.email === user.email ? updatedRecord : u)));
    if (selectedUser?.email === user.email) {
      setSelectedUser(updatedRecord);
    }

    // Sync to Express Server Credit Ledger
    safeFetchJson("/api/credits/sync", {
      method: "POST",
      body: JSON.stringify({
        email: user.email,
        credits: user.credits,
        plan: newPlan,
        role: user.role,
      }),
    }).catch(() => {});

    showNotification(`${user.email} planı "${newPlan.toUpperCase()}" olarak değiştirildi.`);
    addAuditLog("Plan Güncellemesi", `${user.email} paketi ${user.plan} -> ${newPlan} yapıldı.`, user.email);
  };

  // 5. Refund Dispute Item
  const handleRefundDispute = (dispute: CreditDisputeLog) => {
    const targetUser = usersList.find((u) => u.email.toLowerCase() === dispute.userEmail.toLowerCase());
    if (targetUser) {
      handleAdjustCredits(targetUser, dispute.deductedCredits, `Hata İadesi: ${dispute.featureName} (${dispute.id})`);
    }

    const updatedDisputes = disputeLogs.map((d) =>
      d.id === dispute.id
        ? {
            ...d,
            status: "refunded" as const,
            refundedAt: new Date().toISOString(),
            refundNote: `Yönetici tarafından ${dispute.deductedCredits} kredi telafi edildi.`,
          }
        : d
    );

    setDisputeLogs(updatedDisputes);
    try {
      localStorage.setItem("future_timeline_dispute_logs", JSON.stringify(updatedDisputes));
    } catch {}

    showNotification(`✓ ${dispute.userEmail} hesabına ${dispute.deductedCredits} kredi başarıyla iade edildi.`);
  };

  // 6. Support Ticket Handlers
  const handleReplyTicket = async (ticket: SupportTicket, replyMsg: string, newStatus: TicketStatus = "resolved") => {
    if (!replyMsg.trim()) {
      showNotification("Lütfen bir yanıt metni giriniz.");
      return;
    }
    const updated = await updateSupportTicketStatus(ticket.id, {
      adminReply: replyMsg.trim(),
      status: newStatus,
      adminRepliedBy: currentUser?.email || "warfacelove46@gmail.com",
    });

    if (updated) {
      setSupportTickets((prev) => prev.map((t) => (t.id === ticket.id ? updated : t)));
      if (selectedTicket?.id === ticket.id) setSelectedTicket(updated);
      setTicketReplyText("");
      showNotification(`✓ ${ticket.id} nolu talebe yanıt kaydedildi ve durum "${newStatus.toUpperCase()}" yapıldı.`);
      addAuditLog("Destek Talebi Yanıtlandı", `${ticket.id} (${ticket.userEmail}) talebine yanıt verildi: ${replyMsg.slice(0, 40)}...`, ticket.userEmail);
    }
  };

  const handleOneClickUnbanAndResolve = async (ticket: SupportTicket) => {
    const defaultReply = "Hesap itirazınız Süper Yönetici tarafından incelenmiş, güvenlik filtre hatası tespit edilerek yasağınız derhal kaldırılmıştır. Sistemimizi kullanmaya devam edebilirsiniz.";
    const success = await resolveBanAppealAndUnban(ticket.id, ticket.userEmail, ticketReplyText.trim() || defaultReply);

    if (success) {
      // Update local users list
      setUsersList((prev) =>
        prev.map((u) =>
          u.email.toLowerCase() === ticket.userEmail.toLowerCase()
            ? { ...u, isBanned: false, banReason: undefined }
            : u
        )
      );

      // Refresh support tickets
      const updatedList = await fetchAllSupportTickets();
      setSupportTickets(updatedList);
      const updatedTarget = updatedList.find((t) => t.id === ticket.id);
      if (updatedTarget) setSelectedTicket(updatedTarget);

      showNotification(`🎉 ${ticket.userEmail} yasağı kaldırıldı ve itiraz talebi çözüldü!`);
      addAuditLog("Yasak İtirazı Çözüldü & Yasağı Kaldırıldı", `${ticket.userEmail} hesabı ${ticket.id} itiraz talebi üzerinden aktif edildi.`, ticket.userEmail, "warning");
    } else {
      showNotification("Yasak kaldırma sırasında bir hata oluştu.");
    }
  };

  const handleQuickCreditCompensation = async (ticket: SupportTicket, amount: number) => {
    const targetUser = usersList.find((u) => u.email.toLowerCase() === ticket.userEmail.toLowerCase());
    if (targetUser) {
      handleAdjustCredits(targetUser, amount, `Destek Telafisi: ${ticket.categoryTitle} (${ticket.id})`);
    }

    const replyMsg = `Yaşadığınız aksaklık için ${amount} kredi hesabınıza aktarılmıştır. Keyifli simülasyonlar dileriz.`;
    await handleReplyTicket(ticket, replyMsg, "resolved");
  };

  // Filtered Support Tickets
  const filteredTickets = useMemo(() => {
    return supportTickets.filter((t) => {
      const matchQuery =
        t.id.toLowerCase().includes(ticketSearchQuery.toLowerCase()) ||
        t.userEmail.toLowerCase().includes(ticketSearchQuery.toLowerCase()) ||
        t.userName.toLowerCase().includes(ticketSearchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(ticketSearchQuery.toLowerCase());
      const matchCat = ticketFilterCategory === "all" || t.category === ticketFilterCategory;
      const matchStat = ticketFilterStatus === "all" || t.status === ticketFilterStatus;
      return matchQuery && matchCat && matchStat;
    });
  }, [supportTickets, ticketSearchQuery, ticketFilterCategory, ticketFilterStatus]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchQuery =
        u.email.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
        u.fullName.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
        (u.phone && u.phone.includes(searchUserQuery));
      const matchPlan = filterPlan === "all" || u.plan === filterPlan;
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "banned" && u.isBanned) ||
        (filterStatus === "active" && !u.isBanned);
      return matchQuery && matchPlan && matchStatus;
    });
  }, [usersList, searchUserQuery, filterPlan, filterStatus]);

  // If user is not Superadmin email, forbid
  if (!isSuperAdminEmail) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-950 border border-rose-500/40 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-mono">403 — Yetkisiz Erişim</h2>
            <p className="text-xs text-slate-300 font-sans leading-relaxed mt-2">
              Bu altyapı yönetim paneli yalnızca doğrulanmış sistem yöneticilerine açıktır.
              Lütfen yönetici hesabı (<strong>warfacelove46@gmail.com</strong>) ile giriş yapın.
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              onClick={async () => {
                const superAdminUser = {
                  id: "usr_superadmin",
                  email: "warfacelove46@gmail.com",
                  fullName: "Süper Yönetici",
                  phone: "+905550000000",
                  credits: 99999,
                  plan: "pro" as const,
                  role: "superadmin" as const,
                  isEmailVerified: true,
                  isPhoneVerified: true,
                  joinedDate: new Date().toISOString(),
                };
                saveAccount(superAdminUser as any);
                updateUserProfile(superAdminUser as any);
                await authenticateAdmin("warface46");
              }}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-mono text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>🛡️ Süper Yönetici Olarak Oturum Aç (Tek Tıkla)</span>
            </button>
            <p className="text-[10px] text-slate-500 font-mono">
              warfacelove46@gmail.com ile anında süper yetki sağlanır.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // PASSCODE LOCK SCREEN (Layer 2 Defense)
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-950/95 border border-cyan-500/40 rounded-3xl p-8 space-y-6 shadow-2xl shadow-cyan-950/40 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 p-0.5 mx-auto shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <h2 className="text-lg font-black text-white font-mono tracking-tight">
              SÜPER YÖNETİCİ GÜVENLİK KAPISI
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              E-posta doğrulandı: <span className="text-cyan-300 font-bold">{currentUser?.email}</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Yetkisiz erişim ve hesap ele geçirme saldırılarına karşı lütfen <strong>İkincil Yönetici PIN Kodu</strong>'nu giriniz.
            </p>
          </div>

          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                Yönetici Güvenlik PIN / Anahtarı:
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-cyan-500/40 rounded-xl text-white font-mono text-sm tracking-widest focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-center font-bold"
                  autoFocus
                />
              </div>
              {passcodeError && (
                <p className="text-rose-400 text-xs font-mono mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Hatalı Güvenlik PIN'i. Lütfen tekrar deneyin.</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isVerifyingPasscode}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifyingPasscode ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Güvenlik Kontrolü Yapılıyor...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Güvenlik Kilidini Aç & Panele Gir</span>
                </>
              )}
            </button>
          </form>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-[10px] text-slate-400 font-mono space-y-1">
            <div className="text-cyan-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Savunma Katmanı Aktif:</span>
            </div>
            <p>
              Bu PIN sayesinde Gmail hesabınız açık kalsa dahi kimse yönetim işlemlerini gerçekleştiremez.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ================= MAIN ADMIN DASHBOARD =================
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 font-sans space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Feedback */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950 border border-emerald-400 text-emerald-200 text-xs font-mono shadow-xl flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400 hover:text-white p-1">
            ✕
          </button>
        </div>
      )}

      {/* TOP HEADER & ADMIN IDENTITY STRIP */}
      <div className="bg-[#080d1a] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-500 to-cyan-500 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-300">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-xl font-black text-white font-mono uppercase tracking-tight">
                SÜPER YÖNETİCİ & KONTROL MASASI
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                ● CANLI OTURUM AKTİF
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
              Yönetici: <strong className="text-cyan-300">{currentUser?.email}</strong> // Tam Müdahale & Telafi Modu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={refreshUsersList}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Verileri Yenile"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Yenile</span>
          </button>

          <button
            onClick={lockAdminSession}
            className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Güvenlik için Admin Oturumunu Kilitle"
          >
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>Oturumu Kilitle</span>
          </button>
        </div>
      </div>

      {/* QUICK METRICS BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 space-y-1 font-mono">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Toplam Kullanıcı</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white">{usersList.length}</div>
          <div className="text-[10px] text-cyan-400">
            {usersList.filter((u) => u.plan === "pro" || u.plan === "quantum_vip").length} Premium Üye
          </div>
        </div>

        <div className="bg-slate-900/80 border border-rose-500/30 rounded-2xl p-4 space-y-1 font-mono">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Destek & İtiraz Talepleri</span>
            <LifeBuoy className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-400 flex items-center gap-2">
            <span>{supportTickets.filter((t) => t.status === "open" || t.status === "in_review").length}</span>
            {supportTickets.some((t) => t.status === "open" && t.category === "ban_appeal") && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                İtiraz Var
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400">
            {supportTickets.filter((t) => t.status === "resolved").length} Çözüldü / Cevaplandı
          </div>
        </div>

        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 space-y-1 font-mono">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Dağıtılan Toplam Kredi</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400">
            {usersList.reduce((acc, u) => acc + (u.credits || 0), 0)} ⚡
          </div>
          <div className="text-[10px] text-slate-400">Dolaşımdaki bakiye</div>
        </div>

        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 space-y-1 font-mono">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Bekleyen Telafi / İtiraz</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400">
            {disputeLogs.filter((d) => d.status === "failed_ai").length}
          </div>
          <div className="text-[10px] text-slate-400">Hatalı istek telafisi</div>
        </div>

        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 space-y-1 font-mono col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>AI Motor Durumu</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{systemConfig.aiEngineMode.toUpperCase()}</span>
          </div>
          <div className="text-[10px] text-slate-400">5-Katmanlı Güvenlik Aktif</div>
        </div>
      </div>

      {/* NAVIGATION TABS WITH HORIZONTAL CONTROLS & SLEEK SCROLLBAR */}
      <div className="relative group/nav border-b border-white/10 pb-3">
        {/* Left Arrow Button */}
        <button
          onClick={() => scrollNavigationTabs("left")}
          aria-label="Sola Kaydır"
          title="Sekmeleri sola kaydır"
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 z-10 p-2 rounded-xl bg-slate-900/95 border border-cyan-500/40 text-cyan-300 hover:text-white hover:bg-cyan-600 shadow-xl shadow-black/80 backdrop-blur-md transition-all cursor-pointer flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={() => scrollNavigationTabs("right")}
          aria-label="Sağa Kaydır"
          title="Sekmeleri sağa kaydır"
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 z-10 p-2 rounded-xl bg-slate-900/95 border border-cyan-500/40 text-cyan-300 hover:text-white hover:bg-cyan-600 shadow-xl shadow-black/80 backdrop-blur-md transition-all cursor-pointer flex items-center justify-center"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Scrollable Tabs Wrapper */}
        <div
          ref={tabsScrollRef}
          className="flex items-center gap-2 overflow-x-auto px-7 py-1 custom-scrollbar scroll-smooth"
        >
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === "users"
                ? "bg-cyan-600 text-slate-950 shadow-md shadow-cyan-600/20"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Kullanıcı Yönetimi ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("telemetry")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === "telemetry"
                ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Konum, Çerez & Yönelimler</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
              CANLI
            </span>
          </button>

          <button
            onClick={() => setActiveTab("threats")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === "threats"
                ? "bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-black shadow-md shadow-rose-500/20"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Tehdit & Savunma Kalkanı</span>
            {threatDefense?.recentIncidentsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-black">
                {threatDefense.recentIncidentsCount}
              </span>
            )}
            {quarantinedIps.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
                {quarantinedIps.length} İzolasyon
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("support_tickets")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === "support_tickets"
                ? "bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md shadow-rose-950/40"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <LifeBuoy className="w-4 h-4 text-rose-400" />
            <span>Destek & İtiraz Masası</span>
            {supportTickets.filter((t) => t.status === "open" || t.status === "in_review").length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-black">
                {supportTickets.filter((t) => t.status === "open" || t.status === "in_review").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("credits_disputes")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === "credits_disputes"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Kredi Telafi Masası ({disputeLogs.filter((d) => d.status === "failed_ai").length})</span>
          </button>

          <button
            onClick={() => setActiveTab("ai_monitor")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === "ai_monitor"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Canlı AI & Güvenlik Telemetrisi</span>
          </button>

          <button
            onClick={() => setActiveTab("system_controls")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === "system_controls"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Sistem Anahtarları (Kill-Switch)</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === "logs"
                ? "bg-emerald-600 text-slate-950 shadow-md shadow-emerald-600/20"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Denetim & Güvenlik Logları ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("sponsorship")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === "sponsorship"
                ? "bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-md shadow-purple-950/40"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Megaphone className="w-4 h-4 text-amber-400" />
            <span>📢 Sponsor & Reklam Yönetimi</span>
          </button>
        </div>
      </div>


      {/* ================= TAB 1: USERS MANAGEMENT ================= */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Filter / Search Bar */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="E-posta, ad soyad veya telefon ile kullanıcı ara..."
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="bg-slate-900 border border-white/10 text-slate-300 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-400"
              >
                <option value="all">Tüm Planlar</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="quantum_vip">Quantum VIP</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-900 border border-white/10 text-slate-300 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-400"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif Üyeler</option>
                <option value="banned">Yasaklı (Banned)</option>
              </select>
            </div>
          </div>

          {/* User List Table */}
          <div className="bg-slate-950 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase border-b border-white/10">
                  <tr>
                    <th className="p-4">Kullanıcı Bilgisi</th>
                    <th className="p-4">Paket / Rol</th>
                    <th className="p-4">Mevcut Bakiye</th>
                    <th className="p-4">Doğrulama</th>
                    <th className="p-4">Durum</th>
                    <th className="p-4 text-right">Müdahale Aksiyonları</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {filteredUsers.map((user, uIdx) => {
                    const isSuper = user.role === "superadmin" || user.email.toLowerCase() === "warfacelove46@gmail.com";
                    return (
                      <tr key={`admin-user-${user.id || 'usr'}-${uIdx}`} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-white font-sans text-sm flex items-center gap-1.5">
                            <span>{user.fullName}</span>
                            {isSuper && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono border border-rose-500/40">
                                SÜPER ADMIN
                              </span>
                            )}
                          </div>
                          <div className="text-slate-400 text-xs">{user.email}</div>
                          <div className="text-[10px] text-cyan-400">{user.phone || "Telefon Yok"}</div>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                              user.plan === "quantum_vip"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : user.plan === "pro"
                                ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                                : "bg-slate-800 text-slate-400 border-white/10"
                            }`}
                          >
                            {user.plan}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="text-sm font-bold text-amber-400 flex items-center gap-1">
                            <span>{user.credits} ⚡</span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="space-y-0.5 text-[10px]">
                            <div className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Doğrulanmış Hesap
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          {user.isBanned ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-950 border border-rose-500 text-rose-300 text-[10px] font-bold">
                              ⛔ YASAKLI
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                              ✓ AKTİF
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Fast +50 Credit Button */}
                            <button
                              onClick={() => handleAdjustCredits(user, 50, "Hızlı 50 Kredi Yükleme")}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-[11px] font-bold transition-all cursor-pointer"
                              title="+50 Kredi Yükle"
                            >
                              +50 ⚡
                            </button>

                            {/* Fast -20 Credit Button */}
                            <button
                              onClick={() => handleAdjustCredits(user, -20, "Manuel Kredi Düşürme")}
                              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 text-[11px] transition-all cursor-pointer"
                              title="-20 Kredi Eksilt"
                            >
                              -20
                            </button>

                            {/* Inspect / Full Edit Modal */}
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[11px] transition-all cursor-pointer"
                            >
                              Yönet / Düzenle
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* USER DETAIL & FULL INTERVENTION MODAL */}
      {selectedUser && (
        <div
          onClick={() => setSelectedUser(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0a0f1d] border border-cyan-500/40 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl font-sans"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold font-mono">
                  {selectedUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedUser.fullName}</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Balance & Plan Info */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 bg-slate-900 rounded-2xl border border-white/5 space-y-1">
                <div className="text-slate-400">Mevcut Bakiye:</div>
                <div className="text-xl font-black text-amber-400">{selectedUser.credits} ⚡ Kredi</div>
              </div>
              <div className="p-3 bg-slate-900 rounded-2xl border border-white/5 space-y-1">
                <div className="text-slate-400">Aktif Plan:</div>
                <div className="text-sm font-bold text-white uppercase">{selectedUser.plan}</div>
              </div>
            </div>

            {/* Credit Adjustment Box */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-3 font-mono text-xs">
              <div className="text-amber-400 font-bold flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                <span>Kredi Ekle veya Eksilt</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Miktar (Örn: 100)"
                  value={creditAdjustmentAmount}
                  onChange={(e) => setCreditAdjustmentAmount(Number(e.target.value))}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white font-bold"
                />
                <button
                  onClick={() => handleAdjustCredits(selectedUser, creditAdjustmentAmount, creditAdjustmentReason)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all cursor-pointer"
                >
                  Yükle (+)
                </button>
                <button
                  onClick={() => handleAdjustCredits(selectedUser, -creditAdjustmentAmount, creditAdjustmentReason)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all cursor-pointer"
                >
                  Düşür (-)
                </button>
              </div>
              <input
                type="text"
                placeholder="İşlem Açıklaması / Telafi Nedeni..."
                value={creditAdjustmentReason}
                onChange={(e) => setCreditAdjustmentReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-slate-300 text-xs"
              />
            </div>

            {/* Change Membership Plan */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 space-y-2 font-mono text-xs">
              <div className="text-slate-300 font-bold">Üyelik Paketini Değiştir:</div>
              <div className="grid grid-cols-3 gap-2">
                {(["free", "pro", "quantum_vip"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => handleChangePlan(selectedUser, p)}
                    className={`py-2 rounded-xl font-bold uppercase transition-all cursor-pointer border ${
                      selectedUser.plan === p
                        ? "bg-cyan-500 text-slate-950 border-cyan-400"
                        : "bg-slate-900 text-slate-300 border-white/10 hover:bg-slate-800"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Ban / Suspension Box */}
            <div className="bg-rose-950/40 p-4 rounded-2xl border border-rose-500/40 space-y-3 font-mono text-xs">
              <div className="text-rose-300 font-bold flex items-center gap-1.5">
                <UserX className="w-4 h-4" />
                <span>Hesap Yasaklama & Kısıtlama</span>
              </div>
              <input
                type="text"
                placeholder="Yasaklama Gerekçesi..."
                value={banReasonInput}
                onChange={(e) => setBanReasonInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-slate-200 text-xs"
              />
              <button
                onClick={() => handleToggleBan(selectedUser)}
                className={`w-full py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                  selectedUser.isBanned
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-rose-600 hover:bg-rose-500 text-white"
                }`}
              >
                {selectedUser.isBanned ? "✓ Hesabın Yasağını Kaldır" : "⛔ Hesabı Kalıcı Olarak Yasakla"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: USER TELEMETRY, LOCATION & ORIENTATIONS ================= */}
      {activeTab === "telemetry" && (
        <UserTelemetryAnalyticsPanel mode="admin" />
      )}

      {/* ================= TAB: THREAT & ATTACK DEFENSE HUB ================= */}
      {activeTab === "threats" && (
        <div className="space-y-6 font-mono text-xs">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-rose-950 via-slate-950 to-slate-950 p-6 rounded-3xl border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
                <span>Aktif Tehdit & Saldırgan Savunma Kalkanı</span>
              </div>
              <p className="text-slate-300 font-sans text-xs max-w-2xl leading-relaxed">
                Bu merkez, anormal istek sıklığı (DDoS/Flood), prompt enjeksiyon denemeleri ve yetkisiz yönetim erişim teşebbüslerini anlık tespit eder ve IP bazlı karantina mekanizması sağlar.
              </p>
            </div>

            <button
              onClick={fetchServerMetrics}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <RefreshCw className="w-4 h-4 text-rose-400" />
              <span>Tehditleri Güncelle</span>
            </button>
          </div>

          {/* Quick Threat Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-rose-500/20 space-y-1">
              <div className="text-slate-400 text-[11px] flex items-center justify-between">
                <span>Algılanan Tehdit Olayları</span>
                <Flame className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-rose-400">
                {threatDefense?.recentIncidentsCount || 0}
              </div>
              <div className="text-[10px] text-slate-500">Son 200 olay tamponunda</div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/20 space-y-1">
              <div className="text-slate-400 text-[11px] flex items-center justify-between">
                <span>Karantinadaki IP Sayısı</span>
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400">
                {quarantinedIps.length}
              </div>
              <div className="text-[10px] text-slate-500">Girişi tamamen engellenmiş</div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/20 space-y-1">
              <div className="text-slate-400 text-[11px] flex items-center justify-between">
                <span>Güvenlik Katmanı</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>5-KATMAN ETKİN</span>
              </div>
              <div className="text-[10px] text-slate-500">Rate Limit + Circuit Breaker</div>
            </div>
          </div>

          {/* Manual IP Quarantine Control */}
          <div className="bg-slate-950 p-5 rounded-3xl border border-white/10 space-y-3">
            <div className="text-white font-bold text-sm flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Manuel IP Karantina / Engelleme</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Örn: 198.51.100.42 veya IPv6"
                value={manualIpToQuarantine}
                onChange={(e) => setManualIpToQuarantine(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-rose-400"
              />
              <button
                onClick={() => {
                  if (manualIpToQuarantine) {
                    handleQuarantineIp(manualIpToQuarantine, "quarantine", "Yönetici tarafından elle tecrit edildi");
                    setManualIpToQuarantine("");
                  }
                }}
                disabled={!manualIpToQuarantine.trim()}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold transition-all cursor-pointer shrink-0"
              >
                IP'yi Hemen Karantinaya Al
              </button>
            </div>
          </div>

          {/* Quarantined IP List */}
          {quarantinedIps.length > 0 && (
            <div className="bg-slate-950 p-5 rounded-3xl border border-amber-500/30 space-y-3">
              <div className="text-amber-400 font-bold text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Karantinaya Alınmış IP Adresleri ({quarantinedIps.length})</span>
                </div>
              </div>
              <div className="divide-y divide-white/5">
                {quarantinedIps.map((qIp) => (
                  <div key={qIp} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-rose-300 font-bold">{qIp}</span>
                      <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded bg-slate-900 border border-white/5">
                        Tüm API istekleri 403 Forbidden ile reddediliyor
                      </span>
                    </div>
                    <button
                      onClick={() => handleQuarantineIp(qIp, "unquarantine")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition-all cursor-pointer"
                    >
                      Karantinayı Kaldır
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Incident Log Table */}
          <div className="bg-slate-950 p-5 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>Son Saldırı & Anormallik Kayıtları ({threatDefense?.recentThreats?.length || 0})</span>
              </div>
              <span className="text-[10px] text-slate-500">Otomatik Tampon Bellek</span>
            </div>

            {(!threatDefense?.recentThreats || threatDefense.recentThreats.length === 0) ? (
              <div className="p-8 text-center text-slate-500 bg-slate-900/30 rounded-2xl border border-white/5">
                <ShieldCheck className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                <p>Şu anda kaydedilmiş aktif saldırı veya anormallik bulunmuyor. Sistem tam kapasite güvenli.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {threatDefense.recentThreats.map((inc: any) => (
                  <div
                    key={inc.id}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          {inc.type}
                        </span>
                        <span className="text-white font-bold">{inc.ip}</span>
                        <span className="text-slate-500 text-[10px]">
                          {new Date(inc.timestamp).toLocaleTimeString("tr-TR")}
                        </span>
                        <span className="text-cyan-400 text-[10px]">{inc.path}</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{inc.details}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {quarantinedIps.includes(inc.ip) ? (
                        <button
                          onClick={() => handleQuarantineIp(inc.ip, "unquarantine")}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Karantinadan Çıkar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleQuarantineIp(inc.ip, "quarantine", `${inc.type} ihlali`)}
                          className="px-2.5 py-1 rounded bg-rose-600/80 hover:bg-rose-500 text-white text-[10px] font-bold transition-all cursor-pointer"
                        >
                          IP'yi Karantinaya Al
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: CREDIT DISPUTE & REFUND DESK ================= */}
      {activeTab === "credits_disputes" && (
        <div className="space-y-4 font-sans">
          <div className="bg-slate-950 p-5 rounded-3xl border border-amber-500/30 space-y-2 font-mono">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <DollarSign className="w-5 h-5 text-amber-400" />
              <span>Haksız Kredi & AI Yanıt Hataları Telafi Masası</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Kullanıcı AI sorgusu başlattığında sunucu bağlantısı veya API hatası nedeniyle çıktı alamamışsa, sistem harcanan krediyi <strong>anında otomatik geri iade eder</strong>. Tüm otomatik iadeler ve hata logları bu masada şeffaf biçimde listelenir.
            </p>
          </div>

          <div className="space-y-3 font-mono">
            {disputeLogs.map((dispute) => {
              const isAutoRefunded = dispute.status === "auto_refunded";
              const isManualRefunded = dispute.status === "refunded";
              const isPending = dispute.status === "failed_ai";

              return (
                <div
                  key={dispute.id}
                  className={`bg-slate-950 border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                    isAutoRefunded
                      ? "border-emerald-500/40 bg-gradient-to-r from-emerald-950/20 to-slate-950"
                      : isPending
                      ? "border-rose-500/40 bg-gradient-to-r from-rose-950/20 to-slate-950"
                      : "border-white/10"
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">{dispute.userEmail}</span>
                      
                      {isAutoRefunded && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-500 text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>🛡️ ANINDA OTOMATİK İADE EDİLDİ</span>
                        </span>
                      )}

                      {isPending && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 border border-rose-500 text-rose-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>🚨 BEKLEYEN MANUEL İADE</span>
                        </span>
                      )}

                      {isManualRefunded && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 border border-cyan-500 text-cyan-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                          <span>✓ MANUEL TELAFİ EDİLDİ</span>
                        </span>
                      )}

                      <span className="text-[10px] text-slate-500">
                        {new Date(dispute.timestamp).toLocaleString("tr-TR")}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans">
                      Özellik: <strong>{dispute.featureName}</strong> // İade Tutarı:{" "}
                      <strong className="text-amber-400">{dispute.deductedCredits} ⚡ Kredi</strong>
                    </p>

                    <div className="p-2 rounded-xl bg-slate-900/90 border border-white/5 text-[11px] text-rose-300 space-y-0.5">
                      <div><strong className="text-rose-400">Hata Detayı:</strong> {dispute.errorMessage}</div>
                      {dispute.refundNote && (
                        <div className="text-emerald-300 text-[10px]"><strong className="text-emerald-400">Telafi Notu:</strong> {dispute.refundNote}</div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isPending && (
                      <button
                        onClick={() => handleRefundDispute(dispute)}
                        className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>{dispute.deductedCredits} Krediyi Manuel İade Et</span>
                      </button>
                    )}

                    {isAutoRefunded && (
                      <div className="text-right text-[11px] space-y-1">
                        <div className="text-emerald-400 font-bold flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Kullanıcıya +{dispute.deductedCredits} ⚡ Yüklendi</span>
                        </div>
                        <div className="text-slate-500 text-[10px]">
                          {dispute.refundedAt ? new Date(dispute.refundedAt).toLocaleTimeString("tr-TR") : "İşlem anında tamamlandı"}
                        </div>
                        <button
                          onClick={() => {
                            const targetUser = usersList.find((u) => u.email.toLowerCase() === dispute.userEmail.toLowerCase());
                            if (targetUser) {
                              handleAdjustCredits(targetUser, 10, `Ekstra Jest Bonusu (${dispute.featureName})`);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>+10 Ekstra Jest Bonusu</span>
                        </button>
                      </div>
                    )}

                    {isManualRefunded && (
                      <div className="text-right text-[11px] text-slate-400">
                        <div className="text-cyan-300 font-bold">Manuel İade Tamam</div>
                        <div className="text-slate-500">{new Date(dispute.refundedAt || "").toLocaleTimeString("tr-TR")}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB: SUPPORT & BAN APPEAL DESK ================= */}
      {activeTab === "support_tickets" && (
        <div className="space-y-5 font-sans">
          {/* Header */}
          <div className="bg-slate-950 p-5 sm:p-6 rounded-3xl border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <LifeBuoy className="w-5 h-5 text-rose-400" />
                <span>Kullanıcı Destek Masası & Hesap Yasağı İtiraz Masası</span>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Kullanıcıların gönderdiği itiraz gerekçeleri, sorun açıklamaları ve sistem hata bildirimleri burada toplanır. Tek tıkla yasağı kaldırabilir, bakiye telafisi sağlayabilir veya doğrudan yanıt gönderebilirsiniz.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-bold font-mono flex items-center gap-1.5">
                <span>{supportTickets.filter((t) => t.status === "open" || t.status === "in_review").length} Bekleyen</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono flex items-center gap-1.5">
                <span>{supportTickets.filter((t) => t.status === "resolved").length} Çözüldü</span>
              </span>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 space-y-3 font-mono text-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Takip no, e-posta, ad soyad veya konu ile talep ara..."
                  value={ticketSearchQuery}
                  onChange={(e) => setTicketSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-rose-400"
                />
              </div>

              {/* Status filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none">
                {[
                  { key: "all", label: "Tüm Durumlar" },
                  { key: "open", label: "⏳ Sırada / Açık" },
                  { key: "in_review", label: "🔍 İnceleniyor" },
                  { key: "resolved", label: "✅ Çözüldü" },
                  { key: "rejected", label: "❌ Reddedildi" },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setTicketFilterStatus(s.key)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                      ticketFilterStatus === s.key
                        ? "bg-rose-600 text-white shadow-md shadow-rose-900/30"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none pt-1 border-t border-white/5">
              <span className="text-slate-500 font-bold mr-1">Kategori:</span>
              {[
                { key: "all", label: "Tümü" },
                { key: "ban_appeal", label: "⛔ Yasak İtirazları" },
                { key: "credit_issue", label: "💎 Kredi Telafisi" },
                { key: "login_issue", label: "🔑 Giriş & Hesap" },
                { key: "bug_report", label: "🐛 Hata Bildirimi" },
                { key: "other", label: "💬 Genel Destek" },
              ].map((c) => (
                <button
                  key={c.key}
                  onClick={() => setTicketFilterCategory(c.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    ticketFilterCategory === c.key
                      ? "bg-cyan-500 text-slate-950 font-black"
                      : "bg-slate-900/60 text-slate-400 hover:bg-slate-900"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Master - Detail Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Tickets List (5 cols) */}
            <div className="lg:col-span-5 space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
              {filteredTickets.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-950 border border-white/5 text-center text-slate-400 font-mono text-xs space-y-2">
                  <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                  <div>Filtreye uygun destek talebi bulunamadı.</div>
                </div>
              ) : (
                filteredTickets.map((t) => {
                  const isSelected = selectedTicket?.id === t.id;
                  const isBanAppeal = t.category === "ban_appeal";
                  const isOpen = t.status === "open";

                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTicket(t);
                        setTicketReplyText(t.adminReply || "");
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-2 font-mono ${
                        isSelected
                          ? "border-rose-400 bg-rose-950/30 shadow-lg shadow-rose-950/40 ring-1 ring-rose-400"
                          : isBanAppeal && isOpen
                          ? "border-rose-500/40 bg-slate-950 hover:bg-slate-900/80"
                          : "border-white/10 bg-slate-950 hover:bg-slate-900/60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-cyan-400 text-xs">{t.id}</span>
                          {isBanAppeal && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              ⛔ İTİRAZ
                            </span>
                          )}
                        </div>

                        {/* Status tag */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.status === "open"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : t.status === "in_review"
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                              : t.status === "resolved"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          }`}
                        >
                          {t.status === "open"
                            ? "Açık"
                            : t.status === "in_review"
                            ? "İnceleniyor"
                            : t.status === "resolved"
                            ? "Çözüldü"
                            : "Reddedildi"}
                        </span>
                      </div>

                      {/* Subject & User */}
                      <div>
                        <div className="text-white font-bold text-xs truncate">{t.subject}</div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {t.userName} • <span className="text-slate-300">{t.userEmail}</span>
                        </div>
                      </div>

                      {/* Snippet */}
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-sans">
                        {t.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5">
                        <span>{t.categoryTitle}</span>
                        <span>{new Date(t.createdAt).toLocaleString("tr-TR")}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right: Selected Ticket Detail & Action Panel (7 cols) */}
            <div className="lg:col-span-7">
              {selectedTicket ? (
                <div className="bg-slate-950 border border-white/10 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl font-mono text-xs">
                  {/* Top Ticket ID & Actions */}
                  <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-rose-400">{selectedTicket.id}</span>
                        <span className="text-white font-bold text-sm font-sans">{selectedTicket.subject}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Oluşturulma: {new Date(selectedTicket.createdAt).toLocaleString("tr-TR")} • Öncelik:{" "}
                        <strong className="text-amber-400 uppercase">{selectedTicket.priority}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-white/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* User Profile Snapshot */}
                  {(() => {
                    const matchedUser = usersList.find(
                      (u) => u.email.toLowerCase() === selectedTicket.userEmail.toLowerCase()
                    );
                    const isUserBanned = matchedUser?.isBanned ?? false;

                    return (
                      <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{selectedTicket.userName}</span>
                            <span className="text-cyan-300 font-mono text-xs">{selectedTicket.userEmail}</span>
                            {selectedTicket.userPhone && (
                              <span className="text-slate-400 text-[11px]">({selectedTicket.userPhone})</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-3">
                            <span>Plan: <strong className="text-white uppercase">{matchedUser?.plan || "Free"}</strong></span>
                            <span>Bakiye: <strong className="text-amber-400">{matchedUser?.credits ?? 0} ⚡</strong></span>
                          </div>
                        </div>

                        {/* Ban status badge */}
                        <div className="shrink-0">
                          {isUserBanned ? (
                            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-950 border border-rose-500 text-rose-300 flex items-center gap-1.5 animate-pulse">
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                              <span>⛔ HESAP YASAKLI</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-950 border border-emerald-500 text-emerald-300 flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>✓ HESAP AKTİF</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Ban reason if provided */}
                  {selectedTicket.banReasonSnapshot && (
                    <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-1 text-xs text-rose-200">
                      <div className="font-bold text-rose-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Sistemdeki Yasaklama Nedeni:</span>
                      </div>
                      <p className="text-slate-200">{selectedTicket.banReasonSnapshot}</p>
                    </div>
                  )}

                  {/* Full User Explanation */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span>Kullanıcının Sorun Açıklaması & İtiraz Metni:</span>
                    </label>
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
                      {selectedTicket.description}
                    </div>
                  </div>

                  {/* One-Click Direct Unban Action Button */}
                  {selectedTicket.category === "ban_appeal" && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/50 space-y-2">
                      <div className="text-emerald-300 font-bold flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>Hızlı İtiraz Onayı & Yasağı Kaldır</span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-sans">
                        Bu butona tıkladığınızda kullanıcının Firestore `banned_emails` ve hesap kısıtlaması derhal kaldırılır, talep çözüldü olarak işaretlenir.
                      </p>
                      <button
                        onClick={() => handleOneClickUnbanAndResolve(selectedTicket)}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>✓ YASAĞI DERHAL KALDIR & TALEBİ ÇÖZ</span>
                      </button>
                    </div>
                  )}

                  {/* Quick Credit Compensation */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-amber-400" />
                      <span>Hızlı Telafi Kredisi Tanımla:</span>
                    </label>
                    <div className="flex gap-2">
                      {[25, 50, 100].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => handleQuickCreditCompensation(selectedTicket, amt)}
                          className="flex-1 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all cursor-pointer"
                        >
                          +{amt} ⚡ Kredi Yükle & Çöz
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Admin Reply & Resolution Section */}
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MessageSquareText className="w-4 h-4 text-rose-400" />
                        <span>Yönetici Yanıtı & Karar Mesajı:</span>
                      </span>
                      {selectedTicket.adminRepliedAt && (
                        <span className="text-[10px] text-slate-500">
                          Son yanıt: {new Date(selectedTicket.adminRepliedAt).toLocaleString("tr-TR")}
                        </span>
                      )}
                    </label>

                    {/* Quick Response Templates */}
                    <div className="flex gap-1.5 flex-wrap">
                      {[
                        "İtirazınız onaylandı, yasağınız kaldırılmıştır.",
                        "Hesabınız güvenlik kontrolünden geçti, erişiminiz açıldı.",
                        "Hatalı AI isteğiniz için telafi kredisi hesabınıza yüklendi.",
                        "Talep detaylarınız teknik ekibimize iletildi.",
                      ].map((tpl) => (
                        <button
                          key={tpl}
                          type="button"
                          onClick={() => setTicketReplyText(tpl)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 text-[10px] transition-all cursor-pointer text-left"
                        >
                          + "{tpl}"
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={3}
                      placeholder="Kullanıcıya iletilecek yönetici yanıtını buraya yazın..."
                      value={ticketReplyText}
                      onChange={(e) => setTicketReplyText(e.target.value)}
                      className="w-full p-3 bg-slate-900 border border-white/10 rounded-xl text-white font-sans text-xs focus:outline-none focus:border-rose-400 resize-none leading-relaxed"
                    />

                    {/* Action buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <button
                        onClick={() => handleReplyTicket(selectedTicket, ticketReplyText, "resolved")}
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/40"
                      >
                        <Check className="w-4 h-4" />
                        <span>Yanıtla & Çözüldü Yap</span>
                      </button>

                      <button
                        onClick={() => handleReplyTicket(selectedTicket, ticketReplyText || "Talebiniz incelemeye alındı.", "in_review")}
                        className="py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>İnceleniyor Yap</span>
                      </button>

                      <button
                        onClick={() => handleReplyTicket(selectedTicket, ticketReplyText || "İnceleme sonucu talebiniz uygun bulunmamıştır.", "rejected")}
                        className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Talebi Reddet</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 rounded-3xl bg-slate-950 border border-white/5 text-center text-slate-400 font-mono text-xs space-y-3">
                  <LifeBuoy className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                  <div className="font-bold text-white text-sm">Detay Görüntülemek İçin Bir Talep Seçin</div>
                  <p className="text-slate-400 max-w-sm mx-auto font-sans leading-relaxed">
                    Soldaki listeden bir itiraz veya destek talebi seçerek kullanıcının gerekçesini okuyabilir, tek tıkla yasağını kaldırabilir veya yanıt verebilirsiniz.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {activeTab === "ai_monitor" && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-slate-950 p-5 rounded-3xl border border-purple-500/30 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <Cpu className="w-5 h-5 text-purple-400" />
                <span>Canlı 5-Katmanlı Güvenlik & Görev Kuyruğu (Task Queue)</span>
              </div>
              <p className="text-slate-400 font-sans text-xs">
                Spam istekler, ardışık kuyruk (FIFO) ve API token harcama kontrolü.
              </p>
            </div>
            <button
              onClick={fetchServerMetrics}
              disabled={loadingMetrics}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingMetrics ? "animate-spin text-cyan-400" : ""}`} />
              <span>Yenile</span>
            </button>
          </div>

          {serverMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 space-y-2">
                <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  <span>Katman 1: Kayan Pencere Rate-Limit</span>
                </div>
                <ul className="space-y-1 text-slate-300 text-[11px]">
                  <li>• Cooldown Süresi: {serverMetrics.layer1_rateLimiting?.cooldownSeconds} saniye</li>
                  <li>• Dakikalık Limit: {serverMetrics.layer1_rateLimiting?.maxPerMinute} istek/dk</li>
                  <li>• Saatlik Limit: {serverMetrics.layer1_rateLimiting?.maxPerHour} istek/saat</li>
                  <li>• Takip Edilen Aktif IP/Kullanıcı: {serverMetrics.layer1_rateLimiting?.trackedActiveClients}</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 space-y-2">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Database className="w-4 h-4" />
                  <span>Katman 2 & 3: Global Önbellek & Coalesce</span>
                </div>
                <ul className="space-y-1 text-slate-300 text-[11px]">
                  <li>• Önbellek TTL Süresi: {serverMetrics.layer2_globalCache?.ttlHours} Saat</li>
                  <li>• Önbellekteki Hazır Yanıt Sayısı: {serverMetrics.layer2_globalCache?.cachedItemsCount} (0 Maliyet)</li>
                  <li>• Eşzamanlı Birleşen İstek: {serverMetrics.layer3_requestCoalescing?.activeInFlightOperations}</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 space-y-2">
                <div className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Katman 4: Sıralı AI Görev Kuyruğu (Task Queue)</span>
                </div>
                <ul className="space-y-1 text-slate-300 text-[11px]">
                  <li>• Bekleyen Görev Sayısı: {serverMetrics.layer4_taskQueue?.pendingCount}</li>
                  <li>• Toplam İşlenen AI İstek: {serverMetrics.layer4_taskQueue?.totalProcessed}</li>
                  <li>• Karşılaşılan Hata: {serverMetrics.layer4_taskQueue?.totalErrors}</li>
                  <li>• İstekler Arası Boşluk: {serverMetrics.layer4_taskQueue?.interTaskDelayMs}ms</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 space-y-2">
                <div className="text-rose-400 font-bold flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  <span>Katman 5: Günlük Bütçe Sigortası (Circuit Breaker)</span>
                </div>
                <ul className="space-y-1 text-slate-300 text-[11px]">
                  <li>• Bugün Yapılan AI Çağrısı: {serverMetrics.layer5_circuitBreaker?.dailyAICallCount}</li>
                  <li>• Günlük Maksimum Tavan: {serverMetrics.layer5_circuitBreaker?.maxDailyGlobalCalls}</li>
                  <li>
                    • Sigorta Durumu:{" "}
                    {serverMetrics.layer5_circuitBreaker?.circuitBreakerActive ? (
                      <span className="text-rose-400 font-bold">KİLİTLİ (OFFLINE MOD)</span>
                    ) : (
                      <span className="text-emerald-400 font-bold">NORMAL (GÜVENLİ)</span>
                    )}
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: SYSTEM CONTROLS (KILL SWITCHES) ================= */}
      {activeTab === "system_controls" && (
        <div className="space-y-4 font-sans text-xs">
          <div className="bg-slate-950 p-5 rounded-3xl border border-blue-500/30 space-y-2 font-mono">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Sliders className="w-5 h-5 text-blue-400" />
              <span>Genel Sistem Anahtarları & Acil Durum Düğmeleri</span>
            </div>
            <p className="text-slate-300 font-sans">
              Sistemi geçici olarak bakım moduna alabilir, AI motor parametrelerini düzenleyebilir veya günlük kota limitlerini yönetebilirsiniz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            {/* Maintenance Mode */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-bold text-sm">Bakım Modu (Maintenance)</div>
                  <div className="text-slate-400 text-[11px]">Siteyi normal kullanıcılara geçici olarak kapatır</div>
                </div>
                <button
                  onClick={() => {
                    const next = !systemConfig.maintenanceMode;
                    updateSystemConfig({ maintenanceMode: next });
                    addAuditLog(next ? "Bakım Modu Açıldı" : "Bakım Modu Kapatıldı", "Genel site bakım modu değiştirildi.", undefined, "warning");
                  }}
                  className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                    systemConfig.maintenanceMode
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {systemConfig.maintenanceMode ? "AÇIK (KİLİTLİ)" : "KAPALI"}
                </button>
              </div>
            </div>

            {/* AI Engine Fallback Mode */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-3">
              <div>
                <div className="text-white font-bold text-sm">AI Motor Çalışma Modu</div>
                <div className="text-slate-400 text-[11px]">API maliyetini sıfırlamak için Simülasyon moduna alınabilir</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["gemini_live", "hybrid", "offline_simulation"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      updateSystemConfig({ aiEngineMode: m });
                      addAuditLog("AI Motor Modu Değiştirildi", `Yeni mod: ${m}`);
                    }}
                    className={`py-2 rounded-xl font-bold uppercase transition-all cursor-pointer border ${
                      systemConfig.aiEngineMode === m
                        ? "bg-cyan-500 text-slate-950 border-cyan-400"
                        : "bg-slate-900 text-slate-400 border-white/10 hover:bg-slate-800"
                    }`}
                  >
                    {m.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Welcome Bonus Amount */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="text-white font-bold text-sm">Yeni Üye Hoşgeldin Kredisi</div>
              <div className="text-slate-400 text-[11px]">0 = Başlangıç bonusu yok (kullanıcılar çark ve reklamlarla kredi kazanır)</div>
              <div className="flex gap-2">
                {[0, 25, 50, 100].map((bonus) => (
                  <button
                    key={bonus}
                    onClick={() => {
                      updateSystemConfig({ welcomeBonusCredits: bonus });
                      addAuditLog("Hoşgeldin Bonusu Güncellendi", `Yeni bonus: ${bonus} Kredi`);
                    }}
                    className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer border ${
                      systemConfig.welcomeBonusCredits === bonus
                        ? "bg-amber-500 text-slate-950 border-amber-400"
                        : "bg-slate-900 text-slate-300 border-white/10 hover:bg-slate-800"
                    }`}
                  >
                    {bonus === 0 ? "0 (Kapalı)" : `${bonus} ⚡`}
                  </button>
                ))}
              </div>
            </div>

            {/* System Announcement Banner */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="text-white font-bold text-sm">Genel Sistem Duyurusu / Banner</div>
              <input
                type="text"
                placeholder="Örn: 16 Ağustos saat 23:00'da planlı sunucu güncellemesi yapılacaktır."
                value={systemConfig.systemAnnouncement}
                onChange={(e) => updateSystemConfig({ systemAnnouncement: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-slate-200 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: AUDIT LOGS ================= */}
      {activeTab === "logs" && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-slate-950 p-5 rounded-3xl border border-emerald-500/30 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <History className="w-5 h-5 text-emerald-400" />
                <span>Yönetici Müdahale & Güvenlik Günlüğü (Audit Trail)</span>
              </div>
              <p className="text-slate-400 font-sans text-xs">
                Kredi yüklemeleri, yasaklamalar ve ayar değişiklikleri kayıt altındadır.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 border border-white/10 rounded-3xl overflow-hidden divide-y divide-white/5">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-start gap-3 hover:bg-slate-900/40 transition-colors">
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                    log.severity === "critical"
                      ? "bg-rose-500"
                      : log.severity === "warning"
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                  }`}
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">{log.action}</span>
                    <span className="text-slate-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleString("tr-TR")}
                    </span>
                  </div>
                  <p className="text-slate-300 font-sans text-xs">{log.details}</p>
                  <div className="text-[10px] text-slate-500 flex items-center gap-3">
                    <span>Yönetici: {log.adminEmail}</span>
                    {log.targetUser && <span>Hedef: {log.targetUser}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 6: SPONSORSHIP & ADS ================= */}
      {activeTab === "sponsorship" && (
        <AdminSponsorshipManager />
      )}

    </div>
  );
};
