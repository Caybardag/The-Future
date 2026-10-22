import React, { useEffect, useRef, useState } from "react";
import { Sparkles, ExternalLink, ShieldCheck, Zap, Mail, Megaphone, ArrowUpRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import {
  getTodaySponsorClickStats,
  recordSponsorClick,
  syncSponsorClickStatsFromServer,
  CREDITS_PER_SPONSOR_CLICK,
} from "../utils/rewardedAdTracker";
import { getApiHeaders, notifyClientCreditsUpdated } from "../utils/apiClient";
import {
  fetchActiveSponsorCampaigns,
  recordCampaignImpression,
  recordCampaignClick,
  SponsorCampaign,
} from "../services/sponsorService";
import { SponsorshipInquiryModal } from "./SponsorshipInquiryModal";

export interface AdBannerProps {
  slotId?: string;
  slot?: string;
  format?: "horizontal" | "in-feed" | "rectangle";
  className?: string;
  adClient?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slotId = "default-slot",
  format = "horizontal",
  className = "",
  adClient = "ca-pub-XXXXXXXXXXXXXXXX",
}) => {
  const { language } = useLanguage();
  const auth = useAuth();
  const isTr = language === "tr";

  const [campaigns, setCampaigns] = useState<SponsorCampaign[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<SponsorCampaign | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const adRef = useRef<HTMLModElement | null>(null);

  // Load real active campaigns from Firestore / local storage
  useEffect(() => {
    let isMounted = true;
    const loadCampaigns = async () => {
      const activeList = await fetchActiveSponsorCampaigns(format);
      if (isMounted) {
        setCampaigns(activeList);
        if (activeList.length > 0) {
          const picked = activeList[Math.floor(Math.random() * activeList.length)];
          setActiveCampaign(picked);
          recordCampaignImpression(picked.id);
        } else {
          setActiveCampaign(null);
        }
      }
    };
    loadCampaigns();
    return () => {
      isMounted = false;
    };
  }, [format]);

  const handleSponsorClick = async () => {
    if (!activeCampaign) return;
    try {
      recordCampaignClick(activeCampaign.id);
      if (!auth?.currentUser?.email) return;

      const claimId = `sponsor_banner_${activeCampaign.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const res = await fetch("/api/credits/claim-sponsor-click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getApiHeaders(),
        },
        body: JSON.stringify({
          email: auth.currentUser.email,
          campaignId: activeCampaign.id,
          claimId,
        }),
      });
      const data = await res.json();
      if (data?.success && typeof data.newCredits === "number") {
        notifyClientCreditsUpdated(data.newCredits);
        recordSponsorClick(auth.currentUser.email);
        syncSponsorClickStatsFromServer(auth.currentUser.email, {
          clickedToday: data.clickedToday,
          remainingToday: data.remainingToday,
        });
      }
    } catch (e) {
      console.warn("Failed to record sponsor click:", e);
    }
  };

  // Google AdSense auto injection
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch {}
  }, []);

  // -------------------------------------------------------------
  // RENDER: Active Real Sponsor Campaign Exists
  // -------------------------------------------------------------
  if (activeCampaign) {
    if (format === "in-feed") {
      return (
        <div
          className={`relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-[#120e2e]/90 via-[#0e0a24]/90 to-[#120e2e]/90 p-4 sm:p-5 backdrop-blur-xl shadow-lg transition-all ${className}`}
        >
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
              <Sparkles className="w-3 h-3" />
              <span>{isTr ? "Sponsorlu Vitrin" : "Sponsored Partner"}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{activeCampaign.brandName}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white font-mono">{activeCampaign.title}</h4>
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/30">
                    {activeCampaign.categoryTag}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans mt-0.5 line-clamp-2 leading-relaxed">
                  {activeCampaign.description}
                </p>
              </div>
            </div>

            <a
              href={activeCampaign.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleSponsorClick}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 self-end sm:self-center"
            >
              <span>{activeCampaign.ctaText || (isTr ? "İncele" : "Explore")}</span>
              <span className="text-[10px] text-emerald-300 font-normal">
                (+{activeCampaign.rewardCredits || CREDITS_PER_SPONSOR_CLICK})
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      );
    }

    // Horizontal format with active campaign
    return (
      <div
        className={`relative w-full rounded-2xl border border-purple-500/20 bg-[#0d0922]/80 backdrop-blur-md p-3 text-center overflow-hidden shadow-md my-4 ${className}`}
      >
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2 px-1">
          <span className="flex items-center gap-1 text-amber-400/80">
            <Sparkles className="w-3 h-3" />
            <span>{isTr ? "Sponsorlu Alan" : "Sponsored Slot"}</span>
          </span>
          <span className="text-[9px] text-purple-300/80 font-mono">{activeCampaign.brandName}</span>
        </div>

        <div className="py-2 flex flex-wrap items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200 font-mono">{activeCampaign.title}</div>
              <div className="text-[11px] text-slate-400 font-sans hidden sm:block">
                {activeCampaign.description}
              </div>
            </div>
          </div>

          <a
            href={activeCampaign.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleSponsorClick}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <span>{activeCampaign.ctaText || (isTr ? "İncele" : "Visit")}</span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              (+{activeCampaign.rewardCredits || CREDITS_PER_SPONSOR_CLICK})
            </span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: NO ACTIVE SPONSOR (Empty Slot -> Reklam Ver / Sponsor Ol)
  // No fake/mock data is displayed. Clear option to advertise!
  // -------------------------------------------------------------
  return (
    <>
      <div
        className={`relative overflow-hidden rounded-2xl border border-dashed border-purple-500/30 bg-gradient-to-r from-purple-950/20 via-slate-900/40 to-indigo-950/20 p-4 backdrop-blur-md transition-all hover:border-purple-500/50 ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 shrink-0">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
                  {isTr ? "Sponsorluk Alanı Müsait" : "Ad Space Available"}
                </span>
                <span className="text-xs font-bold text-white font-mono">
                  {isTr ? "Buraya Reklam Verin" : "Advertise Here"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                {isTr
                  ? "Markanızı, yapay zeka ürününüzü veya projenizi teknoloji vizyonerlerine duyurun."
                  : "Promote your brand, AI tools, or tech projects to technology pioneers."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => setIsInquiryModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/40 text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-purple-900/30 transition-all cursor-pointer"
            >
              <Megaphone className="w-3.5 h-3.5 text-amber-300" />
              <span>{isTr ? "Reklam & Sponsor Olun" : "Sponsor This Slot"}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Inquiry modal */}
      <SponsorshipInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        defaultPlacement={format}
      />
    </>
  );
};

