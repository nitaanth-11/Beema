import React, { useEffect, useId, useRef } from "react";

/**
 * BeemaCursor — the signature circular wordmark cursor.
 *
 * A ring of repeating "BEEMA •" set on a real SVG <textPath>, rotating slowly
 * while the whole ring eases toward the pointer.
 *
 * Design constraints this component is built around:
 *  - It is decorative. The native cursor is only hidden after this component
 *    confirms it can run, so a failure to initialise leaves the page usable.
 *  - It never intercepts input: the layer is `pointer-events: none`, and over
 *    text fields the native caret is handed straight back.
 *  - Pointer movement never touches React state; position is written directly
 *    to the DOM inside a single requestAnimationFrame loop.
 */

const RADIUS = 34;                               // within a 100x100 viewBox
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;      // ≈ 213.63
const SEGMENTS = 4;                              // "BEEMA •" repeats around the ring
const SEGMENT_LENGTH = CIRCUMFERENCE / SEGMENTS;

// Fraction of the remaining distance covered each frame: high enough to feel
// attached to the pointer, low enough to read as a smooth glide.
const FOLLOW = 0.22;

const INTERACTIVE = 'a, button, [role="button"], select, summary, label, [data-cursor="hover"]';
// Text-entry fields only — button-like inputs stay in the INTERACTIVE group.
const TEXT_ENTRY = [
  'input:not([type="checkbox"]):not([type="radio"]):not([type="file"])' +
    ':not([type="button"]):not([type="submit"]):not([type="reset"])' +
    ':not([type="range"]):not([type="color"])',
  "textarea",
  '[contenteditable="true"]',
].join(", ");

export default function BeemaCursor({ size = 76 }) {
  const rootRef = useRef(null);
  const scaleRef = useRef(null);
  const pathId = `beema-cursor-ring-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    const root = rootRef.current;
    const scaler = scaleRef.current;
    if (!root || !scaler) return;

    // Touch-first devices keep the native interaction model entirely.
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!finePointer.matches) return;

    const html = document.documentElement;
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { ...target };

    let frame = 0;
    let placed = false;      // first move snaps instead of sliding in from centre
    let pressed = false;
    let hovering = false;
    let overText = false;

    const showNativeCursor = () => html.classList.remove("beema-cursor-on");
    const hideNativeCursor = () => html.classList.add("beema-cursor-on");

    const setVisible = (visible) => {
      root.dataset.visible = visible ? "true" : "false";
      if (visible && !overText) hideNativeCursor();
      else showNativeCursor();
    };

    const applyScale = () => {
      const scale = pressed ? 0.88 : hovering ? 1.18 : 1;
      scaler.style.transform = `scale(${scale})`;
    };

    const render = () => {
      // Exponential ease toward the pointer; cheap and frame-rate tolerant.
      current.x += (target.x - current.x) * FOLLOW;
      current.y += (target.y - current.y) * FOLLOW;
      root.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(render);
    };

    const onPointerMove = (event) => {
      if (event.pointerType && event.pointerType !== "mouse") return;

      target.x = event.clientX;
      target.y = event.clientY;

      if (!placed) {
        current.x = target.x;
        current.y = target.y;
        placed = true;
      }

      // Over a text field the custom ring would fight the caret, so step aside.
      const node = event.target instanceof Element ? event.target : null;
      const nextOverText = Boolean(node?.closest(TEXT_ENTRY));
      const nextHovering = !nextOverText && Boolean(node?.closest(INTERACTIVE));

      if (nextOverText !== overText) {
        overText = nextOverText;
        setVisible(!overText);
      }

      if (nextHovering !== hovering) {
        hovering = nextHovering;
        applyScale();
      }

      if (!overText && root.dataset.visible !== "true") setVisible(true);
    };

    const onPointerDown = () => { pressed = true; applyScale(); };
    const onPointerUp = () => { pressed = false; applyScale(); };
    const onLeave = () => setVisible(false);
    const onBlur = () => setVisible(false);

    const onPointerCapabilityChange = (event) => {
      if (event.matches) return;
      setVisible(false);
      showNativeCursor();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onBlur);
    finePointer.addEventListener("change", onPointerCapabilityChange);

    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onBlur);
      finePointer.removeEventListener("change", onPointerCapabilityChange);
      showNativeCursor();
    };
  }, []);

  return (
    <div ref={rootRef} className="beema-cursor" data-visible="false" aria-hidden="true">
      <div ref={scaleRef} className="beema-cursor__scale">
        <svg
          className="beema-cursor__ring"
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          focusable="false"
        >
          <defs>
            {/* Starts at 9 o'clock and sweeps over the top, so the wordmark
                reads upright along the crown of the ring. */}
            <path
              id={pathId}
              d={`M 50,50 m -${RADIUS},0 a ${RADIUS},${RADIUS} 0 1,1 ${RADIUS * 2},0 a ${RADIUS},${RADIUS} 0 1,1 -${RADIUS * 2},0`}
            />
          </defs>

          {Array.from({ length: SEGMENTS }, (_, index) => (
            <text
              key={index}
              fontSize="11.5"
              fontWeight="800"
              fontFamily="var(--font-family)"
              letterSpacing="0.6"
              fill={index % 2 === 0 ? "var(--color-accent)" : "var(--color-coral)"}
            >
              {/* textLength pins each run to an exact quarter of the
                  circumference, so the ring closes seamlessly whatever font
                  actually loads. */}
              <textPath
                href={`#${pathId}`}
                startOffset={`${(index / SEGMENTS) * 100}%`}
                textLength={SEGMENT_LENGTH}
                lengthAdjust="spacing"
              >
                BEEMA •
              </textPath>
            </text>
          ))}

          <circle className="beema-cursor__dot" cx="50" cy="50" r="2.4" fill="var(--color-primary)" />
        </svg>
      </div>
    </div>
  );
}
