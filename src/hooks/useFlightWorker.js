import { useState, useEffect, useRef, useCallback } from "react";

export function useFlightWorker(airports) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const workerRef = useRef(null);
  const pendingRef = useRef(null); // airports to send once worker is ready

  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/flightCalc.worker.js", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (e) => {
      if (e.data.error) {
        setError(e.data.error);
      } else {
        setResult(e.data);
        setError(null);
      }
      setLoading(false);
    };

    worker.onerror = (err) => {
      console.error("FlightWorker error:", err);
      setError("Worker calculation failed");
      setLoading(false);
    };

    workerRef.current = worker;

    // If a message was queued before worker was ready, send it now
    if (pendingRef.current) {
      worker.postMessage({ airports: pendingRef.current });
      pendingRef.current = null;
    }

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  // Serialize dep as a string to avoid triggering on every render
  const airportKey = airports?.map((a) => a?.iata || a?.code || "null").join(",") ?? "";

  useEffect(() => {
    if (!airports || airports.length < 2) {
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    if (workerRef.current) {
      workerRef.current.postMessage({ airports });
    } else {
      // Worker not yet initialized — queue it
      pendingRef.current = airports;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [airportKey]);

  return { result, loading, error };
}
