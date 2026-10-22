import React from "react";
import {
  Bot,
  ShieldAlert,
  Zap,
  BrainCircuit,
  Glasses,
  Dna,
  Car,
  Stethoscope,
  Cpu,
  Utensils,
  Users,
  Sun,
  Headphones,
  HeartPulse,
  Atom,
  Globe,
  Sparkles,
  Coins,
  Radio,
  Infinity as InfinityIcon,
  CloudDownload,
  Activity,
  ShieldCheck,
  Compass,
  Network,
  Rocket,
  Orbit,
  Box,
  Scale,
  UserCheck,
  Wifi,
  Layers,
  GitFork,
  Crown,
  HelpCircle
} from "lucide-react";

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export const MilestoneIcon: React.FC<IconProps> = ({ name, className = "w-5 h-5", size = 20 }) => {
  switch (name) {
    case "Bot": return <Bot className={className} size={size} />;
    case "ShieldAlert": return <ShieldAlert className={className} size={size} />;
    case "Zap": return <Zap className={className} size={size} />;
    case "BrainCircuit": return <BrainCircuit className={className} size={size} />;
    case "Glasses": return <Glasses className={className} size={size} />;
    case "Dna": return <Dna className={className} size={size} />;
    case "Car": return <Car className={className} size={size} />;
    case "Stethoscope": return <Stethoscope className={className} size={size} />;
    case "Cpu": return <Cpu className={className} size={size} />;
    case "Utensils": return <Utensils className={className} size={size} />;
    case "Users": return <Users className={className} size={size} />;
    case "Sun": return <Sun className={className} size={size} />;
    case "Headphones": return <Headphones className={className} size={size} />;
    case "HeartPulse": return <HeartPulse className={className} size={size} />;
    case "Atom": return <Atom className={className} size={size} />;
    case "Globe": return <Globe className={className} size={size} />;
    case "Sparkles": return <Sparkles className={className} size={size} />;
    case "Coins": return <Coins className={className} size={size} />;
    case "Radio": return <Radio className={className} size={size} />;
    case "Infinity": return <InfinityIcon className={className} size={size} />;
    case "CloudDownload": return <CloudDownload className={className} size={size} />;
    case "Activity": return <Activity className={className} size={size} />;
    case "ShieldCheck": return <ShieldCheck className={className} size={size} />;
    case "Compass": return <Compass className={className} size={size} />;
    case "Network": return <Network className={className} size={size} />;
    case "Rocket": return <Rocket className={className} size={size} />;
    case "Orbit": return <Orbit className={className} size={size} />;
    case "Box": return <Box className={className} size={size} />;
    case "Scale": return <Scale className={className} size={size} />;
    case "UserCheck": return <UserCheck className={className} size={size} />;
    case "Wifi": return <Wifi className={className} size={size} />;
    case "Layers": return <Layers className={className} size={size} />;
    case "GitFork": return <GitFork className={className} size={size} />;
    case "Crown": return <Crown className={className} size={size} />;
    default: return <HelpCircle className={className} size={size} />;
  }
};
