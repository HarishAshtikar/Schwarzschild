"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import RadiusReadout from "@/components/radiusreadout";
import { formatMass, schwarzschildRadius } from "@/lib/physics";

interface Item {
  id: string;
  name: string;
  emoji: string;
  mass: number; // kg
  the?: boolean; // "The Moon" rather than "Moon"
}

const SUN = 1.989e30;

const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: "Everyday things",
    items: [
      { id: "peanut", name: "Peanut", emoji: "🥜", mass: 1e-3, the: true },
      { id: "car", name: "Car", emoji: "🚗", mass: 1.5e3, the: true },
      { id: "elephant", name: "Elephant", emoji: "🐘", mass: 6e3, the: true },
      { id: "whale", name: "Blue whale", emoji: "🐋", mass: 1.5e5, the: true },
      { id: "bus", name: "School bus", emoji: "🚌", mass: 1.1e4, the: true },
      { id: "airplane", name: "Boeing 747", emoji: "✈️", mass: 3.6e5, the: true },
    ],
  },
  {
    title: "Monuments & landmarks",
    items: [
      { id: "liberty", name: "Statue of Liberty", emoji: "🗽", mass: 2.04e5, the: true },
      { id: "eiffel", name: "Eiffel Tower", emoji: "🗼", mass: 1.01e7, the: true },
      { id: "empire", name: "Empire State Building", emoji: "🏢", mass: 3.3e8, the: true },
      { id: "burj", name: "Burj Khalifa", emoji: "🏙️", mass: 5e8 },
      { id: "pyramid", name: "Great Pyramid", emoji: "🔺", mass: 5.75e9, the: true },
      { id: "mountain", name: "Mount Everest", emoji: "🏔️", mass: 1.6e14 },
    ],
  },
  {
    title: "Planets & space",
    items: [
      { id: "moon", name: "Moon", emoji: "🌙", mass: 7.342e22, the: true },
      { id: "mars", name: "Mars", emoji: "🔴", mass: 6.417e23 },
      { id: "earth", name: "Earth", emoji: "🌍", mass: 5.972e24 },
      { id: "jupiter", name: "Jupiter", emoji: "🪐", mass: 1.898e27 },
      { id: "sun", name: "Sun", emoji: "☀️", mass: SUN, the: true },
      { id: "galaxy", name: "Milky Way", emoji: "🌌", mass: 2.98e42, the: true },
    ],
  },
  {
    title: "The biggest stars we know",
    items: [
      { id: "antares", name: "Antares", emoji: "⭐", mass: 12 * SUN },
      { id: "rigel", name: "Rigel", emoji: "🌠", mass: 21 * SUN },
      { id: "betelgeuse", name: "Betelgeuse", emoji: "🌟", mass: 18 * SUN },
      { id: "vycma", name: "VY Canis Majoris", emoji: "💫", mass: 17 * SUN },
      { id: "uyscuti", name: "UY Scuti", emoji: "✨", mass: 10 * SUN },
      { id: "r136a1", name: "R136a1 (most massive)", emoji: "🔆", mass: 196 * SUN },
    ],
  },
];

const subject = (item: Item) => (item.id === "avatar" ? "You" : item.the ? `The ${item.name}` : item.name);

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

/**
 * Pointer-driven drag. The dragged copy is a "ghost" portalled to <body>, so it
 * is never clipped by the scrolling tray. Mouse drags start after a few pixels;
 * touch drags start after a short press so the tray can still be scrolled.
 */
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
  const sourceRef = useRef<HTMLDivElement>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const latest = useRef({ onDropInMachine, onOverMachine });
  latest.current = { onDropInMachine, onOverMachine };

  const isOver = (x: number, y: number) => {
    const rect = machineRef.current?.getBoundingClientRect();
    return !!rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || e.button !== 0) return;
    const rect = sourceRef.current!.getBoundingClientRect();
    const size = { w: rect.width, h: rect.height };
    const start = { x: e.clientX, y: e.clientY };
    const isTouch = e.pointerType === "touch";
    let dragging = false;
    let pressTimer: ReturnType<typeof setTimeout> | undefined;

    const preventScroll = (ev: TouchEvent) => ev.preventDefault();

    const begin = (x: number, y: number) => {
      dragging = true;
      setGhost({ x, y, ...size });
      if (isTouch) window.addEventListener("touchmove", preventScroll, { passive: false });
    };

    const cleanup = () => {
      clearTimeout(pressTimer);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("touchmove", preventScroll);
    };

    const move = (ev: PointerEvent) => {
      if (!dragging) {
        const moved = Math.hypot(ev.clientX - start.x, ev.clientY - start.y);
        if (isTouch) {
          if (moved > 8) cleanup(); // the user is scrolling, not dragging
        } else if (moved > 4) {
          begin(ev.clientX, ev.clientY);
        }
        return;
      }
      setGhost({ x: ev.clientX, y: ev.clientY, ...size });
      latest.current.onOverMachine(isOver(ev.clientX, ev.clientY));
    };

    const up = (ev: PointerEvent) => {
      const wasDragging = dragging;
      cleanup();
      if (!wasDragging) return;
      setGhost(null);
      latest.current.onOverMachine(false);
      if (isOver(ev.clientX, ev.clientY)) latest.current.onDropInMachine();
    };

    const cancel = () => {
      const wasDragging = dragging;
      cleanup();
      if (wasDragging) {
        setGhost(null);
        latest.current.onOverMachine(false);
      }
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    if (isTouch) pressTimer = setTimeout(() => begin(start.x, start.y), 250);
  };

  return (
    <>
      <motion.div
        ref={sourceRef}
        className={`select-none [touch-action:pan-y] ${disabled ? "opacity-40" : "cursor-grab"} ${ghost ? "opacity-30" : ""} ${className ?? ""}`}
        whileHover={disabled || ghost ? undefined : { scale: 1.08 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        onPointerDown={handlePointerDown}
        onDragStart={(e) => e.preventDefault()}
      >
        {children}
      </motion.div>
      {ghost &&
        createPortal(
          <div
            className={`pointer-events-none fixed z-[1000] cursor-grabbing drop-shadow-[0_10px_20px_rgba(249,115,22,0.35)] ${className ?? ""}`}
            style={{
              left: ghost.x,
              top: ghost.y,
              width: ghost.w,
              height: ghost.h,
              transform: "translate(-50%, -50%) scale(1.2)",
            }}
          >
            {children}
          </div>,
          document.body,
        )}
    </>
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
      <Avatar weight={weight} className="h-20 w-auto" />
    ) : (
      <span className="text-5xl leading-none">{item?.emoji}</span>
    );

  return (
    <motion.div
      ref={machineRef}
      className="relative mx-auto flex h-full w-full max-w-[22rem] flex-col"
      animate={
        active
          ? { x: [0, -3, 3, -2, 2, 0], y: [0, 2, -2, 1, -1, 0] }
          : { x: 0, y: 0 }
      }
      transition={active ? { duration: 0.25, repeat: Infinity } : { duration: 0.3 }}
    >
      {/* hopper */}
      <div className="relative mx-auto h-10 w-[80%] shrink-0">
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
              className="absolute inset-0 flex items-center justify-center gap-2 pb-1 text-[10px] tracking-[0.3em] text-orange-300"
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
        className="relative mx-auto min-h-[9rem] w-full flex-1 overflow-hidden rounded-3xl border-2 bg-gradient-to-b from-neutral-900 to-black"
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
              initial={phase === "falling" ? { y: -150, scale: 1, opacity: 0 } : false}
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
              className="absolute left-1/2 top-1/2 -ml-10 -mt-10 h-20 w-20"
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
              <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black shadow-[0_0_12px_5px_rgba(0,0,0,1)]" />
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
      <div className="mx-auto mt-1.5 flex w-[92%] shrink-0 items-center justify-between rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2">
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
        <span className="font-spacemono text-xs tracking-widest text-orange-300">{STATUS[phase]}</span>
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

  // On small screens the result is below the fold, so bring it into view.
  useEffect(() => {
    if (phase !== "done" || window.matchMedia("(min-width: 1024px)").matches) return;
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

  const drag = (chosen: Item) => ({
    machineRef,
    disabled: busy,
    onDropInMachine: () => run(chosen),
    onOverMachine: setHovering,
  });

  return (
    <section id="machine" className="relative px-6 py-8 md:px-12 lg:h-svh lg:min-h-[700px] lg:py-6">
      <div className="mx-auto grid h-full max-w-6xl gap-x-10 gap-y-5 lg:grid-cols-2 lg:grid-rows-[auto_minmax(0,1fr)]">
        {/* heading + avatar (top left) */}
        <div className="flex flex-col gap-3 lg:col-start-1 lg:row-start-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-2xl font-bold md:text-3xl">
              The <span className="text-orange-500">Black Hole</span> Maker
            </h2>
            <p className="mt-1.5 text-sm leading-snug text-gray-400">
              Squeeze anything small enough and it becomes a black hole. Drag your avatar, or something
              bigger, into the machine and watch it collapse.
            </p>
          </motion.div>

          <motion.div
            className="flex items-center gap-5 rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-3"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Draggable
              {...drag({ id: "avatar", name: "You", emoji: "🧍", mass: weightValid ? weight : 70 })}
              disabled={busy || !weightValid}
              className="flex h-24 w-16 shrink-0 items-end justify-center"
            >
              <Avatar weight={weightValid ? weight : 70} className="h-24 w-auto" />
            </Draggable>
            <div className="flex-1">
              <label htmlFor="weight" className="text-base font-semibold">
                Your weight
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  id="weight"
                  type="number"
                  min={1}
                  step="any"
                  value={weightText}
                  onChange={(e) => setWeightText(e.target.value)}
                  className="w-24 rounded-lg p-2 text-center text-base text-black transition-shadow focus:outline-none focus:ring-4 focus:ring-red-500"
                />
                <span className="text-sm text-gray-400">kg</span>
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                {weightValid ? "Now drag your avatar into the machine." : "Enter a weight above zero."}
              </p>
            </div>
          </motion.div>
        </div>

        {/* machine (top right): as tall as the heading + avatar beside it */}
        <div className="order-first lg:order-none lg:col-start-2 lg:row-start-1">
          <Machine
            machineRef={machineRef}
            item={item}
            weight={weightValid ? weight : 70}
            phase={phase}
            hovering={hovering && !busy}
          />
        </div>

        {/* scrolling tray (bottom left) */}
        <div className="flex max-h-[24rem] min-h-0 flex-col rounded-2xl border border-white/10 bg-neutral-900/40 lg:col-start-1 lg:row-start-2 lg:max-h-none">
          <h3 className="shrink-0 px-4 pt-3 pb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            …or pick something bigger
          </h3>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 [scrollbar-color:#525252_transparent] [scrollbar-width:thin]">
            <div className="flex flex-col gap-5">
              {GROUPS.map((group) => (
                <div key={group.title}>
                  <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-orange-400/80">
                    {group.title}
                  </h4>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {group.items.map((o) => (
                      <Draggable
                        key={o.id}
                        {...drag(o)}
                        className="flex h-full flex-col items-center rounded-xl border border-white/10 bg-neutral-900 px-1 py-2 hover:border-orange-500/60"
                      >
                        <span className="text-3xl leading-none">{o.emoji}</span>
                        <span className="mt-1.5 text-center text-[11px] leading-tight text-gray-300">{o.name}</span>
                        <span className="text-[9px] text-gray-500">{formatMass(o.mass)}</span>
                      </Draggable>
                    ))}
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-600">Star masses are estimates and vary between studies.</p>
            </div>
          </div>
        </div>

        {/* result (bottom right) */}
        <div ref={resultRef} className="min-h-0 text-center lg:col-start-2 lg:row-start-2 [&>div]:h-full" aria-live="polite">
          <AnimatePresence mode="wait">
            {result && item ? (
              <motion.div
                key={item.id + "result"}
                className="flex h-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-neutral-900/80 p-5"
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <p className="text-base text-gray-400">
                  {subject(item)} <span className="text-white">({formatMass(item.mass)})</span> would become a
                  black hole with a radius of
                </p>
                <div className="mt-3">
                  <RadiusReadout radius={result.radius} large />
                </div>
                <motion.button
                  className="mt-5 rounded-lg border border-orange-500/60 px-6 py-2 text-base text-orange-300 transition-colors hover:bg-orange-500 hover:text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={reset}
                >
                  Make another
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                className="flex h-full min-h-24 items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 text-sm text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {busy ? "Compressing…" : "Your black hole's size will appear here."}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
