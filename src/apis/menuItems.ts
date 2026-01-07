import { API_BASE_URL, ApiError } from "@/apis/bookings";

export type MenuItemDto = {
	id: number;
	category: string;
	name: string;
	currency?: string;
	price_cents: number;
	duration_minutes: number;
};

export type ListMenuItemsResponse = {
	data: MenuItemDto[];
	total: number;
	offset: number;
	limit: number;
	has_more: boolean;
};

export type ListMenuItemsParams = {
	category?: string;
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

function buildQuery(params: Omit<ListMenuItemsParams, "signal">): string {
	const qp = new URLSearchParams();
	if (params.category && params.category.trim()) qp.set("category", params.category.trim());
	if (params.q && params.q.trim()) qp.set("q", params.q.trim());
	if (typeof params.offset === "number") qp.set("offset", String(params.offset));
	if (typeof params.limit === "number") qp.set("limit", String(params.limit));
	const s = qp.toString();
	return s ? `?${s}` : "";
}

/** Calls the backend route: GET /menu-items (h.ListMenuItems) */
export async function listMenuItems(params: ListMenuItemsParams = {}): Promise<ListMenuItemsResponse> {
	const { signal, ...rest } = params;
	const res = await fetch(`${API_BASE_URL}/menu-items${buildQuery(rest)}`, {
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

	return (await res.json()) as ListMenuItemsResponse;
}

/** Convenience helper to fetch all menu items via pagination. */
export async function listAllMenuItems(params: Omit<ListMenuItemsParams, "offset" | "limit"> & { pageSize?: number } = {}): Promise<MenuItemDto[]> {
	const pageSize = typeof params.pageSize === "number" && params.pageSize > 0 ? params.pageSize : 100;
	const items: MenuItemDto[] = [];

	let offset = 0;
	let safety = 0;
	while (safety < 50) {
		safety++;
		const page = await listMenuItems({
			category: params.category,
			q: params.q,
			offset,
			limit: pageSize,
			signal: params.signal,
		});
		items.push(...(page.data || []));
		if (!page.has_more) break;
		offset = page.offset + page.limit;
	}

	return items;
}
