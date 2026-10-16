// blackhole.tsx
"use client"

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Equation from "@/components/equation";

const cardItem = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function BlackHole() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showInfoCard, setShowInfoCard] = useState(false);

  useEffect(() => {
    if (!showInfoCard) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowInfoCard(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showInfoCard]);

  return (
    <div
      className="
        flex flex-col py-12 px-6 md:px-16 justify-center items-center
        h-full text-white
      "
    >
      <motion.h1
        className="
          text-5xl font-bold mb-4 text-center cursor-pointer
          border-b-2 border-dashed transition-colors duration-300
          hover:text-orange-500 hover:border-orange-500
        "
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowInfoCard(true)}
      >
        Schwarzschild
      </motion.h1>

      <AnimatePresence>
        {showInfoCard && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setShowInfoCard(false)}
            />
            <motion.div
              key="card"
              className="fixed inset-y-0 left-0 z-50 w-full md:w-1/2 border-r border-white/10 bg-neutral-900/95 shadow-2xl shadow-orange-500/10"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 260 }}
            >
              <motion.div
                className="relative p-8 h-full overflow-y-auto text-center flex flex-col justify-center"
                initial="hidden"
                animate="show"
                transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
              >
                {/* Close Button */}
                <motion.button
                  variants={cardItem}
                  className="absolute top-4 right-5 text-white/70 hover:text-orange-400 transition-colors text-3xl font-bold leading-none"
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.85 }}
                  aria-label="Close"
                  onClick={() => setShowInfoCard(false)}
                >
                  &times;
                </motion.button>
                <motion.h2 variants={cardItem} className="text-3xl font-bold mb-4">
                  About Schwarzschild
                </motion.h2>
                <motion.p variants={cardItem} className="mb-4 text-gray-300">
                  Pronunciation: <em>/ʃvartsˈʃɪld/</em>
                </motion.p>
                <motion.p variants={cardItem} className="mb-8 text-gray-300">
                  The Schwarzschild radius is the distance from the center of a
                  black hole to its event horizon—the point beyond which nothing can
                  escape.
                </motion.p>
                <motion.div variants={cardItem} className="mb-8">
                  <p className="mb-4 text-gray-300">Formula:</p>
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-8 py-10">
                    <Equation />
                  </div>
                </motion.div>
                <motion.p variants={cardItem} className="text-gray-300">
                  This calculator lets you compute the Schwarzschild radius for a given
                  mass, giving insight into the nature of black holes.
                </motion.p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.p
        className="text-2xl text-gray-400 mb-12 text-center relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        A black hole radius
        <span
          className="px-1 cursor-pointer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          calc
          <AnimatePresence>
            {showTooltip && (
              <motion.span
                className="absolute border-orange-500 border-2 bg-black text-white text-sm
                p-1 rounded-lg shadow-lg mt-10 left-1/2 w-60 z-10"
                initial={{ opacity: 0, y: -6, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: -6, x: "-50%" }}
                transition={{ duration: 0.2 }}
              >
                Calc is short for calculator. <br></br>I&apos;m just using slang.
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </motion.p>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
      >
        <motion.img
          src="black-hole-gif-3.gif"
          alt="blackhole"
          className="w-full rounded-lg shadow-lg shadow-orange-500/10"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}
