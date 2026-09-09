import React, { useState, useEffect } from "react";
import { ArrowRightLeft, Loader2, Sparkles } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { useCurrency } from "../../hooks/useCurrency";

const CURRENCIES = [
  "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY",
  "INR", "SGD", "AED", "KRW", "BRL", "MXN", "ZAR", "THB",
  "QAR", "IDR", "MYR", "NZD", "HKD", "TRY", "ILS", "KES",
  "EGP", "COP", "PEN"
];

const CURRENCY_FLAGS = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", CAD: "🇨🇦",
  AUD: "🇦🇺", CHF: "🇨🇭", CNY: "🇨🇳", INR: "🇮🇳", SGD: "🇸🇬",
  AED: "🇦🇪", KRW: "🇰🇷", BRL: "🇧🇷", MXN: "🇲🇽", ZAR: "🇿🇦",
  THB: "🇹🇭", QAR: "🇶🇦", IDR: "🇮🇩", MYR: "🇲🇾", NZD: "🇳🇿",
  HKD: "🇭🇰", TRY: "🇹🇷", ILS: "🇮🇱", KES: "🇰🇪", EGP: "🇪🇬",
  COP: "🇨🇴", PEN: "🇵🇪",
};

const PRESET_AMOUNTS = [100, 500, 1000, 2500];

function formatCurrencyVal(val, currency) {
  if (val === null || val === undefined || isNaN(val)) return "0";
  
  // Currencies without sub-units/decimals
  const zeroDecimalCurrencies = ["JPY", "KRW", "IDR", "VND", "CLP"];
  const isZeroDecimal = zeroDecimalCurrencies.includes(currency);

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: isZeroDecimal ? 0 : 2,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
  }).format(val);
}

export default function CurrencyConverter({ baseCostUSD, destCurrency }) {
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState(destCurrency || "EUR");
  const [amountInput, setAmountInput] = useState(String(baseCostUSD || 500));

  const numericAmount = parseFloat(amountInput) || 0;
  const { result, rate, loading, isFallback } = useCurrency(fromCurrency, toCurrency, numericAmount);

  // Sync toCurrency when destination airport updates
  useEffect(() => {
    if (destCurrency && destCurrency !== toCurrency) {
      setToCurrency(destCurrency);
    }
  }, [destCurrency]);

  // Sync base cost when recalculating flight distance
  useEffect(() => {
    if (baseCostUSD) {
      setAmountInput(String(baseCostUSD));
    }
  }, [baseCostUSD]);

  function handleSwap() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }

  const allCurrencies = [...new Set([...CURRENCIES, toCurrency, fromCurrency])].sort();

  return (
    <GlassCard className="p-4" animate="animate-slide-up">
      {/* Title Header */}
      <div className="flex items-center gap-2 mb-3">
        <ArrowRightLeft size={14} style={{ color: "#00F2FE" }} />
        <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
          Currency Converter
        </span>
        {rate && !loading && (
          <span className="ml-auto text-xs font-medium text-[#94A3B8]">
            1 {fromCurrency} = {rate < 0.01 ? rate.toFixed(6) : rate.toFixed(4)} {toCurrency}
          </span>
        )}
      </div>

      {/* Preset Buttons */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-[11px] text-[#94A3B8] mr-1">Presets:</span>
        {PRESET_AMOUNTS.map((preset) => (
          <button
            key={preset}
            onClick={() => setAmountInput(String(preset))}
            className={`px-2 py-0.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              numericAmount === preset
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            ${preset.toLocaleString()}
          </button>
        ))}
      </div>

      {/* Amount Input Box */}
      <div className="mb-3">
        <label className="text-xs mb-1 block text-[#94A3B8]">
          Amount ({fromCurrency})
        </label>
        <input
          id="currency-amount-input"
          type="number"
          value={amountInput}
          onChange={(e) => setAmountInput(e.target.value)}
          placeholder="Enter amount..."
          className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 focus:outline-none focus:border-cyan-400 text-sm font-semibold text-[#F8FAFC] font-mono"
          min="0"
          step="any"
        />
      </div>

      {/* Currency Selectors Row */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1">
          <label className="text-xs mb-1 block text-[#94A3B8]">From</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-base pointer-events-none">
              {CURRENCY_FLAGS[fromCurrency] || "🌐"}
            </span>
            <select
              id="currency-from-select"
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full pl-8 pr-2 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-xs sm:text-sm appearance-none cursor-pointer font-bold text-white focus:outline-none focus:border-cyan-400"
            >
              {allCurrencies.map((c) => (
                <option key={c} value={c} style={{ background: "#080C16" }}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          id="currency-swap-btn"
          onClick={handleSwap}
          className="flex-shrink-0 mt-4 p-2.5 rounded-xl transition-all cursor-pointer hover:scale-110 active:scale-95"
          style={{ background: "rgba(0, 242, 254, 0.12)", border: "1px solid rgba(0, 242, 254, 0.3)", color: "#00F2FE" }}
          title="Swap currencies"
        >
          <ArrowRightLeft size={13} />
        </button>

        <div className="flex-1">
          <label className="text-xs mb-1 block text-[#94A3B8]">To</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-base pointer-events-none">
              {CURRENCY_FLAGS[toCurrency] || "🌐"}
            </span>
            <select
              id="currency-to-select"
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full pl-8 pr-2 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-xs sm:text-sm appearance-none cursor-pointer font-bold text-white focus:outline-none focus:border-cyan-400"
            >
              {allCurrencies.map((c) => (
                <option key={c} value={c} style={{ background: "#080C16" }}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Conversion Result Display */}
      <div
        className="rounded-xl px-4 py-3 flex items-center justify-between"
        style={{ background: "rgba(0, 242, 254, 0.10)", border: "1px solid rgba(0, 242, 254, 0.25)" }}
      >
        {loading ? (
          <div className="flex items-center gap-2 mx-auto py-0.5">
            <Loader2 size={16} className="animate-spin" style={{ color: "#00F2FE" }} />
            <span className="text-xs text-[#94A3B8]">Converting exchange rates…</span>
          </div>
        ) : (
          <>
            <div>
              <div className="text-xs text-[#94A3B8]">
                {formatCurrencyVal(numericAmount, fromCurrency)} {fromCurrency} =
              </div>
              {isFallback && (
                <div className="text-[10px] text-amber-400/80 flex items-center gap-1 mt-0.5">
                  <Sparkles size={9} />
                  <span>Telemetry Exchange Engine</span>
                </div>
              )}
            </div>
            <div className="text-lg font-extrabold font-mono" style={{ color: "#00FFA3" }}>
              {CURRENCY_FLAGS[toCurrency]} {formatCurrencyVal(result, toCurrency)} {toCurrency}
            </div>
          </>
        )}
      </div>
    </GlassCard>
  );
}
