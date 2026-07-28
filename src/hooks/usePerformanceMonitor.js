import { useState, useEffect, useRef } from "react";

export function usePerformanceMonitor() {
  const [fps, setFps] = useState(60);
  const [isLowPerformanceMode, setIsLowPerformanceMode] = useState(false);

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const lowFpsCountRef = useRef(0);

  useEffect(() => {
    let animId;

    function measureFps(now) {
      frameCountRef.current++;

      if (now - lastTimeRef.current >= 1000) {
        const measuredFps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
        setFps(measuredFps);

        // Auto-tune performance if FPS drops below 30 consistently
        if (measuredFps < 30) {
          lowFpsCountRef.current++;
          if (lowFpsCountRef.current >= 3) {
            setIsLowPerformanceMode(true);
          }
        } else {
          lowFpsCountRef.current = Math.max(0, lowFpsCountRef.current - 1);
        }

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animId = requestAnimationFrame(measureFps);
    }

    animId = requestAnimationFrame(measureFps);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return { fps, isLowPerformanceMode };
}
