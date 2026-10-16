"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CountUp from "@/components/countup";
import { describeSizes, metricLength, plainDecimal } from "@/lib/physics";

function Or() {
  return <span className="block text-[10px] uppercase tracking-[0.3em] text-gray-600">or</span>;
}

/** Cycles through a handful of comparisons so the size is described in different ways. */
function Comparisons({ radius, delay }: { radius: number; delay: number }) {
  const sizes = describeSizes(radius);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (sizes.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % sizes.length), 4500);
    return () => clearInterval(id);
  }, [sizes.length]);

  const current = sizes[index % sizes.length];
  return (
    <motion.div
      className="mt-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="min-h-[3.25rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
          >
            <p className="text-lg text-white">{current.headline}</p>
            <p className="text-sm text-gray-400">{current.detail}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      {sizes.length > 1 && (
        <div className="mt-1 flex justify-center gap-1.5">
          {sizes.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${i === index ? "w-4 bg-orange-400" : "w-1 bg-gray-600"}`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

/**
 * A radius in metres shown three ways (scientific, written out in full, metric
 * prefix) plus a rotating "how small is that" comparison.
 */
export default function RadiusReadout({ radius }: { radius: number }) {
  const full = plainDecimal(radius);
  const metric = metricLength(radius);

  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-orange-400 md:text-3xl">
        <CountUp value={radius} /> m
      </p>

      {/* keyed so the lower rows replay on every new result while the number keeps counting */}
      <div key={radius}>
        {full && (
          <motion.div
            className="mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.3 }}
          >
            <Or />
            <motion.p
              className="font-spacemono text-base text-orange-200/90 [overflow-wrap:anywhere]"
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0% 0 0)" }}
              transition={{ delay: 1.4, duration: 1.2, ease: "easeInOut" }}
            >
              {full} m
            </motion.p>
          </motion.div>
        )}
        {metric && (
          <motion.div
            className="mt-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.5 }}
          >
            <Or />
            <p className="text-lg text-orange-200/90">{metric}</p>
          </motion.div>
        )}
        <Comparisons radius={radius} delay={2.8} />
      </div>
    </div>
  );
}
