import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { sound } from "../../utils/soundFx";

/**
 * Kinetic GlassCard with Real-Time 3D Perspective Tilt & Specular Light Reflection.
 */
export default function GlassCard({
  children,
  className = "",
  animate = "",
  style = {},
  tilt = false,
  glare = true,
  glow = null, // "cyan" | "emerald" | "violet" | "gold"
  onClick,
  soundFeedback = false,
  ...props
}) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: "50%", y: "50%" });
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(e) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCoords({ x: `${x}px`, y: `${y}px` });

    if (tilt) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      // Subtle, refined 3D tilt (max 7 degrees)
      const rotY = ((x - centerX) / centerX) * 7;
      const rotX = -((y - centerY) / centerY) * 7;
      setRotate({ x: rotX, y: rotY });
    }
  }

  function handleMouseEnter() {
    setIsHovered(true);
  }

  function handleMouseLeave() {
    setIsHovered(false);
    if (tilt) {
      setRotate({ x: 0, y: 0 });
    }
  }

  function handleClick(e) {
    if (soundFeedback) {
      try {
        sound.playClick();
      } catch (err) {
        // audio context safe
      }
    }
    if (onClick) {
      onClick(e);
    }
  }

  // Determine glow style
  const glowClass = glow
    ? glow === "cyan"
      ? "glass-interactive-cyan"
      : glow === "emerald"
      ? "glass-interactive-emerald"
      : glow === "violet"
      ? "glass-interactive-violet"
      : "glow-gold"
    : "";

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      animate={
        tilt && isHovered
          ? {
              rotateX: rotate.x,
              rotateY: rotate.y,
              scale: 1.015,
            }
          : {
              rotateX: 0,
              rotateY: 0,
              scale: 1,
            }
      }
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 25,
      }}
      style={{
        "--mouse-x": coords.x,
        "--mouse-y": coords.y,
        ...style,
      }}
      className={`glass-card rounded-2xl relative ${glowClass} ${animate} ${className}`}
      {...props}
    >
      {/* Specular Glare Overlay */}
      {glare && (
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300 z-10"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(550px circle at ${coords.x} ${coords.y}, rgba(255, 255, 255, 0.09), transparent 45%)`,
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />
      )}

      {children}
    </motion.div>
  );
}

