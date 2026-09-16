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
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        credentials: "include",
        headers,
        signal: controller.signal,
      });

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
