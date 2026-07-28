import React from "react";

export default function GlassCard({ children, className = "", animate = "", style = {} }) {
  return (
    <div
      className={`glass rounded-2xl ${animate} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
