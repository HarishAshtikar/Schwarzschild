"use client";

import { useState } from "react";

export default function RadiusCalc() {
  const [mass, setMass] = useState("");
  const [radius, setRadius] = useState<number | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMass(event.target.value);
  };

  const handleCalc = () => {
    if (mass) {
      const num = parseFloat(mass); // Convert the Input string to a number
      setRadius((2 * (6.67430 * 10 ** -11) * num) / 299792458 ** 2);
    } else {
      setRadius(null);
    }
  };

  return (
    <section
      className="
        flex flex-col p-8 px-32 justify-center items-center
        h-full bg-black text-white
      "
    >

      <p className="text-sm text-gray-400 mb-6 text-center">
        Calculate the Schwarzschild radius for any given mass.
      </p>
      
      <input
        type="number"
        name="mass"
        id="mass"
        placeholder="Enter mass in kilograms"
        className="
          w-full rounded-lg p-4 text-black 
          focus:outline-none focus:ring-4 focus:ring-red-500 
          shadow-inner mb-6
        "
        value={mass} // Controlled input
        onChange={handleInputChange} // Update state on input change
      />

      <button
        className="
          bg-gradient-to-r from-orange-500 to-red-600 text-white 
          px-6 py-2 rounded-lg shadow-lg 
          hover:from-orange-400 hover:to-red-500 
          transition-all
        "
        onClick={handleCalc} // Handle the submit action
      >
        Calculate
      </button>

      {radius !== null && (
        <div className="mt-8 text-center">
          <p className="text-lg">Schwarzschild Radius:</p>
          <p className="text-2xl font-bold text-orange-400 mt-2">
            {radius.toExponential(2)} m
          </p>
        </div>
      )}
    </section>
  );
}
