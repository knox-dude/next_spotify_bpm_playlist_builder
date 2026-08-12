import fetch from 'jest-fetch-mock';
import {
  RECCOBEATS_BATCH_SIZE,
  fetchTempoBatch,
} from '../../lib/bpm/reccobeats';
import { fetchTempoByIsrc } from '../../lib/bpm/deezer';
import { chunkArray, mapWithConcurrency } from '../../lib/bpm/concurrency';

/** Builds a ReccoBeats-shaped response item for a Spotify track id. */
const reccoItem = (spotifyId: string, tempo: number | null) => ({
  id: `uuid-${spotifyId}`,
  href: `https://open.spotify.com/track/${spotifyId}`,
  tempo,
});

beforeEach(() => {
  fetch.resetMocks();
});

describe('reccobeats.fetchTempoBatch', () => {
  it('keys results by the Spotify id parsed out of href', async () => {
    fetch.mockResponse(
      JSON.stringify({
        content: [reccoItem('trackA', 128.5), reccoItem('trackB', 90)],
      }),
    );

    const result = await fetchTempoBatch(['trackA', 'trackB']);

    expect(result.get('trackA')).toEqual({
      id: 'trackA',
      tempo: 128.5,
      source: 'reccobeats',
    });
    expect(result.get('trackB')?.tempo).toBe(90);
  });

  it('omits tracks ReccoBeats has no tempo for', async () => {
    fetch.mockResponse(
      JSON.stringify({
        content: [reccoItem('trackA', 128.5), reccoItem('trackB', 0)],
      }),
    );

    const result = await fetchTempoBatch(['trackA', 'trackB', 'trackC']);

    expect(result.size).toBe(1);
    expect(result.has('trackB')).toBe(false);
    expect(result.has('trackC')).toBe(false);
  });

  it('returns an empty map without calling the API for no ids', async () => {
    const result = await fetchTempoBatch([]);

    expect(result.size).toBe(0);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects batches larger than the API allows', async () => {
    const tooMany = Array.from(
      { length: RECCOBEATS_BATCH_SIZE + 1 },
      (_, i) => `track${i}`,
    );

    await expect(fetchTempoBatch(tooMany)).rejects.toThrow(
      /at most 40 ids per request/,
    );
  });

  it('throws on a non-OK response', async () => {
    fetch.mockResponse('', { status: 503 });

    await expect(fetchTempoBatch(['trackA'])).rejects.toThrow(/503/);
  });
});

describe('deezer.fetchTempoByIsrc', () => {
  it('returns the tempo for a known ISRC', async () => {
    fetch.mockResponse(JSON.stringify({ bpm: 141.1, title: 'Some Song' }));

    const result = await fetchTempoByIsrc('trackA', 'GBUM71029604');

    expect(result).toEqual({ id: 'trackA', tempo: 141.1, source: 'deezer' });
  });

  it('treats a zero BPM as unknown', async () => {
    fetch.mockResponse(JSON.stringify({ bpm: 0, title: 'Some Song' }));

    expect(await fetchTempoByIsrc('trackA', 'GBAHT1901299')).toBeNull();
  });

  it('handles Deezer reporting an error inside a 200 response', async () => {
    fetch.mockResponse(JSON.stringify({ error: { code: 800 } }));

    expect(await fetchTempoByIsrc('trackA', 'NOPE')).toBeNull();
  });
});

describe('concurrency helpers', () => {
  it('chunkArray splits to the requested size', () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('chunkArray rejects a nonsensical chunk size', () => {
    expect(() => chunkArray([1, 2], 0)).toThrow(/at least 1/);
  });

  it('mapWithConcurrency preserves input order', async () => {
    const result = await mapWithConcurrency([3, 1, 2], 2, async (n) => n * 10);

    expect(result).toEqual([30, 10, 20]);
  });

  it('mapWithConcurrency isolates a failing item as null', async () => {
    const result = await mapWithConcurrency([1, 2, 3], 2, async (n) => {
      if (n === 2) {
        throw new Error('boom');
      }
      return n;
    });

    expect(result).toEqual([1, null, 3]);
  });

  it('mapWithConcurrency never exceeds the limit', async () => {
    let active = 0;
    let peak = 0;

    await mapWithConcurrency(
      Array.from({ length: 20 }, (_, i) => i),
      3,
      async () => {
        active += 1;
        peak = Math.max(peak, active);
        await new Promise((resolve) => setTimeout(resolve, 1));
        active -= 1;
      },
    );

    expect(peak).toBeLessThanOrEqual(3);
  });
});

describe('bpm.getTempos cascade', () => {
  /** The cache lives at module scope, so each test needs a fresh module. */
  const freshGetTempos = async () => {
    let getTempos!: typeof import('../../lib/bpm').getTempos;
    await jest.isolateModulesAsync(async () => {
      ({ getTempos } = await import('../../lib/bpm'));
    });
    return getTempos;
  };

  it('falls back to Deezer only for tracks ReccoBeats missed', async () => {
    const getTempos = await freshGetTempos();

    fetch.mockResponses(
      // Pass 1: ReccoBeats knows trackA but not trackB.
      [JSON.stringify({ content: [reccoItem('trackA', 120)] }), { status: 200 }],
      // Pass 2: Deezer resolves trackB by ISRC.
      [JSON.stringify({ bpm: 95 }), { status: 200 }],
    );

    const result = await getTempos([
      { id: 'trackA', isrc: 'ISRC_A' },
      { id: 'trackB', isrc: 'ISRC_B' },
    ]);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result).toContainEqual({
      id: 'trackA',
      tempo: 120,
      source: 'reccobeats',
    });
    expect(result).toContainEqual({
      id: 'trackB',
      tempo: 95,
      source: 'deezer',
    });
  });

  it('does not call Deezer for tracks with no ISRC', async () => {
    const getTempos = await freshGetTempos();

    fetch.mockResponse(JSON.stringify({ content: [] }));

    const result = await getTempos([{ id: 'trackA', isrc: null }]);

    expect(result).toEqual([]);
    // Only the ReccoBeats batch; no ISRC means no fallback to attempt.
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('de-duplicates repeated tracks before looking them up', async () => {
    const getTempos = await freshGetTempos();

    fetch.mockResponse(
      JSON.stringify({ content: [reccoItem('trackA', 120)] }),
    );

    const result = await getTempos([
      { id: 'trackA', isrc: 'ISRC_A' },
      { id: 'trackA', isrc: 'ISRC_A' },
      { id: 'trackA', isrc: 'ISRC_A' },
    ]);

    expect(result).toHaveLength(1);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('serves repeat lookups from cache without refetching', async () => {
    const getTempos = await freshGetTempos();

    fetch.mockResponse(
      JSON.stringify({ content: [reccoItem('trackA', 120)] }),
    );

    await getTempos([{ id: 'trackA', isrc: 'ISRC_A' }]);
    const second = await getTempos([{ id: 'trackA', isrc: 'ISRC_A' }]);

    expect(second).toEqual([
      { id: 'trackA', tempo: 120, source: 'reccobeats' },
    ]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('caches known misses so they are not retried', async () => {
    const getTempos = await freshGetTempos();

    fetch.mockResponses(
      [JSON.stringify({ content: [] }), { status: 200 }],
      [JSON.stringify({ error: { code: 800 } }), { status: 200 }],
    );

    await getTempos([{ id: 'trackA', isrc: 'ISRC_A' }]);
    expect(fetch).toHaveBeenCalledTimes(2);

    const second = await getTempos([{ id: 'trackA', isrc: 'ISRC_A' }]);
    expect(second).toEqual([]);
    // Still 2 - the miss was remembered.
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('survives a ReccoBeats outage by falling through to Deezer', async () => {
    const getTempos = await freshGetTempos();

    fetch.mockResponses(
      ['', { status: 500 }],
      [JSON.stringify({ bpm: 100 }), { status: 200 }],
    );

    const result = await getTempos([{ id: 'trackA', isrc: 'ISRC_A' }]);

    expect(result).toEqual([{ id: 'trackA', tempo: 100, source: 'deezer' }]);
  });
});
