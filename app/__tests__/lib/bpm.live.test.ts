/**
 * @jest-environment node
 *
 * Live contract tests against the real BPM providers.
 *
 * These are skipped by default because they hit third-party services over the
 * network. Run them when a provider looks like it may have changed shape:
 *
 *   RUN_LIVE_BPM_TESTS=1 npx jest bpm.live
 *
 * They exist because the whole app depends on undocumented behaviour of a free
 * third-party API - if ReccoBeats stops echoing the Spotify id in `href`, or
 * caps batches below 40, everything silently returns zero results.
 */
import { fetchTempoByIsrc } from '../../lib/bpm/deezer';
import {
  RECCOBEATS_BATCH_SIZE,
  fetchTempoBatch,
} from '../../lib/bpm/reccobeats';

const live = process.env.RUN_LIVE_BPM_TESTS ? describe : describe.skip;

// Well-known, stable catalogue entries.
const BLINDING_LIGHTS = '0VjIjW4GlUZAMYd2vXMi3b'; // ~171 BPM
const BOHEMIAN_RHAPSODY_ISRC = 'GBUM71029604'; // ~141 BPM

live('ReccoBeats (live)', () => {
  beforeAll(() => {
    // jest.setup.js installs a fetch mock globally; these tests need the real one.
    const mock = global.fetch as unknown as { dontMock?: () => void };
    mock.dontMock?.();
  });

  it('returns a plausible tempo keyed by Spotify id', async () => {
    const result = await fetchTempoBatch([BLINDING_LIGHTS]);

    const analysis = result.get(BLINDING_LIGHTS);
    expect(analysis).toBeDefined();
    expect(analysis!.source).toBe('reccobeats');
    expect(analysis!.tempo).toBeGreaterThan(160);
    expect(analysis!.tempo).toBeLessThan(180);
  }, 30000);

  it('still accepts a full batch of 40 ids', async () => {
    const ids = Array.from({ length: RECCOBEATS_BATCH_SIZE }, () => BLINDING_LIGHTS);

    await expect(fetchTempoBatch(ids)).resolves.toBeDefined();
  }, 30000);
});

live('Deezer (live)', () => {
  beforeAll(() => {
    const mock = global.fetch as unknown as { dontMock?: () => void };
    mock.dontMock?.();
  });

  it('resolves a tempo by ISRC', async () => {
    const analysis = await fetchTempoByIsrc('any-id', BOHEMIAN_RHAPSODY_ISRC);

    expect(analysis).not.toBeNull();
    expect(analysis!.source).toBe('deezer');
    expect(analysis!.tempo).toBeGreaterThan(130);
    expect(analysis!.tempo).toBeLessThan(150);
  }, 30000);
});
