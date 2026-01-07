import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listAllMenuItems, type MenuItemDto } from "@/apis/menuItems";
import { Scissors, Heart, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SALON_SERVICE_CATEGORIES } from "@/lib/salonServiceCategories";

function formatDurationMinutes(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return hours === 1 ? "1 hr" : `${hours} hrs`;
  return `${hours} hr ${mins} min`;
}

function formatPriceFromCents(priceCents: number, currency?: string): string {
  const ccy = (currency || "UGX").trim() || "UGX";
  const amount = Number(priceCents) / 100;

  try {
    // If the currency code is valid, this produces nice locale-aware formatting.
    const formatted = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: ccy,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);

    // Intl sometimes includes the currency symbol/code already; keep as-is.
    return formatted;
  } catch {
    // Fallback for non-ISO currency codes.
    const formatted = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
    return `${ccy} ${formatted}`;
  }
}

function groupByCategory(items: MenuItemDto[]): Array<{ category: string; items: MenuItemDto[] }> {
  const map = new Map<string, MenuItemDto[]>();
  for (const it of items) {
    const key = (it.category || "").trim() || "Other";
    const existing = map.get(key);
    if (existing) existing.push(it);
    else map.set(key, [it]);
  }

  // Deterministic category ordering: known salon services first, then any extra categories.
  const known = [...SALON_SERVICE_CATEGORIES];
  const extras = Array.from(map.keys())
    .filter((k) => !known.includes(k as any))
    .sort((a, b) => a.localeCompare(b));

  const orderedCategories = [...known, ...extras].filter((k) => map.has(k));

  return orderedCategories.map((category) => {
    const grouped = map.get(category) || [];
    grouped.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return { category, items: grouped };
  });
}

function iconForCategory(category: string) {
  const s = (category || "").toLowerCase();
  if (s.includes("makeup")) return Heart;
  if (s.includes("nail")) return Sparkles;
  if (s.includes("hair") || s.includes("braid")) return Scissors;
  return Sparkles;
}

export const PricingMenu = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["menu-items", "grouped"],
    queryFn: async () => {
      const items = await listAllMenuItems({ pageSize: 100 });
      return groupByCategory(items);
    },
    staleTime: 60_000,
    retry: 1,
  });

  return (
    <section id="pricing" className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="font-playfair text-5xl md:text-6xl font-bold text-foreground mb-4">
            Our Menu
          </h2>
          <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
            Transparent pricing for all our premium beauty services
          </p>
          {isLoading ? (
            <p className="font-inter text-sm text-muted-foreground mt-4">Loading menu…</p>
          ) : null}
          {isError ? (
            <p className="font-inter text-sm text-muted-foreground mt-4">
              Could not load the latest menu right now.
            </p>
          ) : null}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(data || []).map((category, index) => {
					const Icon = iconForCategory(category.category);
            return (
            <Card
              key={category.category}
              className="border-border bg-card hover:shadow-elegant transition-smooth animate-in fade-in slide-in-from-bottom-8 duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-primary">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="font-playfair text-2xl text-foreground">
                    {category.category}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.items.map((item) => (
                  <div
                    key={String(item.id ?? item.name)}
                    className="flex justify-between items-start py-3 border-b border-border/50 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-inter font-medium text-foreground">
                        {item.name}
                      </p>
                      <p className="font-inter text-sm text-muted-foreground">
                        {formatDurationMinutes(item.duration_minutes)}
                      </p>
                    </div>
                    <span className="font-playfair text-lg font-semibold text-primary">
                      {formatPriceFromCents(item.price_cents, item.currency)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
            );
          })}
        </div>

        <p className="text-center mt-12 font-inter text-sm text-muted-foreground">
          * Prices may vary based on hair length and complexity. Contact us for a personalized quote.
        </p>
      </div>
    </section>
  );
};
