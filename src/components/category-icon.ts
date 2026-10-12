import {
  Bird,
  Feather,
  Crown,
  Heart,
  Bird as BirdIcon,
  Music,
  AudioLines,
  Cat,
  Dog,
  Fish,
  Rabbit,
  Squirrel,
  Turtle,
  Box,
  Droplets,
  Wheat,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  macaw: Bird,
  "grey-parrot": Feather,
  cockatoo: Crown,
  cockatiel: Feather,
  lovebird: Heart,
  budgerigar: BirdIcon,
  finch: Feather,
  canary: Music,
  myna: AudioLines,
  pigeon: Bird,
  ornamental: Crown,
  cat: Cat,
  dog: Dog,
  fish: Fish,
  rabbit: Rabbit,
  rodents: Squirrel,
  reptiles: Turtle,
  cages: Box,
  "aquarium-gear": Droplets,
  food: Wheat,
  care: Sparkles,
};

export function getCategoryIcon(icon?: string): LucideIcon {
  return CATEGORY_ICONS[icon ?? ""] ?? Feather;
}
