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
};

export const getServiceDisplayName = (serviceId: number, variant: string): string => {
  const baseName = serviceNameMap[serviceId] || "Service";
  return `${baseName}${variant ? ` (${variant})` : ""}`;
};
