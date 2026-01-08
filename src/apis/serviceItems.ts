import { API_BASE_URL, ApiError } from "@/apis/bookings";

export type ServiceCategory = "hair" | "makeup" | "nails";

export type ServiceItemDto = {
	id: number;
	service: ServiceCategory;
	name: string;
	descriptions: string[];
	images: string[];
	rating: number;
};

export type ListServiceItemsResponse = {
	data: ServiceItemDto[];
	total: number;
	offset: number;
	limit: number;
	has_more: boolean;
};

export type ListServiceItemsParams = {
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

function buildQuery(params: Omit<ListServiceItemsParams, "signal">): string {
	const qp = new URLSearchParams();
	if (params.category) qp.set("category", params.category);
	if (typeof params.min_rating === "number") qp.set("min_rating", String(params.min_rating));
	if (params.q && params.q.trim()) qp.set("q", params.q.trim());
	if (typeof params.offset === "number") qp.set("offset", String(params.offset));
	if (typeof params.limit === "number") qp.set("limit", String(params.limit));
	const s = qp.toString();
	return s ? `?${s}` : "";
}

/** Calls the backend route: GET /services (h.ListServiceItems) */
export async function listServiceItems(params: ListServiceItemsParams = {}): Promise<ListServiceItemsResponse> {
	const { signal, ...rest } = params;
	const res = await fetch(`${API_BASE_URL}/services${buildQuery(rest)}`, {
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

	return (await res.json()) as ListServiceItemsResponse;
}

/** Calls the backend route: GET /services/:id (h.GetServiceItem) */
export async function getServiceItem(id: number, signal?: AbortSignal): Promise<ServiceItemDto> {
	const res = await fetch(`${API_BASE_URL}/services/${id}`, {
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

	return (await res.json()) as ServiceItemDto;
}

export function resolveServiceItemImageUrl(pathOrUrl: string): string {
	const s = (pathOrUrl || "").trim();
	if (!s) return "";
	if (/^https?:\/\//i.test(s)) return s;
	if (s.startsWith("data:")) return s;
	if (s.startsWith("/")) return `${API_BASE_URL}${s}`;
	return `${API_BASE_URL}/${s}`;
}
