/**
 * Runs `worker` over every item, keeping at most `limit` calls in flight.
 *
 * Results come back in input order. A worker that throws yields `null` for that
 * item rather than failing the whole run — a single unreachable track should
 * never sink an entire library scan.
 *
 * @param items The items to process.
 * @param limit Maximum number of concurrent workers.
 * @param worker Async function applied to each item.
 * @return Results in the same order as `items`, with `null` where a call failed.
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<(R | null)[]> {
  const results: (R | null)[] = new Array(items.length).fill(null);
  let cursor = 0;

  const runners = Array.from(
    { length: Math.max(1, Math.min(limit, items.length)) },
    async () => {
      while (cursor < items.length) {
        const index = cursor++;
        try {
          results[index] = await worker(items[index], index);
        } catch {
          results[index] = null;
        }
      }
    },
  );

  await Promise.all(runners);
  return results;
}

/**
 * Splits an array into chunks of at most `chunkSize` items.
 *
 * @param array The array to split.
 * @param chunkSize Maximum size of each chunk.
 * @return An array of chunks.
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  if (chunkSize < 1) {
    throw new Error(`chunkSize must be at least 1, got ${chunkSize}`);
  }
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}
