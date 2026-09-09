import { useState, useEffect } from "react";

/**
 * useCountUp
 * Smoothly interpolates a number from 0 (or start) to end value over a specified duration
 */
export function useCountUp(endVal, duration = 1200, startVal = 0) {
  const [count, setCount] = useState(startVal);

  useEffect(() => {
    let startTimestamp = null;
    let frameId;
    const target = Number(endVal) || 0;
    const initial = Number(startVal) || 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic: 1 - Math.pow(1 - progress, 3)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(initial + (target - initial) * easeProgress);
      setCount(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [endVal, duration, startVal]);

  return count;
}