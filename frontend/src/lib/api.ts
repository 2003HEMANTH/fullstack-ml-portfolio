import axios from "axios";

export interface ErrorDetail { field: string; message: string }
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details: ErrorDetail[] = [],
    public status?: number,
    public requestId?: string,
  ) { super(message); this.name = "ApiError"; }
}
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (!axios.isAxiosError<unknown>(error)) return new ApiError("UNKNOWN_ERROR", "Something went wrong. Please try again.");
  const status = error.response?.status;
  const payload = error.response?.data;
  const envelope = record(payload) && record(payload.error) ? payload.error : undefined;
  const details: ErrorDetail[] = [];
  if (Array.isArray(envelope?.details)) {
    for (const detail of envelope.details) {
      if (record(detail) && typeof detail.message === "string") {
        details.push({ field: typeof detail.field === "string" ? detail.field : typeof detail.path === "string" ? detail.path : "", message: detail.message });
      }
    }
  }
  const code = status === 429 ? "RATE_LIMITED" : typeof envelope?.code === "string" ? envelope.code : status ? "HTTP_ERROR" : "NETWORK_ERROR";
  const message = status === 429 ? "Too many attempts. Try again in a few minutes."
    : typeof envelope?.message === "string" && envelope.message ? envelope.message
    : status ? "The request failed. Please try again." : "Unable to reach the service. Please try again shortly.";
  return new ApiError(code, message, details, status, typeof envelope?.requestId === "string" ? envelope.requestId : undefined);
}

export function errorMessage(error: unknown): string {
  const normalized = normalizeApiError(error);
  const fields = normalized.details.map((detail) => `${detail.field ? `${detail.field}: ` : ""}${detail.message}`).join("; ");
  return fields ? `${normalized.message} ${fields}` : normalized.message;
}

function createClient(baseURL: string | undefined, withCredentials: boolean) {
  const client = axios.create({ baseURL: baseURL?.replace(/\/+$/, ""), withCredentials, timeout: 90_000 });
  client.interceptors.request.use((config) => {
    if (!config.baseURL) throw new ApiError("CONFIGURATION_ERROR", "The service URL is not configured.");
    return config;
  });
  client.interceptors.response.use((response) => response, (error: unknown) => Promise.reject(normalizeApiError(error)));
  return client;
}

const api = createClient(process.env.NEXT_PUBLIC_API_URL, true);
export const mlApi = createClient(process.env.NEXT_PUBLIC_ML_URL, false);

export function mlErrorMessage(error: unknown): string {
  const normalized = normalizeApiError(error);
  if (normalized.status === 413) return "File too large. Maximum 5MB.";
  const messages: Record<string, string> = {
    FILE_NOT_PDF: "That file isn't a PDF.",
    RESUME_NOT_TEXT: "This looks like a scanned image. Export your resume as a text-based PDF from Word or Google Docs.",
    PDF_NO_TEXT: "This looks like a scanned image. Export your resume as a text-based PDF from Word or Google Docs.",
    PARSE_TIMEOUT: "That PDF took too long to read. Try a simpler layout.",
    PDF_ENCRYPTED: "This PDF is password-protected. Remove the password.",
    NETWORK_ERROR: "The analyzer is unreachable. Try again shortly.",
  };
  return messages[normalized.code] || errorMessage(normalized);
}
export default api;
