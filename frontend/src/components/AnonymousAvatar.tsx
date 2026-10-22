import {
  Cloud,
  CloudSun,
  Compass,
  Feather,
  Flower2,
  Gem,
  Heart,
  Leaf,
  Moon,
  MoonStar,
  Mountain,
  Orbit,
  CircleDashed,
  TreePine,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Sunrise,
  Waves,
  Zap,
} from "lucide-react";

const symbols = [
  Moon,
  Leaf,
  Sun,
  Sparkles,
  Star,
  Flower2,
  Orbit,
  Sprout,
  Cloud,
  Waves,
  Gem,
  Heart,
  Compass,
  Feather,
  Mountain,
  TreePine,
  Zap,
  MoonStar,
  CircleDashed,
  CloudSun,
  Sunrise,
];
const palettes = [
  ["bg-[#E9E1F1]", "text-[#7454A6]"],
  ["bg-[#DDE8D2]", "text-[#4F713D]"],
  ["bg-[#F7E4C2]", "text-[#9A6C2F]"],
  ["bg-[#E4E0F7]", "text-[#5D55A8]"],
  ["bg-[#F2DDE4]", "text-[#9A4F6A]"],
  ["bg-[#D8E9E8]", "text-[#3F7774]"],
];

export default function AnonymousAvatar({
  variant = 0,
  size = "md",
  className = "",
}: {
  variant?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon = symbols[Math.abs(variant) % symbols.length];
  const [background, color] = palettes[Math.abs(variant) % palettes.length];
  const dimensions =
    size === "lg" ? "h-16 w-16" : size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const iconSize =
    size === "lg" ? "h-7 w-7" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full ${dimensions} ${background} ${color} ${className}`}
    >
      <Icon className={iconSize} strokeWidth={1.8} />
    </span>
  );
}
