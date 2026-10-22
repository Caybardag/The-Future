import {
  db,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
} from "../lib/firebase";

export interface SponsorCampaign {
  id: string;
  brandName: string;
  title: string;
  description: string;
  targetUrl: string;
  categoryTag: string;
  ctaText: string;
  rewardCredits: number;
  placement: "all" | "in-feed" | "horizontal" | "profile_modal";
  startDate: string;
  endDate: string;
  isActive: boolean;
  clickCount: number;
  impressionCount: number;
  contactEmail?: string;
  createdAt: string;
}

export interface SponsorshipInquiry {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  websiteUrl?: string;
  budget?: string;
  targetPlacement: string;
  durationWeeks?: number;
  message: string;
  status: "new" | "contacted" | "approved" | "rejected";
  createdAt: string;
}

const CAMPAIGNS_LOCAL_KEY = "quantum_sponsor_campaigns_v2";
const INQUIRIES_LOCAL_KEY = "quantum_sponsor_inquiries_v2";

// Helper: Get local cached campaigns
export function getLocalSponsorCampaigns(): SponsorCampaign[] {
  try {
    const raw = localStorage.getItem(CAMPAIGNS_LOCAL_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Helper: Save local cached campaigns
export function setLocalSponsorCampaigns(campaigns: SponsorCampaign[]): void {
  try {
    localStorage.setItem(CAMPAIGNS_LOCAL_KEY, JSON.stringify(campaigns));
  } catch (e) {
    console.warn("Failed to write local sponsor campaigns:", e);
  }
}

// Fetch all active campaigns that haven't expired
export async function fetchActiveSponsorCampaigns(
  placement?: string
): Promise<SponsorCampaign[]> {
  let campaigns: SponsorCampaign[] = [];

  // Try Firestore first
  try {
    if (db) {
      const colRef = collection(db, "sponsor_campaigns");
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        campaigns = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        })) as SponsorCampaign[];
        setLocalSponsorCampaigns(campaigns);
      }
    }
  } catch (e) {
    console.warn("Firestore fetch for sponsor campaigns failed, using cache:", e);
  }

  // Fallback to local
  if (campaigns.length === 0) {
    campaigns = getLocalSponsorCampaigns();
  }

  const nowStr = new Date().toISOString().split("T")[0];

  // Filter active and valid dates
  return campaigns.filter((c) => {
    if (!c.isActive) return false;
    if (c.endDate && c.endDate < nowStr) return false;
    if (placement && c.placement !== "all" && c.placement !== placement) {
      return false;
    }
    return true;
  });
}

// Fetch all campaigns (for admin dashboard)
export async function fetchAllSponsorCampaigns(): Promise<SponsorCampaign[]> {
  let campaigns: SponsorCampaign[] = [];
  try {
    if (db) {
      const colRef = collection(db, "sponsor_campaigns");
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        campaigns = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        })) as SponsorCampaign[];
        setLocalSponsorCampaigns(campaigns);
        return campaigns;
      }
    }
  } catch (e) {
    console.warn("Firestore fetch error for admin campaigns:", e);
  }

  return getLocalSponsorCampaigns();
}

// Save or create a sponsor campaign (Admin only)
export async function saveSponsorCampaign(
  campaignData: Omit<SponsorCampaign, "id" | "clickCount" | "impressionCount" | "createdAt">,
  existingId?: string
): Promise<SponsorCampaign> {
  const newId = existingId || `sp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const fullCampaign: SponsorCampaign = {
    ...campaignData,
    id: newId,
    clickCount: 0,
    impressionCount: 0,
    createdAt: now,
  };

  // 1. Update Firestore
  try {
    if (db) {
      const docRef = doc(db, "sponsor_campaigns", newId);
      await setDoc(
        docRef,
        {
          ...fullCampaign,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (e) {
    console.warn("Firestore save error for sponsor campaign:", e);
  }

  // 2. Update Local Cache
  const current = getLocalSponsorCampaigns();
  const existingIdx = current.findIndex((c) => c.id === newId);
  if (existingIdx >= 0) {
    current[existingIdx] = {
      ...current[existingIdx],
      ...fullCampaign,
    };
  } else {
    current.unshift(fullCampaign);
  }
  setLocalSponsorCampaigns(current);

  return fullCampaign;
}

// Delete campaign (Admin only)
export async function deleteSponsorCampaign(id: string): Promise<void> {
  try {
    if (db) {
      await deleteDoc(doc(db, "sponsor_campaigns", id));
    }
  } catch (e) {
    console.warn("Firestore delete failed for campaign:", e);
  }

  const current = getLocalSponsorCampaigns().filter((c) => c.id !== id);
  setLocalSponsorCampaigns(current);
}

// Toggle Campaign Active status
export async function toggleCampaignActive(id: string, isActive: boolean): Promise<void> {
  try {
    if (db) {
      await updateDoc(doc(db, "sponsor_campaigns", id), { isActive });
    }
  } catch (e) {
    console.warn("Firestore toggle active failed:", e);
  }

  const current = getLocalSponsorCampaigns().map((c) =>
    c.id === id ? { ...c, isActive } : c
  );
  setLocalSponsorCampaigns(current);
}

// Record impression
export async function recordCampaignImpression(id: string): Promise<void> {
  try {
    const current = getLocalSponsorCampaigns();
    const item = current.find((c) => c.id === id);
    if (item) {
      item.impressionCount = (item.impressionCount || 0) + 1;
      setLocalSponsorCampaigns(current);
    }
  } catch {}
}

// Record click
export async function recordCampaignClick(id: string): Promise<void> {
  try {
    const current = getLocalSponsorCampaigns();
    const item = current.find((c) => c.id === id);
    if (item) {
      item.clickCount = (item.clickCount || 0) + 1;
      setLocalSponsorCampaigns(current);
    }
  } catch {}
}

// -------------------------------------------------------------
// SPONSORSHIP INQUIRIES (Lead Generation / "Reklam Ver" Form)
// -------------------------------------------------------------

export function getLocalSponsorshipInquiries(): SponsorshipInquiry[] {
  try {
    const raw = localStorage.getItem(INQUIRIES_LOCAL_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function setLocalSponsorshipInquiries(inquiries: SponsorshipInquiry[]): void {
  try {
    localStorage.setItem(INQUIRIES_LOCAL_KEY, JSON.stringify(inquiries));
  } catch (e) {
    console.warn("Failed to write local inquiries:", e);
  }
}

// Submit a new sponsorship inquiry from user
export async function submitSponsorshipInquiry(
  inquiry: Omit<SponsorshipInquiry, "id" | "status" | "createdAt">
): Promise<SponsorshipInquiry> {
  const newId = `inq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newRecord: SponsorshipInquiry = {
    ...inquiry,
    id: newId,
    status: "new",
    createdAt: now,
  };

  // 1. Firestore save
  try {
    if (db) {
      const docRef = doc(db, "sponsorship_inquiries", newId);
      await setDoc(docRef, {
        ...newRecord,
        createdAtTimestamp: serverTimestamp(),
      });
    }
  } catch (e) {
    console.warn("Firestore save error for sponsorship inquiry:", e);
  }

  // 2. Server-side notification trigger (sends log & potential email/webhook to warfacelove46@gmail.com)
  try {
    fetch("/api/sponsorship-inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRecord),
    }).catch((err) => console.warn("Inquiry notification ping error:", err));
  } catch {}

  // 3. Local save
  const current = getLocalSponsorshipInquiries();
  current.unshift(newRecord);
  setLocalSponsorshipInquiries(current);

  return newRecord;
}

// Fetch inquiries (Admin only)
export async function fetchSponsorshipInquiries(): Promise<SponsorshipInquiry[]> {
  let inquiries: SponsorshipInquiry[] = [];
  try {
    if (db) {
      const colRef = collection(db, "sponsorship_inquiries");
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        inquiries = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        })) as SponsorshipInquiry[];
        setLocalSponsorshipInquiries(inquiries);
        return inquiries;
      }
    }
  } catch (e) {
    console.warn("Firestore fetch for inquiries failed:", e);
  }

  return getLocalSponsorshipInquiries();
}

// Update inquiry status
export async function updateInquiryStatus(
  id: string,
  status: SponsorshipInquiry["status"]
): Promise<void> {
  try {
    if (db) {
      await updateDoc(doc(db, "sponsorship_inquiries", id), { status });
    }
  } catch (e) {
    console.warn("Firestore update error for inquiry status:", e);
  }

  const current = getLocalSponsorshipInquiries().map((inq) =>
    inq.id === id ? { ...inq, status } : inq
  );
  setLocalSponsorshipInquiries(current);
}
