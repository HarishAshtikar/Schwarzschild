import BlackHole from "@/components/blackhole";
import RadiusCalc from "@/components/radiuscalc";

export default function Home() {
  return (
    <div className="bg-black flex p-4 gap-4 h-svh font-spacemono text-xl">

      <div className="flex-1">
         <BlackHole></BlackHole>
      </div>
     
      <div className="flex-1">
        <RadiusCalc></RadiusCalc>
      </div>
      
    </div>
  );
}