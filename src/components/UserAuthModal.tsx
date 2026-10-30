import React from "react";
import { FuturisticRegistrationGate } from "./FuturisticRegistrationGate";
import { X } from "lucide-react";

export interface UserProfile {
  id?: string;
  fullName?: string;
  displayName?: string;
  email: string;
  avatar?: string;
  phone?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  joinedDate?: string;
  credits?: number;
  plan?: "free" | "pro" | "quantum_vip";
  role?: "user" | "admin" | "superadmin";
  isBanned?: boolean;
  banReason?: string;
  unbanNoticePending?: boolean;
  isProbationRequired?: boolean;
  profession?: string;
  occupation?: string;
  career?: string;
  age?: number;
  city?: string;
  country?: string;
  lifeRole?: string;
  lifeRoleLabel?: string;
  primaryGoal?: string;
  personalGoal?: string;
  seniority?: string;
  employmentStatus?: string;
  industrySector?: string;
  [key: string]: any;
}

export function isUserProfileComplete(profile: Partial<UserProfile> | null | undefined): boolean {
  if (!profile) return false;
  return Boolean(
    profile.email &&
    (profile.displayName || profile.fullName || profile.name) &&
    (profile.profession || profile.occupation) &&
    profile.age &&
    profile.city
  );
}

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  onLoginSuccess?: (user: UserProfile) => void;
  onLogout?: () => void;
  onOpenAdmin?: () => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  onOpenAdmin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <FuturisticRegistrationGate
          onCompleteRegistration={(user) => {
            onLoginSuccess?.(user);
            onClose();
          }}
          onLoginExistingUser={(user) => {
            onLoginSuccess?.(user);
            onClose();
          }}
          onExploreAsGuest={onClose}
          onClose={onClose}
        />
      </div>
    </div>
  );
};
