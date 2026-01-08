import { API_BASE_URL, ApiError, getAdminAccessToken } from "@/apis/bookings";
import type { ServiceCategory, ServiceItemDto } from "@/apis/serviceItems";

export type CreateServiceItemRequest = {
	service: ServiceCategory;
	name: string;
	descriptions: string[];
	images: string[]; // base64 strings (supports data URI prefix)
	rating?: number;
};

export type UpdateServiceItemRequest = {
	service?: ServiceCategory;
	name?: string;
	descriptions?: string[];
	images?: string[]; // if provided: base64 strings (supports data URI prefix)
	rating?: number;
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

/** Calls the backend route: POST /admin/services (h.CreateServiceItem) */
export async function createAdminServiceItem(input: CreateServiceItemRequest): Promise<ServiceItemDto> {
	const res = await fetch(`${API_BASE_URL}/admin/services`, {
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

	return (await res.json()) as ServiceItemDto;
}

/** Calls the backend route: PUT /admin/services/:id (h.UpdateServiceItem) */
export async function updateAdminServiceItem(id: number, input: UpdateServiceItemRequest): Promise<ServiceItemDto> {
	const res = await fetch(`${API_BASE_URL}/admin/services/${id}`, {
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

	return (await res.json()) as ServiceItemDto;
}

/** Calls the backend route: DELETE /admin/services/:id (h.DeleteServiceItem) */
export async function deleteAdminServiceItem(id: number): Promise<void> {
	const res = await fetch(`${API_BASE_URL}/admin/services/${id}`, {
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
