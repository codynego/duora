import {
  Cloud,
  Flower2,
  Gem,
  Heart,
  Leaf,
  Moon,
  Orbit,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Waves,
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
];
const palettes = [
  ["bg-[#E9E1F1]", "text-[#7454A6]"],
  ["bg-[#DDE8D2]", "text-[#4F713D]"],
  ["bg-[#F7E4C2]", "text-[#9A6C2F]"],
  ["bg-[#E4E0F7]", "text-[#5D55A8]"],
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
