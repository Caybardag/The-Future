import fs from "fs";
import path from "path";

export interface ServerSupportTicket {
  id: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  category: string;
  categoryTitle: string;
  subject: string;
  description: string;
  banReasonSnapshot?: string;
  status: "open" | "in_review" | "resolved" | "rejected";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  updatedAt: string;
  adminReply?: string;
  adminRepliedAt?: string;
  adminRepliedBy?: string;
}

export interface ServerCommunitySubmission {
  id: string;
  userEmail: string;
  userName: string;
  year: number;
  title: string;
  category: string;
  description: string;
  sourceUrl?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

const isTestEnv = Boolean(process.env.VITEST || process.env.NODE_ENV === "test");
const TICKETS_DB_PATH = isTestEnv
  ? path.join(process.cwd(), "src", "data", "test_support_tickets_db.json")
  : path.join(process.cwd(), "src", "data", "server_support_tickets_db.json");
const SUBMISSIONS_DB_PATH = path.join(process.cwd(), "src", "data", "server_community_submissions_db.json");

let ticketsCache: ServerSupportTicket[] = [];
let submissionsCache: ServerCommunitySubmission[] = [];
let isInitialized = false;

function ensureInitialized() {
  if (isInitialized) return;

  try {
    if (fs.existsSync(TICKETS_DB_PATH)) {
      const raw = fs.readFileSync(TICKETS_DB_PATH, "utf-8");
      ticketsCache = JSON.parse(raw);
    } else {
      ticketsCache = [
        {
          id: "TK-94812",
          userEmail: "deneme.kullanici@gmail.com",
          userName: "Caner Aydın",
          userPhone: "+90 532 111 22 33",
          category: "ban_appeal",
          categoryTitle: "Hesap Yasağı İtirazı",
          subject: "Yasaklanma itirazı - Otomatik bot değilim",
          description:
            "Sistemde peş peşe simülasyon çalıştırırken hesabım askıya alındı. Bot değilim, inceleme talep ediyorum.",
          banReasonSnapshot: "Şüpheli çoklu istek / Bot koruması",
          status: "open",
          priority: "urgent",
          createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        },
      ];
      persistTickets();
    }
  } catch (err) {
    console.warn("[ServerSupportEngine] Error reading tickets:", err);
  }

  try {
    if (fs.existsSync(SUBMISSIONS_DB_PATH)) {
      submissionsCache = JSON.parse(fs.readFileSync(SUBMISSIONS_DB_PATH, "utf-8"));
    } else {
      submissionsCache = [];
    }
  } catch (err) {
    console.warn("[ServerSupportEngine] Error reading submissions:", err);
  }

  isInitialized = true;
}

function persistTickets() {
  try {
    const dir = path.dirname(TICKETS_DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(TICKETS_DB_PATH, JSON.stringify(ticketsCache, null, 2), "utf-8");
  } catch (_e) {}
}

function persistSubmissions() {
  try {
    const dir = path.dirname(SUBMISSIONS_DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SUBMISSIONS_DB_PATH, JSON.stringify(submissionsCache, null, 2), "utf-8");
  } catch (_e) {}
}

export function getServerTickets(filterEmail?: string, isAdmin = false): ServerSupportTicket[] {
  ensureInitialized();
  if (isAdmin) {
    return [...ticketsCache];
  }
  if (!filterEmail) {
    return [];
  }
  const clean = filterEmail.toLowerCase().trim();
  return ticketsCache.filter((t) => t.userEmail.toLowerCase().trim() === clean);
}

export function getServerTicketById(ticketId: string): ServerSupportTicket | null {
  ensureInitialized();
  return ticketsCache.find((t) => t.id === ticketId) || null;
}

export function createServerTicket(data: {
  userEmail: string;
  userName: string;
  userPhone?: string;
  category: string;
  categoryTitle: string;
  subject: string;
  description: string;
  banReasonSnapshot?: string;
  priority?: "low" | "medium" | "high" | "urgent";
}): ServerSupportTicket {
  ensureInitialized();
  const ticket: ServerSupportTicket = {
    id: "TK-" + Math.floor(10000 + Math.random() * 90000),
    userEmail: data.userEmail.toLowerCase().trim(),
    userName: data.userName,
    userPhone: data.userPhone,
    category: data.category,
    categoryTitle: data.categoryTitle,
    subject: data.subject,
    description: data.description,
    banReasonSnapshot: data.banReasonSnapshot,
    status: "open",
    priority: data.priority || (data.category === "ban_appeal" ? "urgent" : "medium"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  ticketsCache.unshift(ticket);
  persistTickets();
  console.log(`[ServerSupportEngine] New ticket created: ${ticket.id} (${ticket.subject})`);
  return ticket;
}

export function replyServerTicket(
  ticketId: string,
  reply: string,
  repliedBy: string,
  newStatus?: "open" | "in_review" | "resolved" | "rejected"
): ServerSupportTicket | null {
  ensureInitialized();
  const ticket = ticketsCache.find((t) => t.id === ticketId);
  if (!ticket) return null;

  ticket.adminReply = reply;
  ticket.adminRepliedAt = new Date().toISOString();
  ticket.adminRepliedBy = repliedBy;
  ticket.updatedAt = new Date().toISOString();
  if (newStatus) ticket.status = newStatus;

  persistTickets();
  console.log(`[ServerSupportEngine] Ticket replied: ${ticketId} by ${repliedBy}`);
  return ticket;
}

export function deleteServerTicket(ticketId: string): boolean {
  ensureInitialized();
  const idx = ticketsCache.findIndex((t) => t.id === ticketId);
  if (idx === -1) return false;
  ticketsCache.splice(idx, 1);
  persistTickets();
  return true;
}

export function getServerSubmissions(status?: string): ServerCommunitySubmission[] {
  ensureInitialized();
  if (status) {
    return submissionsCache.filter((s) => s.status === status);
  }
  return [...submissionsCache];
}

export function createServerSubmission(data: {
  userEmail: string;
  userName: string;
  year: number;
  title: string;
  category: string;
  description: string;
  sourceUrl?: string;
}): ServerCommunitySubmission {
  ensureInitialized();
  const sub: ServerCommunitySubmission = {
    id: "sub_" + Date.now(),
    userEmail: data.userEmail.toLowerCase().trim(),
    userName: data.userName,
    year: data.year,
    title: data.title,
    category: data.category,
    description: data.description,
    sourceUrl: data.sourceUrl,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  submissionsCache.unshift(sub);
  persistSubmissions();
  return sub;
}

export function reviewServerSubmission(
  submissionId: string,
  status: "approved" | "rejected",
  reviewedBy: string
): ServerCommunitySubmission | null {
  ensureInitialized();
  const sub = submissionsCache.find((s) => s.id === submissionId);
  if (!sub) return null;
  sub.status = status;
  sub.reviewedAt = new Date().toISOString();
  sub.reviewedBy = reviewedBy;
  persistSubmissions();
  return sub;
}
