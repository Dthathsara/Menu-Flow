import axios from "axios";

type ApiErrorData =
  | string
  | {
      message?: unknown;
      error?: unknown;
    };

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorData | undefined;

    if (typeof data === "string") return data;

    if (Array.isArray(data?.message)) {
      return data.message.join(", ");
    }

    if (typeof data?.message === "string") {
      return data.message;
    }

    if (typeof data?.error === "string") {
      return data.error;
    }

    return fallback;
  }

  if (error instanceof Error) return error.message;

  return fallback;
}
