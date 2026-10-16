import BlackHole from "@/components/blackhole";
import RadiusCalc from "@/components/radiuscalc";
import BlackHoleMaker from "@/components/blackholemaker";

export default function Home() {
  return (
    <main className="bg-black font-gabarito text-xl text-white">
      <section className="relative grid min-h-svh md:grid-cols-2">
        <BlackHole />
        <RadiusCalc />

        <a
          href="#machine"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-sm text-gray-500 transition-colors hover:text-orange-400"
        >
          Build a black hole ↓
        </a>
      </section>

      <BlackHoleMaker />
    </main>
  );
}
