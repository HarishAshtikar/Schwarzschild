"use client";

import { useState } from "react";

export default function RadiusCalc() {
  const [mass, setMass] = useState("");
  const [radius, setRadius] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMass(event.target.value);
  };

  const handleCalc = () => {
    if (mass) {
      const num = parseFloat(mass); // Convert the Input string to a number
      setRadius((2 * (6.67430 * 10 ** -11) * num) / 299792458 ** 2);
      setVisible(true);
    } else {
      setRadius(null);
      setVisible(false);
    }
  };

  return (
    <section
      className="
        flex flex-col p-8 px-32 justify-center items-center
        h-full bg-black text-white 
      "
    >

      <p className="text-xl text-gray-400 mb-8 text-center">
        Calculate the Schwarzschild Radius for any given mass.
      </p>
      
      <input
        type="number"
        name="mass"
        id="mass"
        placeholder="Enter mass in kilograms"
        className="
          w-full rounded-lg p-6 text-black text-center
          focus:outline-none focus:ring-4 focus:ring-red-500 
          shadow-inner mb-8
        "
        value={mass} // Controlled input
        onChange={handleInputChange} // Update state on input change
      />

      <button
        className="
        relative px-8 py-4 rounded-lg shadow-lg text-white overflow-hidden
        bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 
        hover:bg-gradient-to-r hover:from-orange-400 hover:via-red-400 hover:to-orange-500
        transition-[background-position] duration-700 ease-in-out
      "
        onClick={handleCalc} // Handle the submit action
      >
        Calculate
      </button>

      

      <div
        className={`
          mt-10 text-center transition-opacity duration-700 min-h-20
          ${visible ? 'opacity-100' : 'opacity-0'}
        `}
         // Set a minimum height to prevent shifting
      >
        {radius !== null && (
          <>
            <p className="text-xl">Schwarzschild Radius:</p>
            <p className="text-3xl font-bold text-orange-400 mt-2">
              {radius.toExponential(2)} m
            </p>
          </>
        )}
      </div>
    </section>
  );
}
