export type SupportCategory =
  | "ban_appeal"
  | "login_issue"
  | "credit_issue"
  | "bug_report"
  | "feature_request"
  | "other";

export type TicketStatus = "open" | "in_review" | "resolved" | "rejected";
export type TicketPriority = "urgent" | "high" | "medium" | "low";

export interface SupportTicket {
  id: string; // e.g. "TK-84920"
  userId?: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  category: SupportCategory;
  categoryTitle: string;
  subject: string;
  description: string;
  banReasonSnapshot?: string;
  status: TicketStatus;
  priority: TicketPriority;
  adminReply?: string;
  adminRepliedAt?: string;
  adminRepliedBy?: string;
  createdAt: string;
  updatedAt: string;
}
