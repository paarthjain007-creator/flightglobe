import { useEffect, useRef, useCallback } from "react";
import { useStore } from "../store/useStore";

export function useSpatialAudio() {
  const theme = useStore((s) => s.theme);
  const soundEnabled = useStore((s) => s.soundEnabled ?? true);
  
  const ctxRef = useRef(null);
  const ambientGainRef = useRef(null);
  const oscNodesRef = useRef([]);

  // Initialize Web Audio Context on demand
  const getAudioContext = useCallback(() => {
    if (!ctxRef.current && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        ctxRef.current = new AudioCtx();
      }
    }
    if (ctxRef.current && ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  // Micro-interaction SFX: Click
  const playClick = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch { /* ignore audio context errors */ }
  }, [soundEnabled, getAudioContext]);

  // Micro-interaction SFX: Swoosh / Transition
  const playSwoosh = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const bufferSize = ctx.sampleRate * 0.25;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.15);
      filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.25);
      filter.Q.value = 3;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.12);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + 0.25);
    } catch { /* ignore */ }
  }, [soundEnabled, getAudioContext]);

  // Micro-interaction SFX: Waypoint Added Chime
  const playRouteAdd = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99]; // C5 - E5 - G5 chord
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + idx * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.3);
      });
    } catch { /* ignore */ }
  }, [soundEnabled, getAudioContext]);

  // Theme-Linked Generative Ambient Audio Soundscapes
  useEffect(() => {
    if (!soundEnabled) {
      if (ambientGainRef.current && ctxRef.current) {
        ambientGainRef.current.gain.setTargetAtTime(0, ctxRef.current.currentTime, 0.2);
      }
      return;
    }

    const ctx = getAudioContext();
    if (!ctx) return;

    // Stop current ambient nodes
    oscNodesRef.current.forEach((n) => {
      try { n.stop(); n.disconnect(); } catch {}
    });
    oscNodesRef.current = [];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 1.0); // Gentle background volume
    masterGain.connect(ctx.destination);
    ambientGainRef.current = masterGain;

    if (theme === "holodeck") {
      // Sci-Fi Pulse Synth
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(110, ctx.currentTime); // A2

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(350, ctx.currentTime);

      osc.connect(filter);
      filter.connect(masterGain);
      osc.start();
      oscNodesRef.current.push(osc);
    } else if (theme === "synthwave") {
      // 80s Retro Warm Sub-Bass
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = "sawtooth";
      osc2.type = "square";
      osc1.frequency.setValueAtTime(65.41, ctx.currentTime); // C2
      osc2.frequency.setValueAtTime(130.81, ctx.currentTime); // C3

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(masterGain);
      osc1.start();
      osc2.start();
      oscNodesRef.current.push(osc1, osc2);
    } else if (theme === "atmosphera") {
      // Zen Aurora Chime Drone
      const notes = [220, 277.18, 329.63, 440]; // A3, C#4, E4, A4
      notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.value = 0.2;

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        oscNodesRef.current.push(osc);
      });
    } else {
      // Space Cosmic Drone (55Hz Sine)
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(55, ctx.currentTime);

      osc.connect(masterGain);
      osc.start();
      oscNodesRef.current.push(osc);
    }

    return () => {
      oscNodesRef.current.forEach((n) => {
        try { n.stop(); n.disconnect(); } catch {}
      });
      oscNodesRef.current = [];
    };
  }, [theme, soundEnabled, getAudioContext]);

  return { playClick, playSwoosh, playRouteAdd };
}
