import axios from "axios";

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";

const STATUS_MESSAGES: Record<number, string> = {
  400: "Please check the information and try again.",
  401: "Your session has expired. Please log in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested item was not found.",
  409: "This record already exists. Please check your details and try again.",
  429: "Too many requests. Please wait a moment and try again.",
  422: "Some information is invalid. Please check the form and try again.",
  500: "Something went wrong on our side. Please try again later.",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function cleanMessage(message: string) {
  const normalized = normalizeWhitespace(message);

  if (!normalized || normalized === "[object Object]") {
    return "";
  }

  const lower = normalized.toLowerCase();

  if (
    (normalized.startsWith("{") && normalized.endsWith("}")) ||
    (normalized.startsWith("[") && normalized.endsWith("]")) ||
    lower.includes('"statuscode"') ||
    lower.includes('"timestamp"') ||
    /cannot\s+(get|post|put|patch|delete)\s+\/api\//i.test(normalized) ||
    lower.includes("prisma") ||
    lower.includes("invocation") ||
    lower.includes("does not exist in the current database")
  ) {
    return "";
  }

  if (lower.includes("throttleexception") || lower.includes("too many requests")) {
    return STATUS_MESSAGES[429];
  }

  if (
    lower.includes("business email already registered") ||
    lower.includes("business email is already registered")
  ) {
    return "This email is already registered. Please use another email or log in.";
  }

  if (
    lower.includes("email already registered") ||
    lower.includes("email is already registered")
  ) {
    return "This email is already registered. Please use another email or log in.";
  }

  if (
    lower.includes("invalid credentials") ||
    lower.includes("invalid login") ||
    lower.includes("wrong password")
  ) {
    return "Invalid email or password. Please try again.";
  }

  if (lower === "network error" || lower.includes("failed to fetch")) {
    return "Unable to connect to the server. Please check your internet connection.";
  }

  return normalized;
}

function tryParseJsonString(value: string): unknown {
  const trimmed = value.trim();

  if (
    (!trimmed.startsWith("{") || !trimmed.endsWith("}")) &&
    (!trimmed.startsWith("[") || !trimmed.endsWith("]"))
  ) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function getStatusCode(value: unknown): number | null {
  if (!isRecord(value)) {
    return null;
  }

  const response = value.response;
  if (isRecord(response)) {
    const responseStatus = response.status ?? response.statusCode;
    if (typeof responseStatus === "number") {
      return responseStatus;
    }
  }

  const statusCode = value.statusCode ?? value.status;
  return typeof statusCode === "number" ? statusCode : null;
}

function extractMessage(value: unknown): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    const parsed = tryParseJsonString(value);

    if (parsed) {
      const parsedMessage = extractMessage(parsed);

      if (parsedMessage) {
        return parsedMessage;
      }
    }

    return cleanMessage(value);
  }

  if (value instanceof Error) {
    return cleanMessage(value.message);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => extractMessage(item))
      .filter(Boolean)
      .join("\n");
  }

  if (!isRecord(value)) {
    return "";
  }

  const nestedMessage = extractMessage(value.message);
  if (nestedMessage) {
    return nestedMessage;
  }

  const nestedError = extractMessage(value.error);
  if (nestedError) {
    return nestedError;
  }

  const nestedErrors = extractMessage(value.errors);
  if (nestedErrors) {
    return nestedErrors;
  }

  return "";
}

function getStatusFallback(statusCode: number | null, fallback: string) {
  if (statusCode && STATUS_MESSAGES[statusCode]) {
    return STATUS_MESSAGES[statusCode];
  }

  return fallback;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = DEFAULT_ERROR_MESSAGE,
): string {
  const statusCode = getStatusCode(error);

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Unable to connect to the server. Please check your internet connection.";
    }

    const data = error.response.data;
    const message = extractMessage(data);

    if (message) {
      return message;
    }

    return getStatusFallback(error.response.status, fallback);
  }

  if (isRecord(error) && isRecord(error.response)) {
    const responseData = error.response.data;
    const message = extractMessage(responseData);

    if (message) {
      return message;
    }

    return getStatusFallback(statusCode, fallback);
  }

  const message = extractMessage(error);

  if (message) {
    return message;
  }

  return getStatusFallback(statusCode, fallback);
}

export function getApiStatusCode(error: unknown) {
  return getStatusCode(error);
}

export function getErrorMessage(
  error: unknown,
  fallback = DEFAULT_ERROR_MESSAGE,
): string {
  return getApiErrorMessage(error, fallback);
}
