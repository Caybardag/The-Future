import React, { useState, useEffect } from "react";
import { Megaphone, PlusCircle, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";
import { fetchActiveSponsorCampaigns, SponsorCampaign } from "../services/sponsorService";

export const AdminSponsorshipManager: React.FC = () => {
  const [campaigns, setCampaigns] = useState<SponsorCampaign[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchActiveSponsorCampaigns()
      .then((c) => setCampaigns(c))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-5 space-y-4 font-sans text-xs">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-amber-400" />
          <h4 className="font-bold text-white text-sm">Sponsorluk & Kampanya Yönetimi</h4>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] border border-amber-500/30">
          {campaigns.length} Aktif Kampanya
        </span>
      </div>

      <div className="space-y-2">
        {campaigns.map((c) => (
          <div key={c.id} className="p-3.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
            <div>
              <span className="font-bold text-white text-xs block">{c.brandName} — {c.title}</span>
              <p className="text-[11px] text-slate-400 mt-0.5">{c.description}</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] border border-emerald-500/30">
              +{c.rewardCredits} Kredi
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
