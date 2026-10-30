import { db, doc, setDoc, getDoc, getDocs, collection, deleteDoc } from "../lib/firebase";
import { SupportTicket, SupportCategory, TicketStatus } from "../types";
import { saveAccount, getAccountByEmail } from "./userAccounts";
import { safeFetchJson } from "./apiClient";

const LOCAL_STORAGE_KEY = "future_timeline_support_tickets";

// Initial seed tickets so the admin always has rich data to see
const DEFAULT_TICKETS: SupportTicket[] = [
  {
    id: "TK-94812",
    userEmail: "deneme.kullanici@gmail.com",
    userName: "Caner Aydın",
    userPhone: "+90 532 111 22 33",
    category: "ban_appeal",
    categoryTitle: "Hesap Yasağı İtirazı",
    subject: "Yasaklanma itirazı - Otomatik bot değilim",
    description:
      "Merhabalar, sistemde arka arkaya birkaç kuantum simülasyonu çalıştırırken hesabım 'Kullanım şartları ihlali' gerekçesiyle aniden kilitlendi. Herhangi bir bot ya da otomasyon kullanmadım, lütfen hesabımın tekrar incelenip yasağımın kaldırılmasını rica ederim.",
    banReasonSnapshot: "Şüpheli çoklu istek / Bot koruması",
    status: "open",
    priority: "urgent",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "TK-94780",
    userEmail: "merve.yilmaz@outlook.com",
    userName: "Merve Yılmaz",
    userPhone: "+90 544 999 88 77",
    category: "credit_issue",
    categoryTitle: "Kredi & Bakiye Telafisi",
    subject: "Meslek risk analizinde kredim kesildi fakat sonuç gelmedi",
    description:
      "Zaman yolcusu AI sohbeti sırasında bağlantı koptu ve 15 kredim düştü. Analiz raporu ekranıma yansımadı, kredi iadesi rica ediyorum.",
    status: "in_review",
    priority: "high",
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    adminReply: "Talebiniz inceleniyor, AI servis logları kontrol ediliyor.",
    adminRepliedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    adminRepliedBy: "warfacelove46@gmail.com",
  },
];

export function getLocalSupportTickets(): SupportTicket[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Failed to load local support tickets:", e);
  }
  return DEFAULT_TICKETS;
}

export function saveLocalSupportTickets(tickets: SupportTicket[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tickets));
  } catch (e) {
    console.warn("Failed to save local support tickets:", e);
  }
}

export async function createSupportTicket(data: {
  userId?: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  category: SupportCategory;
  categoryTitle?: string;
  subject: string;
  description: string;
  banReasonSnapshot?: string;
}): Promise<SupportTicket> {
  const cleanEmail = data.userEmail.trim().toLowerCase();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const ticketId = `TK-${randomNum}`;

  const categoryTitles: Record<SupportCategory, string> = {
    ban_appeal: "⛔ Hesap Yasağı İtirazı",
    login_issue: "🔑 Oturum & Giriş Sorunu",
    account_issue: "👤 Hesap & Profil Sorunu",
    credit_issue: "💎 Kredi & Bakiye Problemi",
    bug_report: "🐛 Hata & Sistem Bildirimi",
    feature_request: "💡 Öneri & Özellik Talebi",
    privacy: "🔒 Gizlilik & Veri Güvenliği",
    other: "💬 Genel Destek",
  };

  const newTicket: SupportTicket = {
    id: ticketId,
    userId: data.userId,
    userEmail: cleanEmail,
    userName: data.userName.trim() || "Kullanıcı",
    userPhone: data.userPhone?.trim() || undefined,
    category: data.category,
    categoryTitle: data.categoryTitle || categoryTitles[data.category] || "Destek Talebi",
    subject: data.subject.trim() || `${categoryTitles[data.category]} - ${ticketId}`,
    description: data.description.trim(),
    banReasonSnapshot: data.banReasonSnapshot,
    status: "open",
    priority: data.category === "ban_appeal" ? "urgent" : data.category === "credit_issue" ? "high" : "medium",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Save to Local DB
  const currentList = getLocalSupportTickets();
  const updatedList = [newTicket, ...currentList.filter((t) => t.id !== ticketId)];
  saveLocalSupportTickets(updatedList);

  // 2. Persist to Firestore
  try {
    const ticketDocRef = doc(db, "support_tickets", ticketId);
    await setDoc(ticketDocRef, newTicket);
  } catch (err) {
    console.warn("Firestore support ticket save error:", err);
  }

  // 3. Dispatch event for real-time UI components
  window.dispatchEvent(
    new CustomEvent("future_support_ticket_created", {
      detail: newTicket,
    })
  );

  return newTicket;
}

export async function fetchAllSupportTickets(): Promise<SupportTicket[]> {
  const localList = getLocalSupportTickets();
  const ticketsMap: Record<string, SupportTicket> = {};

  localList.forEach((t) => {
    ticketsMap[t.id] = t;
  });

  try {
    const snap = await getDocs(collection(db, "support_tickets"));
    snap.forEach((docSnap) => {
      const data = docSnap.data() as SupportTicket;
      if (data && data.id) {
        ticketsMap[data.id] = data;
      }
    });
  } catch (err) {
    console.warn("Firestore fetch support tickets error:", err);
  }

  const merged = Object.values(ticketsMap).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  saveLocalSupportTickets(merged);
  return merged;
}

export async function updateSupportTicketStatus(
  ticketId: string,
  updates: {
    status?: TicketStatus;
    adminReply?: string;
    adminRepliedBy?: string;
    priority?: SupportTicket["priority"];
  }
): Promise<SupportTicket | null> {
  const tickets = getLocalSupportTickets();
  const target = tickets.find((t) => t.id === ticketId);
  if (!target) return null;

  const updatedTicket: SupportTicket = {
    ...target,
    ...updates,
    adminRepliedAt: updates.adminReply ? new Date().toISOString() : target.adminRepliedAt,
    updatedAt: new Date().toISOString(),
  };

  const updatedList = tickets.map((t) => (t.id === ticketId ? updatedTicket : t));
  saveLocalSupportTickets(updatedList);

  try {
    const ticketRef = doc(db, "support_tickets", ticketId);
    await setDoc(ticketRef, updatedTicket, { merge: true });
  } catch (err) {
    console.warn("Firestore ticket update error:", err);
  }

  window.dispatchEvent(
    new CustomEvent("future_support_ticket_updated", {
      detail: updatedTicket,
    })
  );

  return updatedTicket;
}

export async function resolveBanAppealAndUnban(
  ticketId: string,
  userEmail: string,
  adminReplyMessage: string = "İtirazınız incelenmiş olup hesabınızın yasağı kaldırılmıştır."
): Promise<boolean> {
  const cleanEmail = userEmail.toLowerCase().trim();
  const emailKey = cleanEmail.replace(/[@.]/g, "_");
  const timestamp = new Date().toISOString();

  try {
    // 1. Remove from banned_emails in Firestore & set isBanned: false
    const bannedDocRef = doc(db, "banned_emails", emailKey);
    await setDoc(bannedDocRef, { isBanned: false, banReason: null, unbannedAt: timestamp }, { merge: true }).catch(() => {});
    await deleteDoc(bannedDocRef).catch(() => {});

    // 2. Unban all Firestore user documents that match this email
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      usersSnap.forEach(async (uDoc) => {
        const uData = uDoc.data();
        if (
          uDoc.id === emailKey ||
          (uData && (uData.email || "").toLowerCase().trim() === cleanEmail)
        ) {
          await setDoc(
            doc(db, "users", uDoc.id),
            {
              isBanned: false,
              banReason: null,
              unbannedAt: timestamp,
              unbanNoticePending: true,
              isProbationRequired: true,
            },
            { merge: true }
          ).catch(() => {});
        }
      });
    } catch (fsErr) {
      console.warn("Firestore users query note during unban:", fsErr);
    }

    // Direct emailKey doc unban guarantee
    const userDocRef = doc(db, "users", emailKey);
    await setDoc(
      userDocRef,
      {
        isBanned: false,
        banReason: null,
        unbannedAt: timestamp,
        unbanNoticePending: true,
        isProbationRequired: true,
      },
      { merge: true }
    ).catch(() => {});

    // 3. Update in local user accounts
    const existingAcc = getAccountByEmail(cleanEmail);
    if (existingAcc) {
      saveAccount({
        ...existingAcc,
        isBanned: false,
        banReason: undefined,
        unbanNoticePending: true,
        isProbationRequired: true,
      });
    }

    try {
      localStorage.setItem(`future_unban_notice_${cleanEmail}`, "true");
    } catch (e) {}

    // 4. Mark ticket as resolved with admin reply
    await updateSupportTicketStatus(ticketId, {
      status: "resolved",
      adminReply: adminReplyMessage,
      adminRepliedBy: "warfacelove46@gmail.com",
    });

    // 5. Dispatch global unban event for real-time listeners
    window.dispatchEvent(
      new CustomEvent("future_user_unbanned", {
        detail: { email: cleanEmail, ticketId },
      })
    );

    // 6. Notify Server Auth Engine
    safeFetchJson("/api/admin/unban", {
      method: "POST",
      body: JSON.stringify({ targetEmail: cleanEmail }),
    }).catch(() => {});

    return true;
  } catch (err) {
    console.error("Error resolving ban appeal:", err);
    return false;
  }
}
