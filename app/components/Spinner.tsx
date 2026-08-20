import React from 'react';

interface SpinnerProps {
  /**
   * Announced to screen readers while the work is in flight. Leave it out when
   * visible text beside the spinner already says what is loading - otherwise
   * the same message gets announced twice.
   */
  label?: string;
  className?: string;
}

/** Bar heights are staggered so the equalizer reads as movement, not a blink. */
const BARS = ['0ms', '160ms', '320ms', '480ms'];

/**
 * An equalizer that bounces at 120 BPM.
 *
 * This replaces react-loader-spinner, which pulled in the whole of
 * styled-components to draw one spinner - a CSS-in-JS runtime and its own copy
 * of postcss for four rectangles.
 */
const Spinner: React.FC<SpinnerProps> = ({ label, className = '' }) => (
  <span
    role={label ? 'status' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : 'true'}
    className={`flex h-10 items-end justify-center gap-1 ${className}`}
  >
    {BARS.map((delay) => (
      <span
        key={delay}
        aria-hidden="true"
        className="animate-equalizer w-1.5 origin-bottom rounded-full bg-primary"
        style={{ height: '100%', animationDelay: delay }}
      />
    ))}
  </span>
);

export default Spinner;
