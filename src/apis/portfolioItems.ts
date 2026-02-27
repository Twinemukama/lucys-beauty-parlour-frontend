import { API_BASE_URL, ApiError } from "@/apis/bookings";

export type ServiceCategory = "hair" | "makeup" | "nails";

export type PortfolioItemDto = {
	id: number;
	category: ServiceCategory;
	style: string;
	description: string;
	images: string[];
};

export type ListPortfolioItemsResponse = {
	data: PortfolioItemDto[];
	total: number;
	offset: number;
	limit: number;
	has_more: boolean;
};

export type ListPortfolioItemsParams = {
	category?: ServiceCategory;
	min_rating?: number;
	q?: string;
	offset?: number;
	limit?: number;
	signal?: AbortSignal;
};

function extractErrorMessage(body: unknown, fallback: string): string {
	if (typeof body === "string" && body.trim()) return body;
	if (body && typeof body === "object") {
		const anyBody = body as any;
		if (typeof anyBody.error === "string" && anyBody.error.trim()) return anyBody.error;
		if (typeof anyBody.message === "string" && anyBody.message.trim()) return anyBody.message;
	}
	return fallback;
}

async function readErrorBody(response: Response): Promise<unknown> {
	const contentType = response.headers.get("content-type") || "";
	if (contentType.includes("application/json")) {
		try {
			return await response.json();
		} catch {
			return null;
		}
	}

	try {
		const text = await response.text();
		return text || null;
	} catch {
		return null;
	}
}

function buildQuery(params: Omit<ListPortfolioItemsParams, "signal">): string {
	const qp = new URLSearchParams();
	if (params.category) qp.set("category", params.category);
	if (typeof params.min_rating === "number") qp.set("min_rating", String(params.min_rating));
	if (params.q && params.q.trim()) qp.set("q", params.q.trim());
	if (typeof params.offset === "number") qp.set("offset", String(params.offset));
	if (typeof params.limit === "number") qp.set("limit", String(params.limit));
	const s = qp.toString();
	return s ? `?${s}` : "";
}

/** Calls the backend route: GET /portfolio (h.ListPortfolioItems) */
export async function listPortfolioItems(params: ListPortfolioItemsParams = {}): Promise<ListPortfolioItemsResponse> {
	const { signal, ...rest } = params;
	const res = await fetch(`${API_BASE_URL}/portfolio${buildQuery(rest)}`, {
		method: "GET",
		headers: {
			Accept: "application/json",
		},
		credentials: "include",
		signal,
	});

	if (!res.ok) {
		const body = await readErrorBody(res);
		const message = extractErrorMessage(body, res.statusText || "Request failed");
		throw new ApiError(message, res.status, body);
	}

	return (await res.json()) as ListPortfolioItemsResponse;
}

/** Calls the backend route: GET /portfolio/:id (h.GetPortfolioItem) */
export async function getPortfolioItem(id: number, signal?: AbortSignal): Promise<PortfolioItemDto> {
	const res = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
		method: "GET",
		headers: {
			Accept: "application/json",
		},
		credentials: "include",
		signal,
	});

	if (!res.ok) {
		const body = await readErrorBody(res);
		const message = extractErrorMessage(body, res.statusText || "Request failed");
		throw new ApiError(message, res.status, body);
	}

	return (await res.json()) as PortfolioItemDto;
}

/**
 * Resolve a portfolio item image URL.
 * If the string starts with "data:", assume it's already a data URI.
 * Otherwise, treat it as a relative path and prefix with the API base URL.
 */
export function resolvePortfolioItemImageUrl(image: string): string {
	if (image.startsWith("data:")) return image;
	if (image.startsWith("http://") || image.startsWith("https://")) return image;
	// Heuristic: if it looks like raw base64, wrap it with a data URI.
	const compact = image.trim();
	if (compact.length > 100 && !compact.includes("/") && !compact.includes("\\")) {
		return `data:image/jpeg;base64,${compact}`;
	}
	return `${API_BASE_URL}${image}`;
}
