import React from "react";
import { Shield, Music, Trophy, Utensils, Calendar } from "lucide-react";
import GlassCard from "../ui/GlassCard";

// Deterministic pseudo-random seeded by IATA string
function seed(str) { return str.split("").reduce((a, c) => a + c.charCodeAt(0), 0); }
function pick(arr, s, offset = 0) { return arr[(s + offset) % arr.length]; }

const VISA_TYPES = [
  { label: "No Visa Required",   color: "#4ade80", bg: "rgba(74,222,128,0.08)",   border: "rgba(74,222,128,0.25)",  icon: "✅" },
  { label: "Visa on Arrival",    color: "#fbbf24", bg: "rgba(251,191,36,0.08)",   border: "rgba(251,191,36,0.25)",  icon: "🔖" },
  { label: "e-Visa Required",    color: "#60a5fa", bg: "rgba(96,165,250,0.08)",   border: "rgba(96,165,250,0.25)",  icon: "💻" },
  { label: "Visa Required",      color: "#f87171", bg: "rgba(248,113,113,0.08)",  border: "rgba(248,113,113,0.25)", icon: "📋" },
];

const PROCESSING = ["On arrival", "24–48 hrs online", "3–5 business days", "7–10 business days"];
const FEES       = ["Free", "$25 USD", "$50 USD", "$80 USD", "€35 EUR", "$30 USD"];

const EVENT_TYPES = [
  { icon: Music,    events: ["International Jazz Festival", "Electronic Music Week", "Opera Under the Stars", "Folk & World Music Fair", "Beach Beats Summer"] },
  { icon: Trophy,   events: ["Formula 1 Grand Prix", "International Tennis Open", "Championship Football", "Triathlon World Series", "Sailing Regatta"] },
  { icon: Utensils, events: ["World Street Food Expo", "Fine Dining Week", "Craft Beer Festival", "Night Market Extravaganza", "Farm-to-Table Summit"] },
  { icon: Calendar, events: ["International Film Festival", "Tech & Innovation Summit", "National Day Celebrations", "Art Biennale", "Fashion Week"] },
];

function getMockVisa(iata) {
  const s = seed(iata);
  return VISA_TYPES[s % VISA_TYPES.length];
}

function getMockEvents(city, iata) {
  const s = seed(iata);
  return Array.from({ length: 3 }, (_, i) => {
    const typeGroup = EVENT_TYPES[(s + i * 7) % EVENT_TYPES.length];
    return {
      icon: typeGroup.icon,
      name: pick(typeGroup.events, s, i * 3),
      date: getEventDate(s + i),
    };
  });
}

function getEventDate(offset) {
  const d = new Date();
  d.setDate(d.getDate() + (offset % 45) + 5);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function VisaVibeCard({ destination }) {
  if (!destination) return null;

  const visa   = getMockVisa(destination.iata);
  const events = getMockEvents(destination.city, destination.iata);
  const proc   = pick(PROCESSING, seed(destination.iata), 1);
  const fee    = pick(FEES, seed(destination.iata), 2);

  return (
    <GlassCard className="p-4" animate="animate-slide-up">
      {/* Visa Section */}
      <div className="flex items-center gap-2 mb-3">
        <Shield size={14} style={{ color: "var(--accent)" }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Visa & Vibe Check
        </span>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>
          Mock Data
        </span>
      </div>

      {/* Visa Card */}
      <div
        className="rounded-xl p-3 mb-3 flex items-center gap-3"
        style={{ background: visa.bg, border: `1px solid ${visa.border}` }}
      >
        <span className="text-2xl">{visa.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold" style={{ color: visa.color }}>{visa.label}</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            For most passports · {destination.country}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{fee}</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>{proc}</div>
        </div>
      </div>

      <div className="glow-line mb-3" />

      {/* Trending Events */}
      <div className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
        🔥 Trending in {destination.city}
      </div>

      <div className="space-y-2">
        {events.map((ev, i) => {
          const Icon = ev.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 cursor-pointer transition-all hover:scale-[1.01]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)" }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--accent-glow)", border: "1px solid var(--glass-border)" }}
              >
                <Icon size={13} style={{ color: "var(--accent)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{ev.name}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{ev.date}</div>
              </div>
              <div className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>
                →
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
