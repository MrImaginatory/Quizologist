export function createFetcher(token: string | null) {
  return async (url: string) => {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Fetch failed');
    return res.json();
  };
}

export const swrOptions = {
  revalidateOnFocus: true,
  dedupingInterval: 30000,
};
