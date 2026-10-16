"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CountUp from "@/components/countup";
import { describeSize, formatMass, schwarzschildRadius } from "@/lib/physics";

interface Item {
  id: string;
  name: string;
  emoji: string;
  mass: number; // kg
}

const OBJECTS: Item[] = [
  { id: "peanut", name: "Peanut", emoji: "🥜", mass: 1e-3 },
  { id: "car", name: "Car", emoji: "🚗", mass: 1.5e3 },
  { id: "elephant", name: "Elephant", emoji: "🐘", mass: 6e3 },
  { id: "whale", name: "Blue whale", emoji: "🐋", mass: 1.5e5 },
  { id: "airplane", name: "Boeing 747", emoji: "✈️", mass: 3.6e5 },
  { id: "mountain", name: "Mount Everest", emoji: "🏔️", mass: 1.6e14 },
  { id: "moon", name: "The Moon", emoji: "🌙", mass: 7.342e22 },
  { id: "earth", name: "Earth", emoji: "🌍", mass: 5.972e24 },
  { id: "jupiter", name: "Jupiter", emoji: "🪐", mass: 1.898e27 },
  { id: "sun", name: "The Sun", emoji: "☀️", mass: 1.989e30 },
  { id: "galaxy", name: "Milky Way", emoji: "🌌", mass: 2.98e42 },
];

type Phase = "idle" | "falling" | "shrinking" | "collapse" | "done";

const STATUS: Record<Phase, string> = {
  idle: "READY",
  falling: "LOADING",
  shrinking: "COMPRESSING",
  collapse: "COLLAPSING",
  done: "SINGULARITY",
};

/* ------------------------------ avatar ------------------------------ */

function Avatar({ weight, className }: { weight: number; className?: string }) {
  const width = Math.min(1.5, Math.max(0.8, 0.8 + (weight / 70) * 0.2));
  return (
    <svg
      viewBox="0 0 100 160"
      className={className}
      style={{ transform: `scaleX(${width})`, transition: "transform 0.4s ease" }}
      aria-label="Your avatar"
    >
      <defs>
        <linearGradient id="avatar-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fb923c" />
          <stop offset="1" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="26" r="20" fill="#fde68a" />
      <circle cx="43" cy="24" r="2.4" fill="#1f2937" />
      <circle cx="57" cy="24" r="2.4" fill="#1f2937" />
      <path d="M42 33 Q50 40 58 33" stroke="#1f2937" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <rect x="28" y="50" width="44" height="52" rx="16" fill="url(#avatar-body)" />
      <rect x="12" y="54" width="14" height="46" rx="7" fill="url(#avatar-body)" />
      <rect x="74" y="54" width="14" height="46" rx="7" fill="url(#avatar-body)" />
      <rect x="31" y="98" width="17" height="54" rx="8" fill="#374151" />
      <rect x="52" y="98" width="17" height="54" rx="8" fill="#374151" />
    </svg>
  );
}

/* --------------------------- drag wrapper --------------------------- */

function Draggable({
  children,
  machineRef,
  disabled,
  onDropInMachine,
  onOverMachine,
  className,
}: {
  children: ReactNode;
  machineRef: RefObject<HTMLDivElement | null>;
  disabled?: boolean;
  onDropInMachine: () => void;
  onOverMachine: (over: boolean) => void;
  className?: string;
}) {
  const isOver = (point: { x: number; y: number }) => {
    const rect = machineRef.current?.getBoundingClientRect();
    if (!rect) return false;
    const x = point.x - window.scrollX;
    const y = point.y - window.scrollY;
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  };

  return (
    <motion.div
      className={`touch-none select-none ${disabled ? "opacity-40" : "cursor-grab"} ${className ?? ""}`}
      drag={!disabled}
      dragSnapToOrigin
      dragMomentum={false}
      dragElastic={0.15}
      whileHover={disabled ? undefined : { scale: 1.08 }}
      whileDrag={{ scale: 1.25, zIndex: 100, cursor: "grabbing" }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      onDrag={(_, info) => onOverMachine(isOver(info.point))}
      onDragEnd={(_, info) => {
        onOverMachine(false);
        if (isOver(info.point)) onDropInMachine();
      }}
    >
      {children}
    </motion.div>
  );
}

/* ----------------------------- the machine ----------------------------- */

const PARTICLES = Array.from({ length: 20 }, (_, i) => {
  const angle = (i / 20) * Math.PI * 2;
  return { x: Math.cos(angle) * 170, y: Math.sin(angle) * 170, delay: (i % 5) * 0.12 };
});

function Machine({
  machineRef,
  item,
  weight,
  phase,
  hovering,
}: {
  machineRef: RefObject<HTMLDivElement | null>;
  item: Item | null;
  weight: number;
  phase: Phase;
  hovering: boolean;
}) {
  const active = phase === "shrinking" || phase === "collapse";
  const holeVisible = phase === "collapse" || phase === "done";

  const visual =
    item?.id === "avatar" ? (
      <Avatar weight={weight} className="h-28 w-auto" />
    ) : (
      <span className="text-7xl leading-none">{item?.emoji}</span>
    );

  return (
    <motion.div
      ref={machineRef}
      className="relative mx-auto w-full max-w-md"
      animate={
        active
          ? { x: [0, -3, 3, -2, 2, 0], y: [0, 2, -2, 1, -1, 0] }
          : { x: 0, y: 0 }
      }
      transition={active ? { duration: 0.25, repeat: Infinity } : { duration: 0.3 }}
    >
      {/* hopper */}
      <div className="relative mx-auto h-20 w-[85%]">
        <div
          className={`absolute inset-0 transition-colors duration-300 ${hovering ? "bg-orange-500" : "bg-neutral-700"}`}
          style={{ clipPath: "polygon(0 0, 100% 0, 78% 100%, 22% 100%)" }}
        />
        <div
          className="absolute inset-x-1 top-1 bottom-0 bg-neutral-900"
          style={{ clipPath: "polygon(0 0, 100% 0, 78% 100%, 22% 100%)" }}
        />
        <AnimatePresence>
          {phase === "idle" && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center text-xs tracking-[0.3em] text-orange-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: hovering ? 1 : [0.4, 1, 0.4] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              DROP HERE
              <motion.span animate={{ y: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                ▼
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* chamber */}
      <motion.div
        className="relative mx-auto h-72 overflow-hidden rounded-3xl border-2 bg-gradient-to-b from-neutral-900 to-black"
        animate={{
          borderColor: hovering ? "#f97316" : active ? "#ef4444" : "#404040",
          boxShadow: active
            ? "0 0 60px 8px rgba(239,68,68,0.45), inset 0 0 40px rgba(249,115,22,0.35)"
            : hovering
              ? "0 0 40px 4px rgba(249,115,22,0.4)"
              : "0 0 0px 0px rgba(0,0,0,0)",
        }}
        transition={{ duration: 0.4 }}
      >
        {/* converging particles */}
        {phase === "shrinking" &&
          PARTICLES.map((p, i) => (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-orange-300"
              initial={{ x: p.x, y: p.y, opacity: 0, scale: 1 }}
              animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: 0.3 }}
              transition={{ duration: 0.9, delay: p.delay, repeat: Infinity, ease: "easeIn" }}
            />
          ))}

        {/* the item being crushed */}
        <AnimatePresence>
          {item && phase !== "collapse" && phase !== "done" && (
            <motion.div
              key={item.id + phase.slice(0, 1)}
              className="absolute left-1/2 top-1/2 -ml-0 -mt-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              initial={phase === "falling" ? { y: -260, scale: 1, opacity: 0 } : false}
              animate={
                phase === "falling"
                  ? { y: 0, scale: 1, opacity: 1 }
                  : { scale: [1, 0.85, 0.5, 0.2, 0.04], rotate: [0, 12, -12, 180, 540], y: 0, opacity: 1 }
              }
              transition={
                phase === "falling"
                  ? { type: "spring", stiffness: 120, damping: 14 }
                  : { duration: 2.7, ease: "easeIn" }
              }
            >
              {visual}
            </motion.div>
          )}
        </AnimatePresence>

        {/* shockwave + flash */}
        {phase === "collapse" && (
          <>
            <motion.div
              className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-orange-400"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 12, opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.7, times: [0, 0.25, 1] }}
            />
          </>
        )}

        {/* the black hole itself */}
        <AnimatePresence>
          {holeVisible && (
            <motion.div
              className="absolute left-1/2 top-1/2 -ml-14 -mt-14 h-28 w-28"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 12, delay: 0.1 }}
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, #fb923c, #ef4444, #7c2d12, #fde68a, #fb923c)",
                  WebkitMaskImage: "radial-gradient(circle, transparent 28%, black 32%, black 55%, transparent 70%)",
                  maskImage: "radial-gradient(circle, transparent 28%, black 32%, black 55%, transparent 70%)",
                  filter: "blur(1.5px)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black shadow-[0_0_16px_6px_rgba(0,0,0,1)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {phase === "idle" && !item && (
          <div className="absolute inset-0 flex items-center justify-center px-8 text-center text-sm text-neutral-500">
            Drag your avatar or any object into the machine
          </div>
        )}
      </motion.div>

      {/* base panel */}
      <div className="mx-auto mt-2 flex w-[92%] items-center justify-between rounded-xl border border-neutral-700 bg-neutral-900 px-5 py-3">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-3 w-3 rounded-full"
              animate={{
                backgroundColor: phase === "idle" ? "#404040" : active ? "#ef4444" : "#f97316",
                opacity: active ? [1, 0.3, 1] : 1,
              }}
              transition={{ duration: 0.5, repeat: active ? Infinity : 0, delay: i * 0.15 }}
            />
          ))}
        </div>
        <span className="font-spacemono text-sm tracking-widest text-orange-300">{STATUS[phase]}</span>
      </div>
    </motion.div>
  );
}

/* ------------------------------- section ------------------------------- */

export default function BlackHoleMaker() {
  const machineRef = useRef<HTMLDivElement>(null);
  const [weightText, setWeightText] = useState("70");
  const [item, setItem] = useState<Item | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [hovering, setHovering] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  const weight = parseFloat(weightText);
  const weightValid = Number.isFinite(weight) && weight > 0;
  const busy = phase !== "idle" && phase !== "done";

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Bring the result into view once the collapse finishes.
  useEffect(() => {
    if (phase !== "done") return;
    const t = setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 300);
    return () => clearTimeout(t);
  }, [phase]);

  const run = (chosen: Item) => {
    if (busy) return;
    timers.current.forEach(clearTimeout);
    setItem(chosen);
    setPhase("falling");
    timers.current = [
      setTimeout(() => setPhase("shrinking"), 1000),
      setTimeout(() => setPhase("collapse"), 1000 + 2800),
      setTimeout(() => setPhase("done"), 1000 + 2800 + 1000),
    ];
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    setPhase("idle");
    setItem(null);
  };

  const result = phase === "done" && item ? { radius: schwarzschildRadius(item.mass) } : null;
  const size = result ? describeSize(result.radius) : null;

  const drag = (chosen: Item) => ({
    machineRef,
    disabled: busy,
    onDropInMachine: () => run(chosen),
    onOverMachine: setHovering,
  });

  return (
    <section id="machine" className="relative px-6 py-24 md:px-16">
      <motion.div
        className="mx-auto mb-14 max-w-2xl text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl font-bold md:text-5xl">
          The <span className="text-orange-500">Black Hole</span> Maker
        </h2>
        <p className="mt-4 text-gray-400">
          Squeeze anything small enough and it becomes a black hole. Drag your avatar, or something
          bigger, into the machine and watch it collapse.
        </p>
      </motion.div>

      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
        {/* machine + result */}
        <div className="order-first lg:order-last">
          <Machine
            machineRef={machineRef}
            item={item}
            weight={weightValid ? weight : 70}
            phase={phase}
            hovering={hovering && !busy}
          />

          <div ref={resultRef} className="mt-8 min-h-48 text-center" aria-live="polite">
            <AnimatePresence>
              {result && item && size && (
                <motion.div
                  key={item.id + "result"}
                  className="rounded-2xl border border-white/10 bg-neutral-900/80 p-6"
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <p className="text-gray-400">
                    {item.id === "avatar" ? "You" : `The ${item.name.replace(/^The /, "")}`}{" "}
                    <span className="text-white">({formatMass(item.mass)})</span> would become a black hole with a
                    radius of
                  </p>
                  <p className="mt-2 text-4xl font-bold text-orange-400">
                    <CountUp value={result.radius} /> m
                  </p>
                  <motion.div
                    className="mt-5"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                  >
                    <p className="text-xl">{size.headline}</p>
                    <p className="mt-1 text-gray-400">{size.detail}</p>
                  </motion.div>
                  <motion.button
                    className="mt-6 rounded-lg border border-orange-500/60 px-6 py-2 text-orange-300 transition-colors hover:bg-orange-500 hover:text-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={reset}
                  >
                    Make another
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* avatar + objects. z-20 keeps a dragged tile above the machine. */}
        <div className="relative z-20 flex flex-col gap-10">
          <motion.div
            className="flex items-center gap-8 rounded-2xl border border-white/10 bg-neutral-900/60 p-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Draggable
              {...drag({ id: "avatar", name: "You", emoji: "🧍", mass: weightValid ? weight : 70 })}
              disabled={busy || !weightValid}
              className="flex h-40 w-24 shrink-0 items-end justify-center"
            >
              <Avatar weight={weightValid ? weight : 70} className="h-40 w-auto" />
            </Draggable>
            <div className="flex-1">
              <label htmlFor="weight" className="text-lg font-semibold">
                Your weight
              </label>
              <div className="mt-3 flex items-center gap-3">
                <input
                  id="weight"
                  type="number"
                  min={1}
                  step="any"
                  value={weightText}
                  onChange={(e) => setWeightText(e.target.value)}
                  className="w-28 rounded-lg p-3 text-center text-black transition-shadow focus:outline-none focus:ring-4 focus:ring-red-500"
                />
                <span className="text-gray-400">kg</span>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                {weightValid ? "Now drag your avatar into the machine." : "Enter a weight above zero."}
              </p>
            </div>
          </motion.div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">…or pick something bigger</h3>
            <motion.div
              className="grid grid-cols-3 gap-3 sm:grid-cols-4"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ staggerChildren: 0.05 }}
            >
              {OBJECTS.map((o) => (
                <motion.div
                  key={o.id}
                  variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                >
                  <Draggable
                    {...drag(o)}
                    className="flex flex-col items-center rounded-xl border border-white/10 bg-neutral-900/60 px-2 py-3 hover:border-orange-500/60"
                  >
                    <span className="text-4xl leading-none">{o.emoji}</span>
                    <span className="mt-2 text-center text-xs text-gray-300">{o.name}</span>
                    <span className="text-[10px] text-gray-500">{formatMass(o.mass)}</span>
                  </Draggable>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
