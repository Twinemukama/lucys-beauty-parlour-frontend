const RAW_BASE_URL = (import.meta as any).env?.VITE_API_URL as string | undefined;
const DEFAULT_BASE_URL = "http://localhost:8000";

function normalizeBaseUrl(baseUrl: string): string {
	return baseUrl.replace(/\/+$/, "");
}

export const API_BASE_URL = normalizeBaseUrl(RAW_BASE_URL || DEFAULT_BASE_URL);

const ADMIN_ACCESS_TOKEN_STORAGE_KEY = "adminAccessToken";

export function getAdminAccessToken(): string | null {
	try {
		return localStorage.getItem(ADMIN_ACCESS_TOKEN_STORAGE_KEY);
	} catch {
		return null;
	}
}

export function setAdminAccessToken(token: string): void {
	try {
		localStorage.setItem(ADMIN_ACCESS_TOKEN_STORAGE_KEY, token);
	} catch {
		// ignore
	}
}

export function clearAdminAccessToken(): void {
	try {
		localStorage.removeItem(ADMIN_ACCESS_TOKEN_STORAGE_KEY);
	} catch {
		// ignore
	}
}

export class ApiError extends Error {
	status: number;
	body: unknown;

	constructor(message: string, status: number, body: unknown) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.body = body;
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

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type AdminLoginRequest = {
	email: string;
	password: string;
};

export type AdminLoginResponse = {
	access_token: string;
};

export type CreateAppointmentRequest = {
	customer_name: string;
	customer_email: string;
	customer_phone: string;
	staff_name?: string;
	service_id: number;
	service_description: string;
	date: string; // YYYY-MM-DD
	time: string; // HH:MM
	status: AppointmentStatus;
	notes?: string;
};

export type AppointmentDto = {
	id: number;
	customer_name: string;
	customer_email: string;
	customer_phone: string;
	staff_name: string;
	service_id: number;
	service_description: string;
	date: string;
	time: string;
	status: AppointmentStatus;
	notes?: string;
};

function coerceApposetintmentsPayload(payload: unknown): AppointmentDto[] {
	if (Array.isArray(payload)) return payload as AppointmentDto[];
	if (!payload || typeof payload !== "object") return [];

	const anyPayload = payload as any;
	if (Array.isArray(anyPayload.appointments)) return anyPayload.appointments as AppointmentDto[];
	if (Array.isArray(anyPayload.data)) return anyPayload.data as AppointmentDto[];
	if (Array.isArray(anyPayload.items)) return anyPayload.items as AppointmentDto[];
	if (Array.isArray(anyPayload.results)) return anyPayload.results as AppointmentDto[];
	if (Array.isArray(anyPayload.bookings)) return anyPayload.bookings as AppointmentDto[];

	// Some APIs wrap collections: { data: { appointments: [...] } }
	if (anyPayload.data && typeof anyPayload.data === "object") {
		if (Array.isArray(anyPayload.data.appointments)) return anyPayload.data.appointments as AppointmentDto[];
		if (Array.isArray(anyPayload.data.items)) return anyPayload.data.items as AppointmentDto[];
	}

	return [];
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

/** Calls the backend route: POST /admin/login (handlers.AdminLogin) */
export async function adminLogin(input: AdminLoginRequest): Promise<AdminLoginResponse> {
	const res = await fetch(`${API_BASE_URL}/admin/login`, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify(input),
		credentials: "include",
	});

	if (!res.ok) {
		const body = await readErrorBody(res);
		let message = extractErrorMessage(body, res.statusText || "Login failed");
		if (res.status === 401) {
			// Commonly returned by the backend when ADMIN_EMAIL / ADMIN_PASSWORD don't match.
			if (!message || message.toLowerCase() === "unauthorized") {
				message = "Invalid admin credentials.";
			}
			message += " (Check backend ADMIN_EMAIL/ADMIN_PASSWORD env vars.)";
		}
		throw new ApiError(message, res.status, body);
	}

	return (await res.json()) as AdminLoginResponse;
}

/** Calls the backend route: POST /appointments (h.CreateAppointment) */
export async function createAppointment(input: CreateAppointmentRequest): Promise<AppointmentDto> {
	const res = await fetch(`${API_BASE_URL}/appointments`, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify(input),
		credentials: "include",
	});

	if (!res.ok) {
		const body = await readErrorBody(res);
		const message = extractErrorMessage(body, res.statusText || "Request failed");
		throw new ApiError(message, res.status, body);
	}

	return (await res.json()) as AppointmentDto;
}

/** Calls the backend route: GET /admin/appointments (h.ListAppointments) */
export async function listAdminAppointments(): Promise<AppointmentDto[]> {
	const accessToken = getAdminAccessToken();
	const res = await fetch(`${API_BASE_URL}/admin/appointments`, {
		method: "GET",
		headers: {
			Accept: "application/json",
			...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
		},
		credentials: "include",
	});

	if (!res.ok) {
		const body = await readErrorBody(res);
		const message = extractErrorMessage(body, res.statusText || "Request failed");
		throw new ApiError(message, res.status, body);
	}

	const payload = (await res.json()) as unknown;
	return coerceApposetintmentsPayload(payload);
}

/**
 * Attempts to list appointments for a specific date.
 *
 * Backend does not expose a separate date-filter endpoint, so we use
 * GET /appointments and filter client-side.
 */
export async function listAppointmentsByDate(date: string): Promise<AppointmentDto[]> {
	const res = await fetch(`${API_BASE_URL}/appointments`, {
		method: "GET",
		headers: {
			Accept: "application/json",
		},
		credentials: "include",
	});

	if (!res.ok) {
		const body = await readErrorBody(res);
		const message = extractErrorMessage(body, res.statusText || "Request failed");
		throw new ApiError(message, res.status, body);
	}

	const payload = (await res.json()) as unknown;
	const items = coerceApposetintmentsPayload(payload);
	return items.filter((a) => a?.date === date);
}

