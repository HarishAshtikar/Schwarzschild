// blackhole.tsx

export default function BlackHole() {
    return (
      <div
        className="
          flex flex-col p-8 px-32 justify-center items-center
          h-full bg-black text-white
        "
      >
        <h1 className="text-3xl font-bold mb-2 text-center">
          Schwarzschild
        </h1>
  
        <p className="text-lg text-gray-400 mb-12 text-center">
          A black hole radius calculator
        </p>
  
        <div className="w-full max-w-xs mb-8">
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
  