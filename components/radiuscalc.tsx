"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CountUp from "@/components/countup";
import { describeSize, schwarzschildRadius } from "@/lib/physics";

export default function RadiusCalc() {
  const [mass, setMass] = useState("");
  const [radius, setRadius] = useState<number | null>(null);
  const [error, setError] = useState(false);

  const handleCalc = (event: React.FormEvent) => {
    event.preventDefault();
    const num = parseFloat(mass);
    if (Number.isFinite(num) && num > 0) {
      setError(false);
      setRadius(schwarzschildRadius(num));
    } else {
      setError(mass !== "");
      setRadius(null);
    }
  };

  const size = radius !== null ? describeSize(radius) : null;

  return (
    <motion.section
      className="
        flex flex-col py-12 px-6 md:px-16 justify-center items-center
        h-full text-white
      "
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
    >
      <p className="text-xl text-gray-400 mb-8 text-center">
        Calculate the Schwarzschild Radius for any given mass.
      </p>

      <form onSubmit={handleCalc} className="w-full flex flex-col items-center">
        <input
          type="number"
          name="mass"
          id="mass"
          step="any"
          placeholder="Enter mass in kilograms"
          className="
            w-full rounded-lg p-6 text-black text-center
            transition-shadow duration-300
            focus:outline-none focus:ring-4 focus:ring-red-500
            shadow-inner mb-8
          "
          value={mass}
          onChange={(e) => setMass(e.target.value)}
        />

        <motion.button
          type="submit"
          className="
            px-8 py-4 rounded-lg shadow-lg text-white
            bg-gradient-to-r from-orange-500 via-red-500 to-orange-600
            bg-[length:200%_100%] bg-left hover:bg-right
            transition-[background-position] duration-700 ease-in-out
          "
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Calculate
        </motion.button>
      </form>

      <div className="mt-10 text-center min-h-44" aria-live="polite">
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              key="error"
              className="text-red-400"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              Enter a mass greater than zero.
            </motion.p>
          )}
          {radius !== null && size && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xl">Schwarzschild Radius:</p>
              <p className="text-3xl font-bold text-orange-400 mt-2">
                <CountUp value={radius} /> m
              </p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={size.headline}
                  className="mt-6"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 }}
                >
                  <p className="text-xl text-white">{size.headline}</p>
                  <p className="text-base text-gray-400 mt-1">{size.detail}</p>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
