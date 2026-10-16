export const G = 6.6743e-11; // gravitational constant, m^3 kg^-1 s^-2
export const C = 299792458; // speed of light, m/s

export type UnitSystem = "metric" | "imperial";

const LB = 0.45359237; // kg per pound
export const FT = 0.3048; // metres per foot
const IN = 0.0254;
const MI = 1609.344;

export const massToKg = (value: number, system: UnitSystem) => (system === "imperial" ? value * LB : value);
export const kgToMass = (kg: number, system: UnitSystem) => (system === "imperial" ? kg / LB : kg);
export const massUnit = (system: UnitSystem) => (system === "imperial" ? "lb" : "kg");
/** Radius expressed in the main unit of the chosen system. */
export const lengthValue = (metres: number, system: UnitSystem) => (system === "imperial" ? metres / FT : metres);
export const lengthUnit = (system: UnitSystem) => (system === "imperial" ? "ft" : "m");

export const schwarzschildRadius = (massKg: number) => (2 * G * massKg) / C ** 2;

// Everyday (and not so everyday) things to compare a radius against, in metres.
const REFERENCES: [name: string, size: number][] = [
  ["the Planck length", 1.616e-35],
  ["a quark", 1e-18],
  ["a proton", 8.4e-16],
  ["an atom", 1e-10],
  ["a strand of DNA", 2e-9],
  ["a virus", 1e-7],
  ["a human hair's width", 7e-5],
  ["a bacterium", 2e-6],
  ["a red blood cell", 8e-6],
  ["a grain of sand", 5e-4],
  ["a peanut", 0.02],
  ["an apple", 0.08],
  ["a basketball", 0.24],
  ["a person", 1.7],
  ["a bus", 12],
  ["a blue whale", 25],
  ["a Boeing 747", 70.6],
  ["the Statue of Liberty", 93],
  ["a football field", 100],
  ["the Great Pyramid", 139],
  ["the Eiffel Tower", 330],
  ["the Empire State Building", 443],
  ["the Burj Khalifa", 828],
  ["Mount Everest", 8849],
  ["the length of Manhattan", 21500],
  ["the Earth", 6.371e6],
  ["Jupiter", 6.99e7],
  ["the Sun", 6.957e8],
  ["the star Betelgeuse", 5.5e11],
  ["the star UY Scuti", 1.18e12],
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

export function formatMass(kg: number, system: UnitSystem = "metric") {
  const value = kgToMass(kg, system);
  const unit = massUnit(system);
  if (value >= 0.01 && value < 1e6) return `${value.toLocaleString("en-US", { maximumFractionDigits: value >= 1000 ? 0 : 2 })} ${unit}`;
  const exp = Math.floor(Math.log10(value));
  return `${(value / 10 ** exp).toFixed(2)} × 10${superscript(exp)} ${unit}`;
}

export interface SizeDescription {
  headline: string;
  detail: string;
}

function compare(radius: number, [name, size]: [string, number]): SizeDescription {
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

/** The few closest comparisons, nearest first, so the UI can cycle through them. */
export function describeSizes(radius: number, count = 4): SizeDescription[] {
  const planck = REFERENCES[0];
  if (radius < planck[1] * 0.7) {
    return [
      {
        headline: `Smaller than ${planck[0]}`,
        detail: "Far below the smallest length physics can meaningfully describe.",
      },
    ];
  }
  return [...REFERENCES]
    .sort((a, b) => Math.abs(Math.log10(radius / a[1])) - Math.abs(Math.log10(radius / b[1])))
    .slice(0, count)
    .map((ref) => compare(radius, ref));
}

/* ------------------------- number representations ------------------------- */

const MAX_DIGITS = 60;

/** Three significant digits and the decimal exponent of x (x > 0). */
function sig3(x: number) {
  let exp = Math.floor(Math.log10(x));
  let mantissa = x / 10 ** exp;
  if (Number(mantissa.toFixed(2)) >= 10) {
    mantissa /= 10;
    exp += 1;
  }
  return { digits: mantissa.toFixed(2).replace(".", ""), exp };
}

/** x written out in full to three significant figures, e.g. 0.0000149. null if absurdly long. */
export function plainDecimal(x: number): string | null {
  const { digits, exp } = sig3(x);
  if (Math.abs(exp) > MAX_DIGITS) return null;
  if (exp < 0) return "0." + "0".repeat(-exp - 1) + digits.replace(/0+$/, "");
  if (exp === 0) return `${digits[0]}.${digits.slice(1)}`.replace(/\.?0+$/, "");
  if (exp === 1) return `${digits.slice(0, 2)}.${digits[2]}`.replace(/\.0$/, "");
  const whole = digits + "0".repeat(exp - 2);
  return whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const SI_PREFIXES = [
  "yocto", "zepto", "atto", "femto", "pico", "nano", "micro", "milli",
  "", "kilo", "mega", "giga", "tera", "peta", "exa", "zetta", "yotta",
];

/** A length with a metric prefix, e.g. "14.9 micrometers". null when it adds nothing over plain metres. */
export function metricLength(metres: number): string | null {
  const { exp } = sig3(metres);
  const group = Math.min(8, Math.max(-8, Math.floor(exp / 3)));
  if (group === 0) return null;
  const value = plainDecimal(metres / 10 ** (group * 3));
  if (value === null) return null;
  return `${value} ${SI_PREFIXES[group + 8]}meters`;
}

const LIGHT_YEAR = 9.461e15;

/** A friendlier second unit: metric prefixes, or inches / miles for imperial. null when it adds nothing. */
export function friendlyLength(metres: number, system: UnitSystem): string | null {
  if (system === "metric") return metricLength(metres);
  if (metres >= LIGHT_YEAR) {
    const ly = plainDecimal(metres / LIGHT_YEAR);
    return ly && `${ly} light-years`;
  }
  if (metres >= MI) {
    const miles = plainDecimal(metres / MI);
    return miles && `${miles} miles`;
  }
  if (metres < FT) {
    const inches = plainDecimal(metres / IN);
    return inches && `${inches} inches`;
  }
  return null; // already shown in feet
}
