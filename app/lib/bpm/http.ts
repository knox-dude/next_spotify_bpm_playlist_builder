import { sleep } from '../concurrency';

/** How many times to retry a request the provider rate-limited. */
const MAX_RATE_LIMIT_RETRIES = 3;

/** Cap on how long we'll honour a provider's Retry-After, in seconds. */
const MAX_RETRY_AFTER_SECONDS = 10;

/**
 * Fetches a URL, retrying only when the provider says we're going too fast.
 *
 * Both tempo providers are free services with per-IP quotas, and a library scan
 * now runs several lookups at once, so the occasional 429 is expected rather
 * than exceptional. Other failures (including 5xx) are handed straight back to
 * the caller, which knows whether the track is worth giving up on.
 *
 * @param url The URL to fetch.
 * @param init Standard fetch options.
 * @return The final response.
 */
export async function fetchWithRateLimitRetry(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, init);

    if (res.status !== 429 || attempt >= MAX_RATE_LIMIT_RETRIES) {
      return res;
    }

    // Providers that bother to say how long to wait get honoured; the rest get
    // an exponential back-off.
    const retryAfter = Number(res.headers.get('Retry-After'));
    const waitSeconds =
      Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(retryAfter, MAX_RETRY_AFTER_SECONDS)
        : Math.min(2 ** attempt * 0.5, MAX_RETRY_AFTER_SECONDS);

    await sleep(waitSeconds * 1000);
  }
}
