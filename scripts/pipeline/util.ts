/** Small shared utilities for the pipeline. */

/** Run `fn` over `items` with at most `limit` in flight at once.
 * Results keep input order; individual failures reject that item's slot
 * only if `fn` throws (callers decide how to handle). */
export async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

/** Fetch JSON with one retry on rate-limit/server errors. */
export async function fetchJsonRetry(
  url: string,
  init?: RequestInit,
  backoffMs = 5000
): Promise<unknown> {
  const attempt = () => fetch(url, init);
  let res = await attempt();
  if ([429, 500, 502, 503].includes(res.status)) {
    await new Promise((r) => setTimeout(r, backoffMs + Math.random() * 2000));
    res = await attempt();
  }
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return res.json();
}
