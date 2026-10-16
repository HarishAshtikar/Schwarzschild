"use client";

import { motion } from "framer-motion";

const part = {
  hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: "easeOut" } },
};

/** r_s = 2GM / c², typeset with real fraction, subscript and superscript. */
export default function Equation({ className }: { className?: string }) {
  return (
    <motion.div
      role="math"
      aria-label="r sub s equals 2 G M over c squared"
      className={`inline-flex items-center justify-center gap-4 font-math text-5xl text-white ${className ?? ""}`}
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.18, delayChildren: 0.35 }}
    >
      <motion.span variants={part} className="italic">
        r<sub className="text-3xl not-italic align-baseline relative top-2 ml-0.5">s</sub>
      </motion.span>
      <motion.span variants={part} className="text-orange-400">=</motion.span>
      <motion.span variants={part} className="inline-flex flex-col items-center leading-none">
        <span className="px-3 pb-2 italic border-b-2 border-orange-400/80">
          2<span className="ml-1">GM</span>
        </span>
        <span className="pt-2 italic">
          c<sup className="text-2xl not-italic ml-0.5">2</sup>
        </span>
      </motion.span>
    </motion.div>
  );
}
