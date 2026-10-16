"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { UnitSystem } from "@/lib/physics";

const UnitsContext = createContext<{ system: UnitSystem; setSystem: (s: UnitSystem) => void }>({
  system: "metric",
  setSystem: () => {},
});

export const useUnits = () => useContext(UnitsContext);

export function UnitsProvider({ children }: { children: ReactNode }) {
  const [system, setSystem] = useState<UnitSystem>("metric");
  return <UnitsContext.Provider value={{ system, setSystem }}>{children}</UnitsContext.Provider>;
}

const OPTIONS: { value: UnitSystem; label: string }[] = [
  { value: "metric", label: "Metric" },
  { value: "imperial", label: "Imperial" },
];

/** Sliding Metric / Imperial switch. All toggles share one state. */
export function UnitToggle({ id, className }: { id: string; className?: string }) {
  const { system, setSystem } = useUnits();
  return (
    <div
      role="group"
      aria-label="Units"
      className={`relative inline-flex rounded-full border border-white/15 bg-neutral-900 p-0.5 text-sm ${className ?? ""}`}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={system === o.value}
          onClick={() => setSystem(o.value)}
          className={`relative z-10 rounded-full px-4 py-1 transition-colors ${
            system === o.value ? "text-white" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          {system === o.value && (
            <motion.span
              layoutId={`unit-pill-${id}`}
              className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
            />
          )}
          {o.label}
        </button>
      ))}
    </div>
  );
}
