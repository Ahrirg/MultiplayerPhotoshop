import { useRef } from "react";
import { animate } from "animejs";

const HOVER_IN_EFFECTS: ((el: HTMLElement) => void)[] = [
  (el) => animate(el, { scale: 1.12, translateY: -6, duration: 220, easing: "easeOutQuad" }),
  (el) => animate(el, { rotate: [-3, 3, -2, 0], duration: 350, easing: "easeOutElastic(1,.5)" }),
  (el) => animate(el, { scaleX: 1.15, scaleY: 0.9, duration: 180, easing: "easeOutQuad" }),
  (el) => animate(el, { translateX: [0, -4, 4, -2, 0], duration: 300, easing: "easeOutQuad" }),
  (el) => animate(el, { skewX: [-6, 0], duration: 250, easing: "easeOutBack" }),
  (el) => animate(el, { scale: 1.1, rotate: 3, duration: 200, easing: "easeOutBack" }),
  (el) => animate(el, { translateY: [-8, 0], duration: 300, easing: "easeOutBounce" }),
  (el) => animate(el, { scaleY: [1.15, 0.95, 1.05, 1], duration: 400, easing: "easeOutElastic(1,.6)" }),
];

const resetAll = (el: HTMLElement) =>
  animate(el, {
    scale: 1,
    scaleX: 1,
    scaleY: 1,
    translateX: 0,
    translateY: 0,
    rotate: 0,
    skewX: 0,
    duration: 300,
    easing: "easeOutQuad",
  });

const CLICK_EFFECTS: ((el: HTMLElement) => void)[] = [
  (el) => animate(el, { scale: [0.85, 1.15, 1], duration: 450, easing: "easeOutElastic(1,.6)" }),
  (el) => animate(el, { rotate: [0, 12, -10, 6, 0], duration: 500, easing: "easeOutElastic(1,.5)" }),
  (el) => animate(el, { translateX: [0, -10, 10, -6, 6, -2, 0], duration: 400, easing: "easeOutQuad" }),
  (el) => animate(el, { scaleX: [1, 0.7, 1.3, 0.9, 1], scaleY: [1, 1.3, 0.7, 1.1, 1], duration: 550, easing: "easeOutElastic(1,.5)" }),
  (el) => animate(el, { translateY: [0, -14, 0], duration: 350, easing: "easeOutBounce" }),
  (el) => animate(el, { scale: [1, 1.25, 0.9, 1.1, 1], rotate: [0, 8, 0, -4, 0], duration: 600, easing: "easeOutElastic(1,.4)" }),
  (el) => animate(el, { skewX: [0, 10, -10, 0], scale: [1, 1.1, 1], duration: 400, easing: "easeOutQuad" }),
  (el) => animate(el, { scaleY: [1, 0.6, 1.2, 0.9, 1], translateY: [0, 4, -8, 2, 0], duration: 500, easing: "easeOutElastic(1,.5)" }),
  (el) => animate(el, { rotate: [0, 360], duration: 500, easing: "easeOutExpo" }),
  (el) => animate(el, { scale: [1, 0.5, 1.3, 0.95, 1], duration: 600, easing: "easeOutElastic(1,.3)" }),
  (el) => animate(el, { translateX: [0, 20, 0], scaleX: [1, 0.8, 1], duration: 350, easing: "easeOutBack" }),
  (el) => animate(el, { scale: [1.4, 0.8, 1.1, 1], duration: 550, easing: "easeOutElastic(1,.5)" }),
];

const pick = (arr: ((el: HTMLElement) => void)[]) =>
  arr[Math.floor(Math.random() * arr.length)];

export function useToolButton() {
  const ref = useRef<HTMLButtonElement | null>(null);

  const hoverIn = () => {
    if (!ref.current) return;
    pick(HOVER_IN_EFFECTS)(ref.current);
  };

  const hoverOut = () => {
    if (!ref.current) return;
    resetAll(ref.current);
  };

  const click = () => {
    if (!ref.current) return;
    pick(CLICK_EFFECTS)(ref.current);
  };

  return { ref, hoverIn, hoverOut, click };
}