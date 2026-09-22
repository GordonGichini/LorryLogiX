export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const normalizedBase = API_BASE_URL.replace(/\/$/, "");
  const target = new URL(path, `${normalizedBase}/`);

  const response = await fetch(target.toString(), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body && !(init.headers instanceof Headers) ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
    cache: init.cache ?? "no-store",
    next: init.next ?? { revalidate: 0 },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data && typeof data.message === "string"
        ? data.message
        : "The server could not complete the request.";
    throw new Error(message);
  }

  return data as T;
}
