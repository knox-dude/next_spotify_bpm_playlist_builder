# Hosting options

Written August 2026. Prices and free-tier limits move constantly — treat the
numbers as "what to go check", not gospel.

## What this app actually needs

Worth pinning down first, because it rules out a lot of options:

| Requirement | Why |
| --- | --- |
| **A Node 24 server runtime** | NextAuth runs the OAuth code exchange server-side; the version is pinned in `engines`/`.nvmrc` |
| **Server-side secrets** | `SPOTIFY_CLIENT_SECRET` must never reach the browser |
| **Server Actions** | The Spotify and BPM calls run through `'use server'` modules |
| **~5s function budget** | Longest single tempo-lookup call (see note below) |
| **No database** | Nothing to persist; the tempo cache is in-memory |
| **Trivial traffic** | A personal side project |

No database and no real traffic makes this cheap to host almost anywhere. The
one binding constraint is that it **cannot be a static site**.

### ❌ GitHub Pages will not work

You asked about this specifically, so: no, and not with a workaround.

GitHub Pages serves static files only — no server, no serverless functions, no
environment secrets. Deploying here would require `output: 'export'`, which
disables Server Actions and API routes. That kills `/api/auth/[...nextauth]`,
which is the entire login flow. And there would be nowhere to put
`SPOTIFY_CLIENT_SECRET` except the client bundle, i.e. published to the world.

The same reasoning rules out Netlify Drop, S3 + CloudFront static, and any
"just host the `out/` folder" approach.

### A note on function timeouts

The BPM scan is chunked so no single server call runs long. `lookupTempos()`
sends 120 tracks per call (~2.5s measured, including the Deezer fallback), and
the browser drives the loop. So a 3,000-track library is ~25 short calls rather
than one 60-second call.

Those calls now go out three at a time rather than one after another, which
changes the wall-clock (~25 rounds becomes ~9) but not the per-invocation
budget, which is what the timeout actually caps. Track collection is fanned out
the same way: each source is its own call, and the pages within a source are
requested by offset in parallel instead of walking `next` links one at a time.

This matters: **it is what keeps the app inside a 10s free-tier function limit.**
If you ever refactor the scan to run entirely server-side in one request, you
will need a host with a long timeout, and most cheap tiers do not have one.

---

## Recommendations

### 1. Stay on Vercel (recommended)

Honestly — for this specific project, the thing you're worried about probably
isn't going to bite you.

The Hobby tier's free allowances (100 GB transfer, 1M function invocations,
1M edge requests, 6,000 build minutes per month) are enormous relative to a
personal playlist tool. The scan is chunked to fit the 10s function cap.

**The actual risks, in order:**

1. **The non-commercial clause.** Hobby is for personal, non-commercial use.
   No ads, no payments, *no donation links*. That last one surprises people. As
   a portfolio piece you're fine.
2. **Overage billing.** Bandwidth over the included amount bills at roughly
   $40/100 GB. Set a **spend limit of $0** in the dashboard — that's the switch
   that turns "surprise bill" into "site pauses". Do this regardless of what you
   decide; it's the single highest-value five minutes here.
3. **Image optimization quota.** Only ~1,000 source images/month on Hobby. You
   already dodge this — `next.config.js` sets `images.unoptimized: true`.

**Effort to stay: zero.** It's already deployed.

### 2. Cloudflare Workers — the strongest actual alternative

Best free tier of the realistic options: 100,000 requests/day, unlimited
bandwidth, and cold starts under ~3ms. No non-commercial restriction.

The catch is setup. Next.js runs there through the `@opennextjs/cloudflare`
adapter, which is a real configuration layer, not a one-click import. Budget an
evening. NextAuth works but needs the Workers runtime configured correctly.

**Pick this if:** you want off Vercel on principle, or might one day monetize.

### 3. Netlify — the easy lateral move

Closest like-for-like to Vercel: git-push deploys, preview URLs, native Next.js
support. Free tier is 100 GB bandwidth and 300 build minutes/month — noticeably
tighter on build minutes than Vercel's 6,000.

**Pick this if:** you want to leave Vercel with the least effort.

### 4. Render — free, with a caveat that matters here

Free web services **spin down after 15 minutes of inactivity**, and waking one
costs 30–60 seconds on the next request.

For a side project nobody visits daily, that means most visitors — including
anyone you send the link to — hit a minute-long blank page. For a portfolio
piece being shown to someone, that's close to disqualifying.

**Pick this if:** you later add a database and want it in the same place.

### 5. Self-host on a VPS — most control, least free

Hetzner/DigitalOcean/Contabo run €4–6/month. Add [Coolify](https://coolify.io)
(open source) and you get git-push deploys, preview URLs, and automatic SSL —
essentially self-run Vercel.

Not free, and you own the security patching. But no vendor limits, no
non-commercial clause, no timeout caps.

**Pick this if:** you want to learn deployment properly, or you accumulate
enough side projects that one box hosting all of them beats per-project tiers.

---

## Bottom line

| Option | Free? | Effort | Verdict |
| --- | --- | --- | --- |
| **Vercel Hobby** | Yes | None | **Stay here.** Set a $0 spend limit today. |
| **Cloudflare Workers** | Yes | An evening | Best alternative if you want out |
| **Netlify** | Yes | ~an hour | Easiest lateral move |
| **Render** | Yes | ~an hour | Cold starts make it a poor demo |
| **VPS + Coolify** | ~€5/mo | A weekend | Most control, real learning |
| **GitHub Pages** | Yes | — | **Impossible.** Static only. |

My recommendation: **stay on Vercel and set the spend limit to $0.** The hidden
costs you're worried about are real, but they're a Pro-tier and
commercial-traffic problem. At this project's scale you are three orders of
magnitude from the limits, and the spend cap removes the tail risk outright.

Revisit if you ever monetize it — that's when the non-commercial clause, not
the bandwidth, forces the move.
