import { useState, useEffect, useRef, useCallback } from "react";

const PEERS = [
  { id: "peer-1", name: "Elena R.", city: "Paris", color: "#60a5fa", avatar: "👩‍💻" },
  { id: "peer-2", name: "Alex K.", city: "Tokyo", color: "#c084fc", avatar: "👨‍🎨" },
  { id: "peer-3", name: "Sarah M.", city: "New York", color: "#4ade80", avatar: "👩‍🚀" }
];

export function useMultiplayer(roomKey = "default-room") {
  const [peers, setPeers] = useState(PEERS);
  const [reactions, setReactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const timersRef = useRef([]);

  useEffect(() => {
    let isMounted = true;

    const interval = setInterval(() => {
      if (!isMounted) return;
      setPeers((prevPeers) =>
        prevPeers.map((peer) => {
          const deltaX = (Math.random() - 0.5) * 80;
          const deltaY = (Math.random() - 0.5) * 60;
          const curX = peer.x || 300 + Math.random() * 400;
          const curY = peer.y || 200 + Math.random() * 300;

          const newX = Math.max(100, Math.min((window.innerWidth || 1000) - 200, curX + deltaX));
          const newY = Math.max(120, Math.min((window.innerHeight || 800) - 200, curY + deltaY));

          return {
            ...peer,
            x: newX,
            y: newY,
            lastActive: "Just now"
          };
        })
      );
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  const sendReaction = useCallback((emoji) => {
    const newReaction = {
      id: Date.now() + Math.random(),
      emoji,
      x: (window.innerWidth || 1000) / 2 + (Math.random() - 0.5) * 200,
      y: (window.innerHeight || 800) / 2 + (Math.random() - 0.5) * 100
    };

    setReactions((prev) => [...prev, newReaction]);

    const timer = setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 2500);

    timersRef.current.push(timer);
  }, []);

  const notifyStateSync = useCallback((message) => {
    const notif = {
      id: Date.now(),
      message,
      peer: PEERS[Math.floor(Math.random() * PEERS.length)]
    };
    setNotifications((prev) => [notif, ...prev].slice(0, 3));

    const timer = setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    }, 4000);

    timersRef.current.push(timer);
  }, []);

  return {
    peers,
    reactions,
    notifications,
    sendReaction,
    notifyStateSync
  };
}
