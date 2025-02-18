// blackhole.tsx
"use client"

import { useState } from "react";

export default function BlackHole() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showInfoCard, setShowInfoCard] = useState(false);

  return (
    <div
      className="
        flex flex-col p-8 px-32 justify-center items-center
        h-full bg-black text-white
      "
    >
      
      <h1 className="text-5xl font-bold mb-4 text-center cursor-pointer hover:text-orange-500"
          onClick={() => setShowInfoCard(true)}>
        Schwarzschild
      </h1>

      {showInfoCard && (
        <div className="absolute left-0 bottom-0 w-1/2 h-full bg-black bg-opacity-80 z-50 animate-slideUp">
          <div className="relative bg-gray-800 p-8 h-full overflow-y-auto text-center">
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-white text-2xl font-bold"
              onClick={() => setShowInfoCard(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">About Schwarzschild</h2>
            <p className="mb-4 text-gray-300">
              Pronunciation: <em>/ʃvartsˈʃɪld/</em>
            </p>
            <p className="mb-4 text-gray-300">
              The Schwarzschild radius is the distance from the center of a
              black hole to its event horizon—the point beyond which nothing can
              escape.
            </p>
            <p className="mb-4 text-gray-300">
              Formula: r<sub>s</sub> = <span className="text-lg">(2GM)/(c²)</span>
            </p>
            <p className="text-gray-300">
              This calculator lets you compute the Schwarzschild radius for a given
              mass, giving insight into the nature of black holes.
            </p>
          </div>
        </div>
      )}

      <p className="text-2xl text-gray-400 mb-16 text-center relative">
        A black hole radius  
        <span
          className="px-1 cursor-pointer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          calc
          {showTooltip && (
            <span className="absolute border-orange-500 border-2 text-white text-sm 
            p-1 rounded-lg shadow-lg mt-10 left-1/2 transform -translate-x-1/2 w-60">
              Calc is short for calculator. <br></br>I'm just using slang.
            </span>
          )}
        </span>
      </p>

      <div className="w-full max-w-md mb-12">
        {/* Replace the below URL with the actual URL of the black hole GIF */}
        <img
          src="black-hole-gif-3.gif"
          alt="blackhole"
          className="w-full rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
}
