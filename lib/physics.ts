export const G = 6.6743e-11; // gravitational constant, m^3 kg^-1 s^-2
export const C = 299792458; // speed of light, m/s

export const schwarzschildRadius = (massKg: number) => (2 * G * massKg) / C ** 2;

// Everyday (and not so everyday) things to compare a radius against, in metres.
const REFERENCES: [name: string, size: number][] = [
  ["the Planck length", 1.616e-35],
  ["a quark", 1e-18],
  ["a proton", 8.4e-16],
  ["an atom", 1e-10],
  ["a strand of DNA", 2e-9],
  ["a virus", 1e-7],
  ["a red blood cell", 8e-6],
  ["a grain of sand", 5e-4],
  ["a peanut", 0.02],
  ["an apple", 0.08],
  ["a basketball", 0.24],
  ["a person", 1.7],
  ["a bus", 12],
  ["a football field", 100],
  ["the Eiffel Tower", 330],
  ["Mount Everest", 8849],
  ["the length of Manhattan", 21500],
  ["the Earth", 6.371e6],
  ["Jupiter", 6.99e7],
  ["the Sun", 6.957e8],
  ["the distance from Earth to the Sun", 1.496e11],
  ["the Solar System", 9e12],
  ["a light-year", 9.461e15],
];

const SUPERSCRIPTS = "⁰¹²³⁴⁵⁶⁷⁸⁹";

function superscript(n: number) {
  const digits = String(Math.abs(n))
    .split("")
    .map((d) => SUPERSCRIPTS[Number(d)])
    .join("");
  return (n < 0 ? "⁻" : "") + digits;
}

export function formatMultiple(x: number) {
  if (x < 10) return x.toFixed(1).replace(/\.0$/, "");
  if (x < 1e6) return Math.round(x).toLocaleString("en-US");
  if (x < 1e9) return `${(x / 1e6).toFixed(1).replace(/\.0$/, "")} million`;
  if (x < 1e12) return `${(x / 1e9).toFixed(1).replace(/\.0$/, "")} billion`;
  if (x < 1e15) return `${(x / 1e12).toFixed(1).replace(/\.0$/, "")} trillion`;
  const exp = Math.floor(Math.log10(x));
  return `${(x / 10 ** exp).toFixed(1)} × 10${superscript(exp)}`;
}

export function formatMass(kg: number) {
  if (kg >= 0.01 && kg < 1e6) return `${kg.toLocaleString("en-US", { maximumFractionDigits: 2 })} kg`;
  const exp = Math.floor(Math.log10(kg));
  return `${(kg / 10 ** exp).toFixed(2)} × 10${superscript(exp)} kg`;
}

export interface SizeDescription {
  headline: string;
  detail: string;
}

export function describeSize(radius: number): SizeDescription {
  const [first] = REFERENCES;
  if (radius < first[1] * 0.7) {
    return {
      headline: `Smaller than ${first[0]}`,
      detail: "Far below the smallest length physics can meaningfully describe.",
    };
  }

  let best = REFERENCES[0];
  let bestDist = Infinity;
  for (const ref of REFERENCES) {
    const dist = Math.abs(Math.log10(radius / ref[1]));
    if (dist < bestDist) {
      best = ref;
      bestDist = dist;
    }
  }
  const [name, size] = best;
  const ratio = radius / size;

  if (ratio >= 0.7 && ratio <= 1.4) {
    return { headline: `About the size of ${name}`, detail: "Give or take a little." };
  }
  if (ratio < 0.7) {
    return {
      headline: `Smaller than ${name}`,
      detail: `Roughly ${formatMultiple(1 / ratio)}× smaller than ${name}.`,
    };
  }
  return {
    headline: `Bigger than ${name}`,
    detail: `Roughly ${formatMultiple(ratio)}× bigger than ${name}.`,
  };
}
