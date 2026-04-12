// Shared fetch wrapper — auto-adds X-Timezone header on all API calls
// Per D3-Q12: all authenticated API calls send the user's timezone

function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

export async function api(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set("X-Timezone", getTimezone());
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(url, { ...options, headers });
}
