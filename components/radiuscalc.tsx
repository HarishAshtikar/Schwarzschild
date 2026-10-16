"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import RadiusReadout from "@/components/radiusreadout";
import { schwarzschildRadius } from "@/lib/physics";

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

  return (
    <motion.section
      className="
        flex flex-col py-10 px-6 md:px-16 justify-center items-center
        h-full text-white
      "
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
    >
      <p className="text-lg text-gray-400 mb-6 text-center">
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
            w-full rounded-lg p-4 text-black text-center
            transition-shadow duration-300
            focus:outline-none focus:ring-4 focus:ring-red-500
            shadow-inner mb-6
          "
          value={mass}
          onChange={(e) => setMass(e.target.value)}
        />

        <motion.button
          type="submit"
          className="
            px-7 py-3 rounded-lg shadow-lg text-white
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

      <div className="mt-8 text-center min-h-72" aria-live="polite">
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
          {radius !== null && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="mb-1 text-base text-gray-300">Schwarzschild Radius:</p>
              <RadiusReadout radius={radius} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
