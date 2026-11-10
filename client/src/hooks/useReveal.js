/**
 * useReveal — adds `is-visible` to a ref'd element when it scrolls into view.
 * The element should start with the `reveal` class (defined in index.css).
 */

import { useEffect, useRef } from 'react';

export function useReveal({ threshold = 0.15, once = true } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If the browser doesn't support IntersectionObserver, just reveal now.
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            if (once) io.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove('is-visible');
          }
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);

  return ref;
}
