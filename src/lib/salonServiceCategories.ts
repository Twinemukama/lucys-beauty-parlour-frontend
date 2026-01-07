export const SALON_SERVICE_CATEGORIES = [
	"Hair Styling & Braiding",
	"Makeup Artistry",
	"Nails Studio",
] as const;

export type SalonServiceCategory = (typeof SALON_SERVICE_CATEGORIES)[number];
