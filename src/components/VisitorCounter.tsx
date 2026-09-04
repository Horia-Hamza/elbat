import { useState, useEffect, useRef } from 'react';

const BASE_COUNT = 270;
const MIN_COUNT = 240;
const MAX_COUNT = 340;
const UPDATE_INTERVAL_MIN = 4000;  // ms
const UPDATE_INTERVAL_MAX = 9000;  // ms

function getRandomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function VisitorCounter() {
  const [count, setCount] = useState(BASE_COUNT);
  const [visible, setVisible] = useState(true);
  const [trending, setTrending] = useState<'up' | 'down' | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const schedule = () => {
      const delay = getRandomBetween(UPDATE_INTERVAL_MIN, UPDATE_INTERVAL_MAX);
      timeoutRef.current = setTimeout(() => {
        setCount((prev) => {
          // weighted: 60% chance to go up, 40% down, clamped
          const goUp = Math.random() < 0.6;
          const delta = getRandomBetween(1, 5);
          const next = goUp ? Math.min(prev + delta, MAX_COUNT) : Math.max(prev - delta, MIN_COUNT);
          setTrending(next > prev ? 'up' : next < prev ? 'down' : null);
          setTimeout(() => setTrending(null), 1800);
          return next;
        });
        schedule();
      }, delay);
    };
    schedule();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="visitor-counter" aria-live="polite" aria-label={`عدد الزوار الان ${count}`}>
      {/* pulse dot */}
      <span className="visitor-counter__dot" />

      {/* icon */}
      <svg
        className="visitor-counter__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>

      <div className="visitor-counter__text">
        <span className="visitor-counter__label">عدد الزوار الان</span>
        <span
          className={`visitor-counter__number ${trending === 'up' ? 'visitor-counter__number--up' : trending === 'down' ? 'visitor-counter__number--down' : ''}`}
        >
          {count.toLocaleString('ar-EG')}
          {trending === 'up' && (
            <svg className="visitor-counter__trend" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
              <path d="M5 1 L9 7 H1 Z" />
            </svg>
          )}
          {trending === 'down' && (
            <svg className="visitor-counter__trend visitor-counter__trend--down" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
              <path d="M5 9 L9 3 H1 Z" />
            </svg>
          )}
        </span>
      </div>

      {/* close button */}
      <button
        className="visitor-counter__close"
        aria-label="إغلاق عداد الزوار"
        onClick={() => setVisible(false)}
      >
        ×
      </button>
    </div>
  );
}
