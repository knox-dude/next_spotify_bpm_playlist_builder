/**
 * The handful of class strings that make the app's screens look like one app.
 *
 * Kept here rather than as Tailwind `@apply` components so the classes stay
 * greppable from the markup that uses them.
 */

/** The raised panel every section of the app sits on. */
export const CARD =
  'rounded-2xl border border-white/10 bg-paper-700/70 shadow-lg backdrop-blur-sm';

/** Small all-caps heading that names a section without shouting. */
export const SECTION_LABEL =
  'text-[11px] font-semibold uppercase tracking-widest text-gray-500';

/** The main call to action. */
export const PRIMARY_BUTTON =
  'rounded-full bg-primary px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-opacity-100 sm:text-base';

/** Anything secondary: select-all, back, and the like. */
export const GHOST_BUTTON =
  'rounded-full border border-white/10 bg-paper-600/60 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:border-white/25 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50';
