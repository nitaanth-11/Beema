import { useEffect } from "react";

/**
 * Fades `.reveal` elements in as they enter the viewport.
 *
 * Content is styled to be readable regardless: if IntersectionObserver is
 * missing, or the visitor prefers reduced motion, everything is revealed
 * immediately rather than waiting on a scroll event.
 */
export function useReveal(deps = []) {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll(".reveal:not(.is-visible)"));
    if (nodes.length === 0) return;

    const revealAll = () => nodes.forEach((node) => node.classList.add("is-visible"));

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    nodes.forEach((node) => observer.observe(node));

    // Safety net: content must never stay invisible because the observer
    // failed to deliver. Anything still hidden after this is simply shown.
    const failsafe = window.setTimeout(revealAll, 1800);

    return () => {
      window.clearTimeout(failsafe);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default useReveal;
