"use client";

import { animate, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";

function format(log: number) {
  let exp = Math.floor(log);
  let mantissa = 10 ** (log - exp);
  if (Number(mantissa.toFixed(2)) >= 10) {
    mantissa /= 10;
    exp += 1;
  }
  return { mantissa: mantissa.toFixed(2), exp };
}

/**
 * Shows `value` in scientific notation. Whenever `value` changes, the number
 * counts up (or down) from wherever it currently is by animating its
 * exponent, so the digits spin like an odometer.
 */
export default function CountUp({
  value,
  duration = 1.8,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const log = useMotionValue(0);
  const [shown, setShown] = useState(() => format(0));

  useMotionValueEvent(log, "change", (v) => setShown(format(v)));

  useEffect(() => {
    const controls = animate(log, Math.log10(value), { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [value, duration, log]);

  const minus = shown.exp < 0 ? "−" : "";
  return (
    <span className={`tabular-nums ${className ?? ""}`}>
      {shown.mantissa} × 10<sup className="text-[0.6em]">{minus}{Math.abs(shown.exp)}</sup>
    </span>
  );
}
