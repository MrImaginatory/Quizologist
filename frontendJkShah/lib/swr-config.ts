import { silentRefresh } from "./api/client";

const abortControllers = new Map<string, AbortController>();

export function createFetcher(_unused?: any) {
  return async (url: string) => {
    const baseUrl = url.split('?')[0];

    if (abortControllers.has(baseUrl)) {
      abortControllers.get(baseUrl)?.abort();
    }

    const controller = new AbortController();
    abortControllers.set(baseUrl, controller);

    try {
      // MED-02: no token handling here at all — the HttpOnly access cookie is
      // sent automatically (same-origin via the /api proxy). MED-05: if the
      // 15-minute access cookie has expired, refresh once and retry.
      const doFetch = () =>
        fetch(url, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });

      let res = await doFetch();
      if (res.status === 401 && (await silentRefresh())) {
        res = await doFetch();
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Fetch failed');
      }

      return await res.json();
    } catch (error: any) {
      throw error;
    } finally {
      if (abortControllers.get(baseUrl) === controller) {
        abortControllers.delete(baseUrl);
      }
    }
  };
}

export const swrOptions = {
  revalidateOnFocus: true,
  dedupingInterval: 30000,
};
