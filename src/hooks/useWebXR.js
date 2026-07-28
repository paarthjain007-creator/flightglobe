import { useState, useEffect, useCallback } from "react";

export function useWebXR() {
  const [isARSupported, setIsARSupported] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [xrSession, setXrSession] = useState(null);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "xr" in navigator) {
      navigator.xr
        .isSessionSupported("immersive-ar")
        .then((supported) => setIsARSupported(supported))
        .catch(() => setIsARSupported(false));
    }
  }, []);

  const startARSession = useCallback(async () => {
    if (!isARSupported || !navigator.xr) {
      // Simulate AR preview mode for desktop/mobile browsers without WebXR hardware
      setIsARActive(true);
      return;
    }

    try {
      const session = await navigator.xr.requestSession("immersive-ar", {
        optionalFeatures: ["hit-test", "dom-overlay"],
        domOverlay: { root: document.getElementById("app-root") || document.body }
      });

      setXrSession(session);
      setIsARActive(true);

      session.addEventListener("end", () => {
        setIsARActive(false);
        setXrSession(null);
      });
    } catch (err) {
      console.warn("WebXR AR session fallback active:", err);
      setIsARActive(true);
    }
  }, [isARSupported]);

  const endARSession = useCallback(() => {
    if (xrSession) {
      xrSession.end();
    }
    setIsARActive(false);
    setXrSession(null);
  }, [xrSession]);

  return {
    isARSupported,
    isARActive,
    startARSession,
    endARSession
  };
}
