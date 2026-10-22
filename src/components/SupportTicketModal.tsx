import React, { useState, useEffect, useMemo } from "react";
import {
  LifeBuoy,
  X,
  Send,
  ShieldAlert,
  KeyRound,
  DollarSign,
  Bug,
  HelpCircle,
  CheckCircle2,
  Clock,
  Search,
  MessageSquare,
  AlertCircle,
  FileText,
  Sparkles,
  Lock,
  ArrowRight,
  RefreshCw,
  UserCheck,
  Check,
  MessageSquareText,
  Crown,
  Filter,
  User,
  Zap,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { SupportCategory, SupportTicket, TicketStatus } from "../types/support";
import {
  createSupportTicket,
  getLocalSupportTickets,
  fetchAllSupportTickets,
  updateSupportTicketStatus,
  resolveBanAppealAndUnban,
} from "../utils/supportTickets";
import { db, collection, onSnapshot, doc, setDoc } from "../lib/firebase";
import { getAccountByEmail, saveAccount } from "../utils/userAccounts";

interface SupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: SupportCategory;
  initialBanReason?: string;
  initialEmail?: string;
}

export const SupportTicketModal: React.FC<SupportTicketModalProps> = ({
  isOpen,
  onClose,
  initialCategory = "ban_appeal",
  initialBanReason,
  initialEmail,
}) => {
  const { language } = useLanguage();
  const { currentUser, updateUserProfile } = useAuth();
  const isTr = language === "tr";

  // Check if current authenticated user is Admin / Super Admin
  const isAdmin = useMemo(() => {
    if (!currentUser) return false;
    const email = (currentUser.email || "").toLowerCase().trim();
    return email === "warfacelove46@gmail.com" || currentUser.role === "admin";
  }, [currentUser]);

  // Active tab depends on role: Admin defaults to "incoming_tickets", regular user to "new_ticket"
  const [activeTab, setActiveTab] = useState<
    "incoming_tickets" | "ticket_detail" | "new_ticket" | "track_ticket"
  >(() => (isAdmin ? "incoming_tickets" : "new_ticket"));

  // State for all tickets (realtime)
  const [ticketsList, setTicketsList] = useState<SupportTicket[]>(() => getLocalSupportTickets());
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Admin filter states
  const [adminFilterCategory, setAdminFilterCategory] = useState<string>("all");
  const [adminFilterStatus, setAdminFilterStatus] = useState<string>("all");
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>("");
  const [adminReplyText, setAdminReplyText] = useState<string>("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // User Form State
  const [category, setCategory] = useState<SupportCategory>(initialCategory);
  const [userName, setUserName] = useState<string>(currentUser?.fullName || "");
  const [userEmail, setUserEmail] = useState<string>(
    initialEmail || currentUser?.email || ""
  );
  const [userPhone, setUserPhone] = useState<string>(currentUser?.phone || "");
  const [subject, setSubject] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // User tracking tab state
  const [searchQuery, setSearchQuery] = useState<string>(
    initialEmail || currentUser?.email || ""
  );
  const [trackedTickets, setTrackedTickets] = useState<SupportTicket[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Set default tab when opening
  useEffect(() => {
    if (isOpen) {
      if (isAdmin) {
        setActiveTab("incoming_tickets");
      } else {
        setActiveTab("new_ticket");
      }
    }
  }, [isOpen, isAdmin]);

  // Synchronize initial values
  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
    if (initialEmail) {
      setUserEmail(initialEmail);
      setSearchQuery(initialEmail);
    }
    if (initialBanReason && !subject && initialCategory === "ban_appeal") {
      setSubject(
        isTr
          ? `Hesap Yasağı İtirazı (${initialBanReason})`
          : `Ban Appeal (${initialBanReason})`
      );
    }
  }, [initialCategory, initialEmail, initialBanReason, isTr]);

  // Real-time Firestore tickets synchronization
  useEffect(() => {
    fetchAllSupportTickets().then((data) => {
      if (data && data.length > 0) setTicketsList(data);
    });

    const unsub = onSnapshot(
      collection(db, "support_tickets"),
      (snapshot) => {
        const live: SupportTicket[] = [];
        snapshot.forEach((snap) => {
          const t = snap.data() as SupportTicket;
          if (t && t.id) live.push(t);
        });
        if (live.length > 0) {
          live.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setTicketsList(live);
        }
      },
      (err) => {
        console.warn("Firestore support tickets sync error:", err);
      }
    );

    const handleLocalUpdate = () => {
      setTicketsList(getLocalSupportTickets());
    };

    window.addEventListener("future_support_ticket_created", handleLocalUpdate);
    window.addEventListener("future_support_ticket_updated", handleLocalUpdate);

    return () => {
      unsub();
      window.removeEventListener("future_support_ticket_created", handleLocalUpdate);
      window.removeEventListener("future_support_ticket_updated", handleLocalUpdate);
    };
  }, []);

  const categories: {
    key: SupportCategory;
    title: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      key: "ban_appeal",
      title: isTr ? "Hesap Yasağına İtiraz" : "Account Ban Appeal",
      desc: isTr
        ? "Hesabınızın yanlışlıkla veya güvenlik filtrelerine takılarak askıya alındığını bildirin."
        : "Appeal an automatic or administrative account suspension.",
      icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
      color: "border-rose-500/40 bg-rose-950/20 hover:border-rose-500",
    },
    {
      key: "login_issue",
      title: isTr ? "Giriş & Hesap Güvenliği" : "Login & Account Security",
      desc: isTr
        ? "Google OAuth, e-posta onay kodu veya şifre girişinde yaşanan problemler."
        : "Trouble signing in, receiving email verification codes or account issues.",
      icon: <KeyRound className="w-4 h-4 text-amber-400" />,
      color: "border-amber-500/40 bg-amber-950/20 hover:border-amber-500",
    },
    {
      key: "credit_issue",
      title: isTr ? "Kredi & Bakiye Telafisi" : "Credit & Balance Dispute",
      desc: isTr
        ? "Hatalı simülasyon çıktısı veya harcanan kredilerin telafi talebi."
        : "Failed AI predictions, incomplete simulations or credit refund.",
      icon: <DollarSign className="w-4 h-4 text-cyan-400" />,
      color: "border-cyan-500/40 bg-cyan-950/20 hover:border-cyan-500",
    },
    {
      key: "bug_report",
      title: isTr ? "Sistem & Hata Bildirimi" : "Bug & Technical Report",
      desc: isTr
        ? "Zaman çizelgesi veya AI tahminlerinde tespit ettiğiniz teknik sorunlar."
        : "Report UI issues, broken nodes, or unexpected server behavior.",
      icon: <Bug className="w-4 h-4 text-purple-400" />,
      color: "border-purple-500/40 bg-purple-950/20 hover:border-purple-500",
    },
    {
      key: "other",
      title: isTr ? "Genel Destek & Soru" : "General Inquiries",
      desc: isTr
        ? "Platform kullanımı veya diğer konular hakkında doğrudan yönetici desteği."
        : "General questions and assistance from administrators.",
      icon: <HelpCircle className="w-4 h-4 text-blue-400" />,
      color: "border-blue-500/40 bg-blue-950/20 hover:border-blue-500",
    },
  ];

  // User form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim()) {
      setErrorMessage(isTr ? "Lütfen geçerli bir e-posta adresi girin." : "Please enter a valid email.");
      return;
    }
    if (!description.trim()) {
      setErrorMessage(
        isTr
          ? "Lütfen sorunun kaynağını ve açıklamasını detaylı olarak belirtin."
          : "Please provide a detailed description of the issue."
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const ticket = await createSupportTicket({
        userId: currentUser?.id,
        userEmail: userEmail.trim().toLowerCase(),
        userName: userName.trim() || (isTr ? "Kullanıcı" : "User"),
        userPhone: userPhone.trim(),
        category,
        subject: subject.trim() || (isTr ? `${category} Talebi` : `${category} Ticket`),
        description: description.trim(),
        banReasonSnapshot: initialBanReason,
      });

      setSubmittedTicket(ticket);
      setIsSubmitting(false);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          (isTr
            ? "Talebiniz kaydedilirken bir hata oluştu. Lütfen tekrar deneyin."
            : "Failed to submit support ticket. Please try again.")
      );
      setIsSubmitting(false);
    }
  };

  // User tracking search
  const handleSearchTickets = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const all = await fetchAllSupportTickets();
      const q = searchQuery.toLowerCase().trim();
      const filtered = all.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.userEmail.toLowerCase().includes(q) ||
          t.userName.toLowerCase().includes(q)
      );
      setTrackedTickets(filtered);
    } catch (e) {
      console.warn("Search error:", e);
    } finally {
      setIsSearching(false);
    }
  };

  // ================= ADMIN ACTIONS =================
  const handleAdminReply = async (
    ticket: SupportTicket,
    replyText: string,
    newStatus: TicketStatus = "resolved"
  ) => {
    if (!replyText.trim()) return;
    const updated = await updateSupportTicketStatus(ticket.id, {
      adminReply: replyText.trim(),
      status: newStatus,
      adminRepliedBy: currentUser?.email || "warfacelove46@gmail.com",
    });

    if (updated) {
      setTicketsList((prev) => prev.map((t) => (t.id === ticket.id ? updated : t)));
      setSelectedTicket(updated);
      setAdminReplyText("");
      setActionSuccessMsg(`✓ ${ticket.id} nolu talebe yanıt verildi ve durum "${newStatus.toUpperCase()}" yapıldı.`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }
  };

  const handleAdminOneClickUnban = async (ticket: SupportTicket) => {
    const replyMsg =
      adminReplyText.trim() ||
      "Hesap itirazınız Süper Yönetici tarafından incelenmiş, güvenlik kontrolünden başarıyla geçerek yasağınız derhal kaldırılmıştır.";

    const ok = await resolveBanAppealAndUnban(ticket.id, ticket.userEmail, replyMsg);
    if (ok) {
      const updatedList = await fetchAllSupportTickets();
      setTicketsList(updatedList);
      const updatedTarget = updatedList.find((t) => t.id === ticket.id);
      if (updatedTarget) setSelectedTicket(updatedTarget);
      setActionSuccessMsg(`🎉 ${ticket.userEmail} yasağı kaldırıldı ve itiraz talebi çözüldü!`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }
  };

  const handleAdminQuickCompensation = async (ticket: SupportTicket, amount: number) => {
    const cleanEmail = ticket.userEmail.toLowerCase().trim();
    const account = getAccountByEmail(cleanEmail);
    if (account) {
      const updatedCredits = (account.credits || 0) + amount;
      saveAccount({
        ...account,
        credits: updatedCredits,
      });

      // Update Firestore user if doc exists
      const emailKey = cleanEmail.replace(/[@.]/g, "_");
      setDoc(doc(db, "users", emailKey), { credits: updatedCredits }, { merge: true }).catch(() => {});
    }

    const replyMsg = `Yaşadığınız aksaklık için hesabınıza +${amount} kredi telafisi yüklenmiştir. Keyifli simülasyonlar dileriz.`;
    await handleAdminReply(ticket, replyMsg, "resolved");
    setActionSuccessMsg(`✓ ${cleanEmail} hesabına ${amount} kredi telafisi aktarıldı ve talep çözüldü.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Filtered tickets for Admin
  const adminFilteredTickets = useMemo(() => {
    return ticketsList.filter((t) => {
      const q = adminSearchQuery.toLowerCase().trim();
      const matchQ =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.userEmail.toLowerCase().includes(q) ||
        t.userName.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q);

      const matchCat = adminFilterCategory === "all" || t.category === adminFilterCategory;
      const matchStat = adminFilterStatus === "all" || t.status === adminFilterStatus;

      return matchQ && matchCat && matchStat;
    });
  }, [ticketsList, adminSearchQuery, adminFilterCategory, adminFilterStatus]);

  const pendingCount = useMemo(() => {
    return ticketsList.filter((t) => t.status === "open" || t.status === "in_review").length;
  }, [ticketsList]);

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {isTr ? "Sırada / Açık" : "Open / Pending"}
          </span>
        );
      case "in_review":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" />
            {isTr ? "İnceleniyor" : "Under Review"}
          </span>
        );
      case "resolved":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {isTr ? "Çözüldü" : "Resolved"}
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-1">
            <X className="w-3 h-3" />
            {isTr ? "Reddedildi" : "Rejected"}
          </span>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full ${
          isAdmin ? "max-w-5xl" : "max-w-2xl"
        } bg-slate-950 border ${
          isAdmin ? "border-rose-500/50 shadow-rose-950/60" : "border-cyan-500/40 shadow-cyan-950/50"
        } rounded-3xl p-4 sm:p-6 shadow-2xl text-left space-y-4 overflow-hidden max-h-[94vh] flex flex-col font-sans transition-all`}
      >
        {/* Glow Header */}
        <div
          className={`absolute top-0 right-0 w-72 h-72 ${
            isAdmin ? "bg-rose-500/10" : "bg-cyan-500/10"
          } rounded-full blur-3xl pointer-events-none`}
        />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl ${
                isAdmin
                  ? "bg-gradient-to-tr from-rose-500 via-red-600 to-amber-500"
                  : "bg-gradient-to-tr from-cyan-500 to-blue-600"
              } p-0.5 shadow-lg shrink-0`}
            >
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                {isAdmin ? (
                  <Crown className="w-5 h-5 text-rose-400 animate-pulse" />
                ) : (
                  <LifeBuoy className="w-5 h-5 text-cyan-400" />
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white font-mono tracking-tight flex items-center gap-2">
                  <span>
                    {isAdmin
                      ? isTr
                        ? "DESTEK & İTİRAZ YÖNETİM MASASI"
                        : "SUPPORT & APPEAL MANAGEMENT DESK"
                      : isTr
                      ? "DESTEK VE İTİRAZ MASASI"
                      : "SUPPORT & APPEAL DESK"}
                  </span>
                </h3>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-rose-500/20 text-rose-300 border border-rose-500/50 uppercase tracking-wider">
                    👑 Süper Yönetici
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {isAdmin
                  ? isTr
                    ? "Kullanıcılardan gelen itiraz ve destek taleplerini inceleyin, yasağı kaldırın veya bakiye telafisi sağlayın."
                    : "Review incoming user appeals and support tickets, unban users, and issue credit refunds."
                  : isTr
                  ? "Doğrudan sistem yöneticisi ve teknik inceleme merkezine iletilir."
                  : "Direct line to system administrator and technical dispatch."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action toast message */}
        {actionSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-mono font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Navigation Tabs - Dynamically configured based on Role */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-2xl border border-white/10 shrink-0 font-mono text-xs overflow-x-auto no-scrollbar">
          {isAdmin ? (
            <>
              <button
                type="button"
                onClick={() => setActiveTab("incoming_tickets")}
                className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeTab === "incoming_tickets" || activeTab === "ticket_detail"
                    ? "bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md shadow-rose-950/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <LifeBuoy className="w-3.5 h-3.5 text-rose-300" />
                <span>{isTr ? "Gelen Talepler & İtirazlar" : "Incoming Tickets & Appeals"}</span>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-black animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("new_ticket");
                  setSubmittedTicket(null);
                }}
                className={`py-2 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeTab === "new_ticket"
                    ? "bg-slate-800 text-white border border-white/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isTr ? "➕ Test Talebi Oluştur" : "➕ Test Ticket"}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("new_ticket");
                  setSubmittedTicket(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "new_ticket"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isTr ? "Yeni Talep / İtiraz Oluştur" : "New Ticket / Appeal"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("track_ticket");
                  handleSearchTickets();
                }}
                className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "track_ticket"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isTr ? "Talebimi Sorgula & Yanıtlar" : "Track My Ticket"}</span>
              </button>
            </>
          )}
        </div>

        {/* ======================================================== */}
        {/* =============== ADMIN MODE: INCOMING TICKETS =============== */}
        {/* ======================================================== */}
        {isAdmin && (activeTab === "incoming_tickets" || activeTab === "ticket_detail") && (
          <div className="flex-1 overflow-hidden flex flex-col space-y-3 font-mono text-xs">
            {/* Filter Bar */}
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-white/10 space-y-2.5 shrink-0">
              <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
                <div className="relative flex-1 w-full">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder={
                      isTr
                        ? "Takip No, E-posta, Kullanıcı Adı veya Açıklama ile ara..."
                        : "Search by ID, email, name or keywords..."
                    }
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-rose-400 font-mono"
                  />
                </div>

                {/* Status selector */}
                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
                  {[
                    { key: "all", label: "Tümü" },
                    { key: "open", label: "⏳ Açık" },
                    { key: "in_review", label: "🔍 İnceleniyor" },
                    { key: "resolved", label: "✅ Çözüldü" },
                    { key: "rejected", label: "❌ Red" },
                  ].map((st) => (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => setAdminFilterStatus(st.key)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                        adminFilterStatus === st.key
                          ? "bg-rose-600 text-white shadow-md shadow-rose-950/40"
                          : "bg-slate-950 text-slate-400 hover:text-white border border-white/5"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1 border-t border-white/5">
                <span className="text-slate-500 font-bold text-[10px] mr-1">Kategori:</span>
                {[
                  { key: "all", label: "Tümü" },
                  { key: "ban_appeal", label: "⛔ Yasak İtirazları" },
                  { key: "credit_issue", label: "💎 Kredi Telafisi" },
                  { key: "login_issue", label: "🔑 Giriş & Hesap" },
                  { key: "bug_report", label: "🐛 Hata" },
                  { key: "other", label: "💬 Genel" },
                ].map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setAdminFilterCategory(c.key)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                      adminFilterCategory === c.key
                        ? "bg-cyan-500 text-slate-950 font-black"
                        : "bg-slate-950 text-slate-400 hover:text-white"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Split Screen Master-Detail (Desktop: 2 Columns, Mobile: Selectable) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 overflow-hidden">
              {/* Left Column: Tickets list (5 cols) */}
              <div className="md:col-span-5 overflow-y-auto space-y-2 pr-1 max-h-[55vh]">
                {adminFilteredTickets.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/5 text-center text-slate-400 space-y-2">
                    <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs">Filtreye uygun destek talebi bulunamadı.</p>
                  </div>
                ) : (
                  adminFilteredTickets.map((t, tIdx) => {
                    const isSelected = selectedTicket?.id === t.id;
                    const isBan = t.category === "ban_appeal";
                    const isOpen = t.status === "open";

                    return (
                      <div
                        key={`admin-ticket-${t.id || 'ticket'}-${tIdx}`}
                        onClick={() => {
                          setSelectedTicket(t);
                          setAdminReplyText(t.adminReply || "");
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer text-left space-y-1.5 ${
                          isSelected
                            ? "border-rose-400 bg-rose-950/40 ring-1 ring-rose-400 shadow-md shadow-rose-950/40"
                            : isBan && isOpen
                            ? "border-rose-500/40 bg-slate-900/90 hover:bg-slate-900"
                            : "border-white/10 bg-slate-900/50 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-cyan-400">{t.id}</span>
                            {isBan && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                ⛔ İTİRAZ
                              </span>
                            )}
                          </div>
                          {getStatusBadge(t.status)}
                        </div>

                        <div className="text-white font-bold text-xs truncate">{t.subject}</div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {t.userName} • <span className="text-cyan-300">{t.userEmail}</span>
                        </div>

                        <p className="text-[11px] text-slate-300 font-sans line-clamp-2 leading-relaxed">
                          {t.description}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5">
                          <span>{t.categoryTitle}</span>
                          <span>{new Date(t.createdAt).toLocaleTimeString(isTr ? "tr-TR" : "en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Column: Ticket Inspection & Actions (7 cols) */}
              <div className="md:col-span-7 bg-slate-900/90 border border-white/10 rounded-2xl p-4 overflow-y-auto max-h-[55vh] space-y-3.5">
                {selectedTicket ? (
                  <>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-rose-400">{selectedTicket.id}</span>
                          <span className="text-white font-bold text-xs sm:text-sm font-sans">{selectedTicket.subject}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Tarih: {new Date(selectedTicket.createdAt).toLocaleString(isTr ? "tr-TR" : "en-US")} • Kategori:{" "}
                          <strong className="text-cyan-400">{selectedTicket.categoryTitle}</strong>
                        </div>
                      </div>
                      <div>{getStatusBadge(selectedTicket.status)}</div>
                    </div>

                    {/* User Profile Card */}
                    {(() => {
                      const acc = getAccountByEmail(selectedTicket.userEmail);
                      const isBanned = acc?.isBanned ?? false;

                      return (
                        <div className="p-3 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{selectedTicket.userName}</span>
                              <span className="text-cyan-300 font-mono">({selectedTicket.userEmail})</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Mevcut Bakiye: <strong className="text-amber-400">{acc?.credits ?? 0} ⚡</strong>
                              {selectedTicket.userPhone && ` • Tel: ${selectedTicket.userPhone}`}
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isBanned ? (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-950 border border-rose-500 text-rose-300 flex items-center gap-1 animate-pulse">
                                <ShieldAlert className="w-3 h-3 text-rose-400" />
                                <span>⛔ HESAP YASAKLI</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-950 border border-emerald-500 text-emerald-300 flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-emerald-400" />
                                <span>✓ HESAP AKTİF</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Ban Snapshot if ban appeal */}
                    {selectedTicket.banReasonSnapshot && (
                      <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-[11px] text-rose-200 space-y-0.5">
                        <div className="font-bold text-rose-300 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>Sistemdeki Yasaklama Nedeni:</span>
                        </div>
                        <p className="text-slate-200">{selectedTicket.banReasonSnapshot}</p>
                      </div>
                    )}

                    {/* User's Explanation */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Kullanıcının Sorun Açıklaması & Gerekçesi:</span>
                      </label>
                      <div className="p-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
                        {selectedTicket.description}
                      </div>
                    </div>

                    {/* One-Click Direct Unban Action */}
                    {selectedTicket.category === "ban_appeal" && (
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-slate-950 border border-emerald-500/50 space-y-2">
                        <div className="text-emerald-300 font-bold flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-emerald-400" />
                          <span>Hızlı İtiraz Onayı & Yasağı Kaldır</span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-sans">
                          Kullanıcının hem Firestore `banned_emails` hem de yerel hesap yasağı derhal kaldırılır ve itiraz çözüldü olarak işaretlenir.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleAdminOneClickUnban(selectedTicket)}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50"
                        >
                          <Check className="w-4 h-4" />
                          <span>✓ YASAĞI DERHAL KALDIR & İTİRAZI ÇÖZ</span>
                        </button>
                      </div>
                    )}

                    {/* Quick Credit Compensation */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                        <span>Hızlı Bakiye Telafisi Tanımla:</span>
                      </label>
                      <div className="flex gap-2">
                        {[25, 50, 100].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => handleAdminQuickCompensation(selectedTicket, amt)}
                            className="flex-1 py-1.5 px-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Zap className="w-3 h-3 text-amber-400" />
                            <span>+{amt} ⚡ Telafi Et</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Admin Reply & Decision Section */}
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <label className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <MessageSquareText className="w-3.5 h-3.5 text-rose-400" />
                          <span>Yönetici Yanıtı & Kararı:</span>
                        </span>
                        {selectedTicket.adminRepliedAt && (
                          <span className="text-[10px] text-slate-500">
                            Son: {new Date(selectedTicket.adminRepliedAt).toLocaleString(isTr ? "tr-TR" : "en-US")}
                          </span>
                        )}
                      </label>

                      {/* Reply Templates */}
                      <div className="flex gap-1 flex-wrap">
                        {[
                          "İtirazınız onaylandı, yasağınız kaldırılmıştır.",
                          "Güvenlik kontrolü tamamlandı, erişiminiz açıldı.",
                          "Hatalı AI işlemi telafi kredisi hesabınıza yüklendi.",
                          "Gerekli teknik inceleme başlatılmıştır.",
                        ].map((tpl) => (
                          <button
                            key={tpl}
                            type="button"
                            onClick={() => setAdminReplyText(tpl)}
                            className="px-2 py-0.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-white/10 text-slate-300 text-[10px] transition-all cursor-pointer"
                          >
                            + "{tpl}"
                          </button>
                        ))}
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Kullanıcıya iletilecek yönetici karar mesajı..."
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-white font-sans text-xs focus:outline-none focus:border-rose-400 resize-none leading-relaxed"
                      />

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleAdminReply(selectedTicket, adminReplyText || "Talebiniz çözüme kavuşturulmuştur.", "resolved")}
                          className="py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Çözüldü Yap</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdminReply(selectedTicket, adminReplyText || "Talebiniz incelemeye alındı.", "in_review")}
                          className="py-2 px-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>İnceleniyor</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdminReply(selectedTicket, adminReplyText || "Talebiniz incelenmiş olup reddedilmiştir.", "rejected")}
                          className="py-2 px-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reddet</span>
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-12 text-center text-slate-400 space-y-2">
                    <LifeBuoy className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                    <div className="font-bold text-white text-xs">Detay Görüntülemek İçin Bir Talep Seçin</div>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto font-sans leading-relaxed">
                      Soldaki listeden bir itiraz veya talep seçerek kullanıcının gerekçesini okuyabilir ve anında aksiyon alabilirsiniz.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* =============== REGULAR USER / NEW TICKET TAB ========== */}
        {/* ======================================================== */}
        {activeTab === "new_ticket" && (
          <div className="overflow-y-auto space-y-4 pr-1 flex-1">
            {submittedTicket ? (
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/50 text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-950/50">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-white font-mono">
                    {isTr ? "Talebiniz Başarıyla Alındı!" : "Ticket Submitted Successfully!"}
                  </h4>
                  <p className="text-xs text-slate-300 font-mono">
                    {isTr ? "Takip Kodunuz:" : "Tracking Code:"}{" "}
                    <strong className="text-cyan-400 text-sm px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40">
                      {submittedTicket.id}
                    </strong>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-left text-xs font-mono space-y-2 text-slate-300">
                  <div className="flex justify-between border-b border-white/5 pb-1.5">
                    <span className="text-slate-400">{isTr ? "Kategori:" : "Category:"}</span>
                    <span className="text-white font-bold">{submittedTicket.categoryTitle}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1.5">
                    <span className="text-slate-400">{isTr ? "İletişim E-posta:" : "Email:"}</span>
                    <span className="text-cyan-300">{submittedTicket.userEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isTr ? "Durum:" : "Status:"}</span>
                    {getStatusBadge(submittedTicket.status)}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isTr
                    ? "Talebiniz yönetici kontrol masasına düşmüştür. Yönetici yasağınızı kaldırdığında veya yanıt verdiğinde bu panelden ve e-postanız üzerinden bildirim alacaksınız."
                    : "Your request has been dispatched to the administrator. You will be notified once reviewed."}
                </p>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery(submittedTicket.id);
                      setActiveTab("track_ticket");
                      handleSearchTickets();
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>{isTr ? "Talebi Takip Et" : "Track Status"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs border border-white/10 transition-all cursor-pointer"
                  >
                    {isTr ? "Kapat" : "Close"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Ban notice reminder if applicable */}
                {initialBanReason && (
                  <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-2.5 text-xs font-mono text-rose-200">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-300">
                        {isTr ? "Mevcut Yasaklama Nedeni:" : "Current Ban Reason:"}
                      </span>{" "}
                      {initialBanReason}
                    </div>
                  </div>
                )}

                {/* Category Picker */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 font-semibold mb-2">
                    {isTr ? "Sorun Kaynağı / Kategori Seçin:" : "Select Issue Category:"}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {categories.map((c) => {
                      const isSelected = category === c.key;
                      return (
                        <button
                          key={c.key}
                          type="button"
                          onClick={() => {
                            setCategory(c.key);
                            if (c.key === "ban_appeal" && initialBanReason && !subject) {
                              setSubject(`Hesap Yasağı İtirazı (${initialBanReason})`);
                            }
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                            isSelected
                              ? "border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400"
                              : "border-white/10 bg-slate-900/60 hover:bg-slate-900"
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-slate-950 border border-white/10 shrink-0">
                            {c.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white font-mono flex items-center justify-between">
                              <span>{c.title}</span>
                              {isSelected && <span className="text-[10px] text-cyan-400">✓</span>}
                            </div>
                            <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                              {c.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Contact Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">
                      {isTr ? "Adınız Soyadınız:" : "Full Name:"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isTr ? "Örn: Ahmet Yılmaz" : "e.g. John Doe"}
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">
                      {isTr ? "İletişim E-posta Adresi:" : "Email Address:"}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="adiniz@gmail.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    {isTr ? "Talep / İtiraz Başlığı:" : "Subject / Title:"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      isTr
                        ? "Örn: Hesabımın incelenmesi ve yasağımın kaldırılması"
                        : "e.g. Account review and ban appeal"
                    }
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Detailed Description */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1 flex items-center justify-between">
                    <span>{isTr ? "Sorun Kaynağı & Detaylı Açıklama:" : "Detailed Explanation:"}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {description.length} {isTr ? "karakter" : "chars"}
                    </span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder={
                      category === "ban_appeal"
                        ? isTr
                          ? "Lütfen ne zaman ve hangi işlemi yaparken yasaklandığınızı, neden bir hata olduğunu düşündüğünüzü detaylandırın..."
                          : "Explain why you believe the ban was made in error..."
                        : isTr
                        ? "Yaşadığınız sorunun kaynağını, hata mesajını veya telafi talebinizi detaylıca açıklayın..."
                        : "Describe the issue and steps to reproduce..."
                    }
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
                  />
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs tracking-wider transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{isTr ? "Yöneticiye İletiliyor..." : "Submitting to Dispatch..."}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>
                        {category === "ban_appeal"
                          ? isTr
                            ? "İTİRAZ TALEBİNİ YÖNETİCİYE GÖNDER"
                            : "SUBMIT BAN APPEAL TO ADMIN"
                          : isTr
                          ? "DESTEK TALEBİNİ GÖNDER"
                          : "SUBMIT SUPPORT TICKET"}
                      </span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* =============== REGULAR USER / TRACK TICKETS =========== */}
        {/* ======================================================== */}
        {activeTab === "track_ticket" && (
          <div className="overflow-y-auto space-y-4 pr-1 flex-1">
            {/* Search Box */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder={
                    isTr
                      ? "Takip Kodu (Örn: TK-94812) veya E-posta girin..."
                      : "Search by Ticket ID (TK-...) or Email..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchTickets()}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
              <button
                type="button"
                onClick={handleSearchTickets}
                disabled={isSearching}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>{isTr ? "Sorgula" : "Search"}</span>
              </button>
            </div>

            {/* Results List */}
            <div className="space-y-3">
              {trackedTickets.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/5 text-center space-y-2">
                  <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-mono">
                    {isTr
                      ? "Arama kriterine uygun destek talebi bulunamadı."
                      : "No support tickets found for this query."}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {isTr
                      ? "Lütfen oluşturduğunuz takip kodunu veya kayıtlı e-posta adresinizi giriniz."
                      : "Make sure you typed the correct Ticket ID or registered email."}
                  </p>
                </div>
              ) : (
                trackedTickets.map((ticket, tIdx) => (
                  <div
                    key={`tracked-ticket-${ticket.id || 'ticket'}-${tIdx}`}
                    className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-cyan-400 font-mono">
                            {ticket.id}
                          </span>
                          <span className="text-xs font-bold text-white">{ticket.subject}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {ticket.userName} ({ticket.userEmail}) •{" "}
                          {new Date(ticket.createdAt).toLocaleString(isTr ? "tr-TR" : "en-US")}
                        </div>
                      </div>
                      <div>{getStatusBadge(ticket.status)}</div>
                    </div>

                    {/* User description */}
                    <div className="text-xs text-slate-300 font-mono bg-slate-950/60 p-3 rounded-xl border border-white/5">
                      <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">
                        {isTr ? "Talebiniz / Açıklama:" : "Your Submission:"}
                      </div>
                      <p className="leading-relaxed">{ticket.description}</p>
                    </div>

                    {/* Admin Response Box */}
                    {ticket.adminReply ? (
                      <div className="text-xs font-mono bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-500/40 space-y-1.5">
                        <div className="text-[10px] text-emerald-400 font-bold uppercase flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {isTr ? "Yönetici Yanıtı & Kararı:" : "Admin Decision & Reply:"}
                          </span>
                          <span className="text-slate-400 text-[9px]">
                            {ticket.adminRepliedAt
                              ? new Date(ticket.adminRepliedAt).toLocaleString(isTr ? "tr-TR" : "en-US")
                              : ""}
                          </span>
                        </div>
                        <p className="text-emerald-200 leading-relaxed font-semibold">
                          {ticket.adminReply}
                        </p>
                      </div>
                    ) : (
                      <div className="text-[11px] font-mono text-amber-400/90 flex items-center gap-1.5 bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/20">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {isTr
                            ? "Talebiniz yönetici inceleme sırasında bekliyor. Karar verildiğinde yanıt burada görünecektir."
                            : "Ticket is queued in the admin review dispatch."}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
