import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Map of service IDs to human-friendly names used across admin components
export const serviceNameMap: Record<number, string> = {
  1: "Knotless Braids",
  2: "Wig Install",
  3: "Soft Glam",
  4: "Bridal Makeup",
  5: "Gel Manicure",
  6: "Acrylic Full Set",
  7: "Senegalese Twists",
  8: "Soft Locs",
  9: "Butterfly Locs",
  10: "French Curls",
  11: "Cornrows (All Back)",
  12: "Stitch Cornrows",
  13: "Fulani Cornrows",
  14: "Passion Twists",
  15: "Kinky Twists",
  16: "Hermaid Braids",
  17: "Italy Curls",
  18: "Jayda Wayda",
  19: "Gypsy Locs",
  20: "Sew-ins",
  21: "Fulani Passion Twists",
};

export const getServiceDisplayName = (serviceId: number, variant: string): string => {
  const baseName = serviceNameMap[serviceId] || "Service";
  return `${baseName}${variant ? ` (${variant})` : ""}`;
};

export function normalizeText(text: string): string {
  const trimmed = text.trim();
  
  // Handle text with brackets: "box braids (short, small)" → "Box Braids(Short, Small)"
  const bracketMatch = trimmed.match(/^(.+?)\s*\((.+)\)$/);
  if (bracketMatch) {
    const beforeBracket = bracketMatch[1];
    const insideBracket = bracketMatch[2];
    
    // Normalize text before bracket
    const normalizedBefore = beforeBracket
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    
    // Normalize text inside bracket: capitalize first character, keep the rest
    const normalizedInside = insideBracket
      .split(/(\s*,\s*)/)
      .map((part) => {
        if (part.match(/^\s*,\s*$/)) return part; // Keep commas and spaces as-is
        return part
          .trim()
          .split(/\s+/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");
      })
      .join("");
    
    return `${normalizedBefore}(${normalizedInside})`;
  }
  
  // Normal text without brackets
  return trimmed
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
