import {
  ShieldCheck,
  MessageCircle,
  Gem,
  Lock,
  Sparkles,
  FileCheck2,
  House,
  Handshake,
  BadgeCheck,
  Phone,
  Feather,
  PawPrint,
  type LucideIcon,
} from "lucide-react";

export const CMS_ICONS: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  chat: MessageCircle,
  gem: Gem,
  lock: Lock,
  sparkles: Sparkles,
  file: FileCheck2,
  house: House,
  handshake: Handshake,
  badge: BadgeCheck,
  phone: Phone,
  feather: Feather,
  paw: PawPrint,
};

export function getCmsIcon(key: string, fallback: LucideIcon = Sparkles): LucideIcon {
  return CMS_ICONS[key] ?? fallback;
}
