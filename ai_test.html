import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from "framer-motion";

/* ───────── palette ───────── */
const C = {
  bg: "#F5EDE3",
  cardBg: "rgba(255,255,255,0.55)",
  primary: "#E8976E",
  primaryDark: "#D4784E",
  secondary: "#7FB5A8",
  text: "#3D3D3D",
  textLight: "#6E6E6E",
  accent: "#E8976E",
};

/* ───────── floating particles ───────── */
const FloatingParticles = React.memo(() => {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 3,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 8,
    opacity: Math.random() * 0.15 + 0.05,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.id % 3 === 0 ? C.primary : C.secondary,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, -10, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",          }}
        />
      ))}
    </div>
  );
});

/* ───────── 3D Globe ───────── */
const Globe3D = ({ scrollY }: { scrollY: number }) => {
  const y = useTransform(scrollY, [0, 500], [0, -60]);
  const rotate = useTransform(scrollY, [0, 500], [0, 30]);
  const scale = useTransform(scrollY, [0, 500], [1, 0.85]);

  return (
    <motion.div
      style={{ y, scale }}
      className="relative flex-shrink-0"
    >
      {/* Globe container */}
      <motion.div
        className="w-[280px] h-[280px] md:w-[340px] md:h-[340px] relative"
        animate={{ rotate: rotate.get() }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Globe sphere */}
        <div
          className="w-full h-full rounded-full relative overflow-hidden"
          style={{
            background: `
              radial-gradient(circle at 35% 35%, #A8D5C8, #7FB5A8 40%, #5A9B8E 70%, #3D7A6F)
            `,
            boxShadow: `
              inset -30px -20px 40px rgba(0,0,0,0.15),
              inset 15px 15px 30px rgba(255,255,255,0.2),
              0 20px 60px rgba(94,166,145,0.3),
              0 0 120px rgba(94,166,145,0.1)
            `,
          }}
        >
          {/* Continent shapes */}
          <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full" style={{ opacity: 0.6 }}>
            {/* Europe-ish */}
            <path d="M130,80 Q150,70 160,90 Q170,100 155,120 Q145,130 135,120 Q125,110 130,80Z" fill="#E8D5C0" />
            {/* Africa-ish */}
            <path d="M140,140 Q160,130 175,150 Q180,180 170,210 Q160,230 145,220 Q135,200 130,180 Q125,160 140,140Z" fill="#E8D5C0" />
            {/* Americas-ish */}
            <path d="M80,90 Q95,80 100,100 Q105,130 95,160 Q85,170 75,155 Q70,130 80,90Z" fill="#E8D5C0" />
            {/* Grid lines */}
            <ellipse cx="150" cy="150" rx="140" ry="140" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            <ellipse cx="150" cy="150" rx="140" ry="60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />            <ellipse cx="150" cy="150" rx="60" ry="140" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            <line x1="10" y1="150" x2="290" y2="150" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            <line x1="150" y1="10" x2="150" y2="290" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          </svg>
          {/* Highlight */}
          <div
            className="absolute top-6 left-8 w-20 h-16 rounded-full"
            style={{
              background: "radial-gradient(ellipse, rgba(255,255,255,0.35), transparent)",
              filter: "blur(4px)",
            }}
          />
        </div>

        {/* Stand */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[120px] h-[80px]">
          {/* Arc */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: "6px solid #D4A574",
              borderTop: "6px solid transparent",
              borderBottom: "6px solid #C49564",
              transform: "rotateX(10deg)",
            }}
          />
          {/* Base */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60px] h-[12px] rounded-full"
            style={{
              background: "linear-gradient(to bottom, #D4A574, #B8895E)",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ───────── Book Stack ───────── */
const BookStack = ({ scrollY }: { scrollY: number }) => {
  const y = useTransform(scrollY, [0, 500], [0, -30]);
  const x = useTransform(scrollY, [0, 500], [0, -15]);

  const books = [
    { color: "#E8976E", height: "h-[28px]" },
    { color: "#7FB5A8", height: "h-[28px]" },
    { color: "#6B8EAD", height: "h-[28px]" },
    { color: "#5A9B8E", height: "h-[28px]" },    { color: "#D4A574", height: "h-[28px]" },
  ];

  return (
    <motion.div style={{ y, x }} className="flex-shrink-0">
      <div className="relative">
        {books.map((book, i) => (
          <div
            key={i}
            className={`w-[100px] ${book.height} rounded-md relative`}
            style={{
              background: `linear-gradient(135deg, ${book.color}, ${book.color}dd)`,
              boxShadow: `0 ${2 + i * 1}px ${8 + i * 2}px rgba(0,0,0,${0.08 + i * 0.02}), inset 0 1px 0 rgba(255,255,255,0.3)`,
              marginLeft: `${-i * 2}px`,
              marginBottom: "2px",
              transform: `rotate(${[-1.5, 1, -0.5, 2, -1][i]}deg)`,
            }}
          >
            <div className="absolute left-2 top-0 bottom-0 w-[3px] rounded-l" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

/* ───────── Laptop ───────── */
const Laptop3D = ({ scrollY }: { scrollY: number }) => {
  const y = useTransform(scrollY, [0, 500], [0, -40]);
  const rotateY = useTransform(scrollY, [0, 500], [0, -8]);
  const scale = useTransform(scrollY, [0, 500], [1, 0.9]);

  return (
    <motion.div style={{ y, rotateY, scale }} className="flex-shrink-0">
      <div className="relative">
        {/* Screen */}
        <div
          className="w-[200px] h-[130px] rounded-t-xl relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #F0E6D8, #E8DDD0)",
            boxShadow: `
              inset 0 2px 10px rgba(0,0,0,0.05),
              0 -2px 8px rgba(0,0,0,0.05)
            `,
            border: "3px solid #D4C4B0",
            borderBottom: "none",
          }}
        >
          {/* Screen content */}
          <div className="absolute inset-3 rounded-md bg-[#FAF5EE] overflow-hidden">            <div className="flex items-center gap-2 px-2 pt-1">
              <div className="w-2 h-2 rounded-full bg-[#E8976E]" />
              <div className="w-2 h-2 rounded-full bg-[#D4A574]" />
              <div className="w-2 h-2 rounded-full bg-[#7FB5A8]" />
            </div>
            <div className="mt-3 px-2">
              <div className="w-20 h-3 rounded bg-[#E8DDD0]" />
              <div className="mt-1 w-16 h-2 rounded bg-[#E8DDD0] opacity-50" />
              <div className="mt-2 w-12 h-3 rounded bg-[#7FB5A8] opacity-60" />
            </div>
          </div>
        </div>
        {/* Keyboard base */}
        <div
          className="w-[220px] h-[16px] rounded-b-lg relative"
          style={{
            background: "linear-gradient(to bottom, #D4C4B0, #C4B4A0)",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
            marginLeft: "-10px",
          }}
        >
          {/* Keyboard dots */}
          <div className="absolute inset-1 flex items-center justify-center gap-[2px]">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-[5px] h-[6px] rounded-sm"
                style={{ backgroundColor: "#B8A898" }}
              />
            ))}
          </div>
          {/* Trackpad */}
          <div
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[30px] h-[8px] rounded-sm"
            style={{ backgroundColor: "#C4B4A0" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

/* ──────── Plant ───────── */
const Plant = ({ scrollY, delay = 0 }: { scrollY: number; delay?: number }) => {
  const y = useTransform(scrollY, [0, 500], [0, -20]);
  const sway = useTransform(scrollY, [0, 500], [0, 3]);

  return (
    <motion.div style={{ y }} className="flex-shrink-0">
      <div className="relative">        {/* Pot */}
        <div
          className="w-[36px] h-[28px] rounded-b-lg mx-auto"
          style={{
            background: "linear-gradient(to bottom, #D4A574, #C49564)",
            boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
          }}
        />
        {/* Leaves */}
        <motion.div
          className="absolute -top-10 left-1/2 -translate-x-1/2"
          animate={{ rotate: sway.get() }}
          style={{ transformOrigin: "bottom center" }}
        >
          {[0, 40, -40, 70, -70].map((angle, i) => (
            <div
              key={i}
              className="absolute w-[10px] h-[20px] rounded-full"
              style={{
                backgroundColor: i % 2 === 0 ? "#7FB5A8" : "#6BA89A",
                transform: `rotate(${angle}deg) translateY(-${8 + i * 2}px)`,
                transformOrigin: "bottom center",
                opacity: 0.8 + Math.random() * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

/* ───────── Mountains ───────── */
const Mountains = ({ scrollY }: { scrollY: number }) => {
  const y = useTransform(scrollY, [0, 500], [0, -50]);
  const x = useTransform(scrollY, [0, 500], [0, 20]);

  return (
    <motion.div style={{ y, x }} className="absolute right-0 bottom-0 flex-shrink-0">
      <svg width="200" height="160" viewBox="0 0 200 160" fill="none">
        {/* Far mountain */}
        <path d="M20,160 L80,40 L140,160Z" fill="#E8D5C0" opacity="0.5" />
        {/* Near mountain */}
        <path d="M60,160 L130,60 L200,160Z" fill="#D4B896" opacity="0.6" />
        {/* Snow cap */}
        <path d="M120,60 L130,75 L110,75Z" fill="white" opacity="0.8" />
        {/* Small building */}
        <rect x="150" y="120" width="24" height="20" fill="#E8D5C0" rx="1" />
        <path d="M148,120 L162,108 L176,120Z" fill="#D4B896" />
        <rect x="157" y="128" width="6" height="12" fill="#C4A882" />      </svg>
    </motion.div>
  );
};

/* ───────── Speech Bubbles ───────── */
const SpeechBubbles = ({ scrollY }: { scrollY: number }) => {
  const y1 = useTransform(scrollY, [0, 500], [0, -45]);
  const y2 = useTransform(scrollY, [0, 500], [0, -35]);
  const float1 = useTransform(scrollY, [0, 500], [0, 8]);
  const float2 = useTransform(scrollY, [0, 500], [0, -6]);

  return (
    <>
      {/* "A" bubble */}
      <motion.div
        style={{ y: y1 }}
        animate={{ y: [0, float1.get(), 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-[30%]"
      >
        <div
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-xl font-bold"
          style={{
            backgroundColor: "#F0E6D8",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          }}
        >
          <span style={{ color: C.primaryDark }}>A</span>
        </div>
        {/* Tail */}
        <div
          className="absolute bottom-0 left-4 w-3 h-3 rotate-45"
          style={{ backgroundColor: "#F0E6D8" }}
        />
      </motion.div>

      {/* "文" bubble */}
      <motion.div
        style={{ y: y2 }}
        animate={{ y: [0, float2.get(), 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-32 left-[42%]"
      >
        <div
          className="w-[56px] h-[56px] rounded-full flex items-center justify-center text-xl"
          style={{
            backgroundColor: "#D5E8E0",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          }}        >
          <span style={{ color: "#5A9B8E" }}>文</span>
        </div>
        <div
          className="absolute bottom-0 right-4 w-3 h-3 rotate-45"
          style={{ backgroundColor: "#D5E8E0" }}
        />
      </motion.div>
    </>
  );
};

/* ───────── Cloud ──────── */
const Cloud = ({ className, delay, scrollY }: { className: string; delay: number; scrollY: number }) => {
  const y = useTransform(scrollY, [0, 500], [0, -25]);

  return (
    <motion.div
      className={`absolute ${className}`}
      style={{ y }}
      animate={{ x: [0, 15, 0] }}
      transition={{ duration: 8, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width="60" height="30" viewBox="0 0 60 30" fill="white" opacity="0.6">
        <circle cx="15" cy="18" r="12" />
        <circle cx="30" cy="12" r="14" />
        <circle cx="45" cy="18" r="10" />
      </svg>
    </motion.div>
  );
};

/* ───────── Stats Card ───────── */
const StatCard = ({
  icon,
  title,
  desc,
  index,
  scrollY,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  index: number;
  scrollY: number;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const y = useTransform(scrollY, [0, 500], [0, -20]);
  return (
    <motion.div
      ref={ref}
      style={{ y }}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      className="flex-1 min-w-[180px] max-w-[220px] p-5 rounded-2xl cursor-pointer"
      style={{
        backgroundColor: C.cardBg,
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.6)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
      }}
    >
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="font-semibold text-sm mb-1" style={{ color: C.text }}>
        {title}
      </h3>
      <p className="text-xs leading-relaxed" style={{ color: C.textLight }}>
        {desc}
      </p>
    </motion.div>
  );
};

/* ───────── Language Flags ───────── */
const LanguageFlags = ({ scrollY }: { scrollY: number }) => {
  const flags = [
    { emoji: "🇬🇧", name: "EN" },
    { emoji: "🇪🇸", name: "ES" },
    { emoji: "🇫🇷", name: "FR" },
    { emoji: "🇩🇪", name: "DE" },
    { emoji: "🇨🇳", name: "ZH" },
  ];

  return (
    <motion.div
      style={{ y: useTransform(scrollY, [0, 500], [0, -15]) }}
      className="flex gap-3 mt-6"
    >
      {flags.map((f, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 + i * 0.1, duration: 0.4 }}
          whileHover={{ scale: 1.3, rotate: 5 }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg cursor-pointer shadow-md"          style={{
            backgroundColor: C.cardBg,
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.6)",
          }}
        >
          {f.emoji}
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.8, duration: 0.4 }}
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
        style={{
          backgroundColor: C.primary,
          color: "white",
        }}
      >
        +5
      </motion.div>
    </motion.div>
  );
};

/* ───────── Magnetic Button ───────── */
const MagneticButton = ({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
    setPos({ x, y });
  };

  const handleMouseLeave = () => setPos({ x: 0, y: 0 });

  return (
    <motion.button
      ref={btnRef}
      animate={{ x: pos.x, y: pos.y }}      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className="px-7 py-3 rounded-full font-medium text-sm flex items-center gap-2 cursor-pointer transition-colors"
      style={{
        backgroundColor: variant === "primary" ? C.primary : C.cardBg,
        color: variant === "primary" ? "white" : C.text,
        boxShadow:
          variant === "primary"
            ? "0 8px 25px rgba(232,151,110,0.35)"
            : "0 4px 15px rgba(0,0,0,0.06)",
        border: variant === "secondary" ? "1px solid rgba(0,0,0,0.08)" : "none",
      }}
    >
      {children}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.button>
  );
};

/* ───────── Main Hero Component ───────── */
const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const scrollY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const bgY = useTransform(scrollY, [0, 1], [0, -80]);
  const contentOpacity = useTransform(scrollY, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollY, [0, 0.5], [0, -40]);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden" style={{ backgroundColor: C.bg }}>
      {/* ── Parallax Background Gradient ── */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0"
      >
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 20% 50%, rgba(232,151,110,0.12) 0%, transparent 50%),              radial-gradient(ellipse at 80% 30%, rgba(127,181,168,0.12) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 80%, rgba(212,165,116,0.08) 0%, transparent 50%)
            `,
          }}
        />
      </motion.div>

      {/* ── Floating Particles ── */}
      <FloatingParticles />

      {/* ── Clouds ── */}
      <Cloud className="top-16 left-[60%]" delay={0} scrollY={scrollY} />
      <Cloud className="top-32 left-[75%]" delay={2} scrollY={scrollY} />
      <Cloud className="top-48 left-[85%]" delay={4} scrollY={scrollY} />
      <Cloud className="top-24 left-[40%]" delay={1} scrollY={scrollY} />

      {/* ── Mountains Background ── */}
      <Mountains scrollY={scrollY} />

      {/* ── Main Content ── */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-8 pb-16 flex flex-col min-h-screen"
      >
        {/* Nav */}
        <nav className="flex items-center justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: C.cardBg, boxShadow: "0 4px 15px rgba(0,0,0,0.06)" }}
            >
              <span className="text-sm font-bold" style={{ color: C.primary }}>A</span>
            </div>
            <span className="font-semibold text-lg" style={{ color: C.text }}>
              Translator
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden md:flex items-center gap-8 text-sm font-medium"
            style={{ color: C.textLight }}
          >
            {["Nav 1", "Nav 2", "Nav 3", "Nav 4", "Nav 5"].map((item, i) => (              <motion.a
                key={i}
                href="#"
                whileHover={{ color: C.primary, y: -2 }}
                className="cursor-pointer transition-colors"
                style={{ color: C.textLight }}
              >
                {item}
              </motion.a>
            ))}
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="px-5 py-2 rounded-full text-sm font-medium"
            style={{
              backgroundColor: C.primary,
              color: "white",
              boxShadow: "0 4px 15px rgba(232,151,110,0.3)",
            }}
          >
            CTA
          </motion.button>
        </nav>

        {/* Hero Body */}
        <div className="flex-1 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Left Column */}
          <div className="flex-1 max-w-xl">
            {/* Tag */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-6"
              style={{
                backgroundColor: C.cardBg,
                color: C.primaryDark,
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
              }}
            >
              <span>✦</span>
              <span>Tagline</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] mb-5"
              style={{ color: C.text }}
            >
              Your headline
              <span style={{ color: C.primary }}> here</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
              className="text-base leading-relaxed mb-8 max-w-md"
              style={{ color: C.textLight }}
            >
              Your subtitle description goes here. Add your own compelling text that describes your service.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.7 }}
              className="flex gap-4 flex-wrap"
            >
              <MagneticButton variant="primary">Primary CTA</MagneticButton>
              <MagneticButton variant="secondary">Secondary</MagneticButton>
            </motion.div>

            {/* Languages */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <p className="text-xs font-medium mt-8 mb-3" style={{ color: C.textLight }}>
                Languages:
              </p>
              <LanguageFlags scrollY={scrollY} />
            </motion.div>
          </div>

          {/* Right Column — Illustration */}
          <div className="flex-1 relative">
            {/* Speech Bubbles */}
            <SpeechBubbles scrollY={scrollY} />

            {/* Illustration scene */}            <div className="relative flex items-end justify-center gap-4 mt-8">
              {/* Globe */}
              <div className="relative z-[2]">
                <Globe3D scrollY={scrollY} />
              </div>

              {/* Laptop */}
              <div className="relative z-[3] -mt-4">
                <Laptop3D scrollY={scrollY} />
              </div>

              {/* Books */}
              <div className="relative z-[4] -mt-2">
                <BookStack scrollY={scrollY} />
              </div>

              {/* Plants */}
              <div className="absolute left-0 bottom-4 z-[1]">
                <Plant scrollY={scrollY} delay={0} />
              </div>

              <div className="absolute left-12 bottom-8 z-[1]">
                <Plant scrollY={scrollY} delay={1} />
              </div>
            </div>

            {/* Wavy base */}
            <div className="absolute bottom-0 left-0 right-0 h-[60px]">
              <svg viewBox="0 0 600 60" className="w-full h-full" preserveAspectRatio="none">
                <path
                  d="M0,30 Q50,10 100,25 T200,20 T300,30 T400,15 T500,25 T600,20 L600,60 L0,60Z"
                  fill="rgba(127,181,168,0.15)"
                />
                <path
                  d="M0,40 Q80,20 150,35 T300,25 T450,35 T600,25 L600,60 L0,60Z"
                  fill="rgba(232,151,110,0.1)"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-4 mt-12 mb-8"
          style={{
            backgroundColor: C.cardBg,            backdropFilter: "blur(15px)",
            borderRadius: "20px",
            padding: "24px",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
          }}
        >
          <StatCard
            icon="🌐"
            title="10+ Languages"
            desc="Translation with care for each language"
            index={0}
            scrollY={scrollY}
          />
          <StatCard
            icon="🎯"
            title="Accuracy"
            desc="Preserving meaning, style and context"
            index={1}
            scrollY={scrollY}
          />
          <StatCard
            icon="⚡"
            title="Speed"
            desc="Meeting deadlines without quality loss"
            index={2}
            scrollY={scrollY}
          />
          <StatCard
            icon="💛"
            title="Personal"
            desc="Unique approach to every project"
            index={3}
            scrollY={scrollY}
          />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 flex items-start justify-center pt-2"
          style={{ borderColor: C.textLight, opacity: 0.3 }}        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: C.textLight }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HeroSection;
