import { API_BASE_URL, ApiError, getAdminAccessToken } from "@/apis/bookings";

export type CreateMenuItemRequest = {
	category: string;
	name: string;
	currency?: string;
	price_cents: number;
	duration_minutes: number;
};

export type UpdateMenuItemRequest = {
	category?: string;
	name?: string;
	currency?: string;
	price_cents?: number;
	duration_minutes?: number;
};

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

function extractErrorMessage(body: unknown, fallback: string): string {
	if (typeof body === "string" && body.trim()) return body;
	if (body && typeof body === "object") {
		const anyBody = body as any;
		if (typeof anyBody.error === "string" && anyBody.error.trim()) return anyBody.error;
		if (typeof anyBody.message === "string" && anyBody.message.trim()) return anyBody.message;
	}
	return fallback;
}

function getAuthHeader(): Record<string, string> {
	const accessToken = getAdminAccessToken();
	return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

/** Calls the backend route: POST /admin/menu-items (h.CreateMenuItem) */
export async function createAdminMenuItem(input: CreateMenuItemRequest) {
	const res = await fetch(`${API_BASE_URL}/admin/menu-items`, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			...getAuthHeader(),
		},
		body: JSON.stringify(input),
		credentials: "include",
	});

	if (!res.ok) {
		const body = await readErrorBody(res);
		const message = extractErrorMessage(body, res.statusText || "Request failed");
		throw new ApiError(message, res.status, body);
	}

	return (await res.json()) as unknown;
}

/** Calls the backend route: PUT /admin/menu-items/:id (h.UpdateMenuItem) */
export async function updateAdminMenuItem(id: number, input: UpdateMenuItemRequest) {
	const res = await fetch(`${API_BASE_URL}/admin/menu-items/${id}`, {
		method: "PUT",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			...getAuthHeader(),
		},
		body: JSON.stringify(input),
		credentials: "include",
	});

	if (!res.ok) {
		const body = await readErrorBody(res);
		const message = extractErrorMessage(body, res.statusText || "Request failed");
		throw new ApiError(message, res.status, body);
	}

	return (await res.json()) as unknown;
}

/** Calls the backend route: DELETE /admin/menu-items/:id (h.DeleteMenuItem) */
export async function deleteAdminMenuItem(id: number): Promise<void> {
	const res = await fetch(`${API_BASE_URL}/admin/menu-items/${id}`, {
		method: "DELETE",
		headers: {
			Accept: "application/json",
			...getAuthHeader(),
		},
		credentials: "include",
	});

	if (!res.ok) {
		const body = await readErrorBody(res);
		const message = extractErrorMessage(body, res.statusText || "Request failed");
		throw new ApiError(message, res.status, body);
	}
}
