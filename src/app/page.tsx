"use client";
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { FaUser } from "react-icons/fa";
import { GiShoppingBag } from "react-icons/gi";
import { ErrorBoundary } from "react-error-boundary";

// ─── THEME DATA ───────────────────────────────────────────────────────────────

const THEMES = {
  "Original Strike": { bg: "#0a1a0a", glow: "#00ff41", btn: "#00ff41", btnText: "#0a1a0a" },
  "Red Storm":       { bg: "#1a0505", glow: "#ff1a1a", btn: "#ff1a1a", btnText: "#ffffff" },
  "Ultra Void":      { bg: "#05050f", glow: "#6600ff", btn: "#6600ff", btnText: "#ffffff" },
  "Toxic Surge":     { bg: "#0f1a00", glow: "#ccff00", btn: "#ccff00", btnText: "#0f1a00" },
} as const;

type Flavor = keyof typeof THEMES;

const CANS: { name: Flavor; model: string }[] = [
  { name: "Original Strike", model: "/assets/3d/can/lemon.glb"     },
  { name: "Red Storm",       model: "/assets/3d/can/raspberry.glb" },
  { name: "Ultra Void",      model: "/assets/3d/can/blueberry.glb" },
  { name: "Toxic Surge",     model: "/assets/3d/can/mango.glb"     },
];

const DESCRIPTIONS: Record<Flavor, string> = {
  "Original Strike": "The classic collision. Monster's raw power meets Red Bull's precision in a neon-green surge that hits harder than anything you've felt before.",
  "Red Storm":       "Crimson chaos unleashed. A scorching fusion of Monster heat and Red Bull intensity — this one doesn't slow down. Ever.",
  "Ultra Void":      "Enter the darkness. Ultra Void blends deep space cold with electric charge — a flavour that exists beyond the limits of ordinary energy.",
  "Toxic Surge":     "Radioactive rush. Toxic Surge delivers a citrus-acid jolt at the intersection of Monster aggression and Red Bull sharpness.",
};

const POSITION_CLASSES = [
  "absolute top-0 left-1/2 -translate-x-1/2",
  "absolute top-1/2 right-0 -translate-y-1/2 rotate-90",
  "absolute bottom-0 left-1/2 -translate-x-1/2 rotate-180",
  "absolute top-1/2 left-0 -translate-y-1/2 -rotate-90",
];

const CART_ITEMS = [
  { id: 1, name: "Original Strike", price: 4.99, image: "/assets/images/can/lemon.webp" },
  { id: 2, name: "Ultra Void",      price: 5.49, image: "/assets/images/can/blueberry.webp" },
];

const NAV_LINKS = ["Flavours", "Drinks", "Energy", "About", "Contact"];
const SIZES = ["355 ML", "500 ML", "1 L"];

// ─── HOOK: detect mobile ──────────────────────────────────────────────────────

function useMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    // Fix: Prevent window execution context issues on server pre-rendering
    if (typeof window === "undefined") return;

    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

// ─── 3D CAN MODEL ─────────────────────────────────────────────────────────────

function CanModel({ path, mobile, onLoaded }: { path: string; mobile: boolean; onLoaded?: () => void }) {
  const { scene } = useGLTF(path);
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  const didLoad = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const clone = scene.clone();
    clone.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.metalness = 0.95;
        mesh.material.roughness = 0.02;
      }
    });
    ref.current.clear();
    ref.current.add(clone);
    if (onLoaded && !didLoad.current) {
      didLoad.current = true;
      setTimeout(onLoaded, 200);
    }
  }, [scene, onLoaded]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    t.current += delta * 0.5;
    const m = mobile ? 0.3 : 1;
    const sw = (v: number, f: number) => { const x = (v * f) % 2; return x <= 1 ? x : 2 - x; };
    ref.current.rotation.x = (sw(t.current, 0.3) * 2 - 1) * 0.05 * m;
    ref.current.rotation.y = Math.PI / 3 + (sw(t.current, 0.2) * 2 - 1) * 0.03 * m;
    ref.current.rotation.z = (sw(t.current, 0.25) * 2 - 1) * 0.05 * m;
  });

  return <group ref={ref} scale={mobile ? 0.75 : 1} position={[0.005, 0.045, 0]} />;
}

function CanCanvas({ path, mobile, active, onLoaded }: { path: string; mobile: boolean; active: boolean; onLoaded?: () => void }) {
  return (
    <ErrorBoundary fallback={<div />}>
      <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }} gl={{ antialias: true, alpha: true }} style={{ background: "transparent", width: "100%", height: "100%" }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-5, -5, -5]} intensity={0.4} />
        <CanModel path={path} mobile={mobile} onLoaded={active ? onLoaded : undefined} />
        <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.5} />
      </Canvas>
    </ErrorBoundary>
  );
}

// ─── CAROUSEL ─────────────────────────────────────────────────────────────────

function Carousel({ onChange }: { onChange: (name: Flavor) => void }) {
  const [idx, setIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const mobile = useMobile();

  useEffect(() => {
    CANS.forEach(c => useGLTF.preload(c.model));
    onChange(CANS[0].name);
  }, []);

  const spin = useCallback((dir: 1 | -1) => {
    if (animating || !ready) return;
    setAnimating(true);
    const next = (idx - dir + CANS.length) % CANS.length;
    onChange(CANS[next].name);
    gsap.to(wheelRef.current, {
      rotation: `+=${dir * 90}`, duration: 1, ease: "power2.inOut",
      onComplete: () => { setIdx(next); setAnimating(false); },
    });
  }, [idx, animating, ready, onChange]);

  useEffect(() => {
    const h = (e: WheelEvent) => { if (e.deltaY > 0) { spin(1); } else { spin(-1); } };
    window.addEventListener("wheel", h, { passive: true });
    return () => window.removeEventListener("wheel", h);
  }, [spin]);

  const onLoaded = useCallback(() => {
    setReady(true);
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div className="absolute inset-0 z-50">
      {/* Spinner while loading */}
      {!visible && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div style={{ width: 32, height: 32, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      )}

      <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.4s", width: "100%", height: "100%" }}>
        {/* Wheel */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 ${mobile ? "translate-y-[1%]" : "translate-y-[3%]"} flex items-center justify-center`}
          style={{ width: "300vh", height: "300vh" }}>
          <div ref={wheelRef} className="relative w-full h-full flex items-center justify-center" style={{ transformOrigin: "center" }}>
            {CANS.map((can, i) => (
              <div key={can.name} className={`${POSITION_CLASSES[i]} ${mobile ? "w-[45%] h-[45%]" : "w-1/2 h-1/2"}`}>
                <CanCanvas path={can.model} mobile={mobile} active={i === idx} onLoaded={i === 0 ? onLoaded : undefined} />
              </div>
            ))}
          </div>
        </div>

        {/* Arrows */}
        {(["left", "right"] as const).map((side) => (
          <button key={side}
            onClick={() => side === "left" ? spin(-1) : spin(1)}
            disabled={animating || !ready}
            className={`absolute top-1/2 -translate-y-1/2 z-50 flex items-center justify-center transition-all ${side === "left" ? "left-4" : "right-4"}`}
            style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", color: "white", fontSize: 22, cursor: "pointer" }}>
            {side === "left" ? "‹" : "›"}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

function NavBar({ theme }: { theme: typeof THEMES[Flavor] }) {
  const [open, setOpen] = useState<"cart" | "account" | null>(null);
  const mobile = useMobile();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const dropdownStyle: React.CSSProperties = {
    position: "absolute", right: 0, top: 48, borderRadius: 16, zIndex: 600,
    background: "rgba(0,0,0,0.92)", border: "1px solid rgba(255,255,255,0.15)",
    animation: "scaleIn 0.15s ease-out",
  };

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[1440px] z-[100] flex items-center justify-between px-8 py-3"
      style={{ backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
      <span className="text-white text-2xl uppercase font-bold tracking-widest" style={{ fontFamily: "var(--font-thunder)" }}>MxRB</span>

      {!mobile && (
        <nav className="flex gap-8">
          {NAV_LINKS.map(l => (
            <span key={l} className="text-white/60 hover:text-white cursor-pointer transition-colors text-xs tracking-[0.2em] uppercase">{l}</span>
          ))}
        </nav>
      )}

      <div ref={ref} className="flex items-center gap-4 relative">
        <button onClick={() => setOpen(o => o === "account" ? null : "account")} className="text-white opacity-70 hover:opacity-100 transition-opacity">
          <FaUser size={17} />
        </button>
        <button onClick={() => setOpen(o => o === "cart" ? null : "cart")} className="text-white opacity-70 hover:opacity-100 transition-opacity relative">
          <GiShoppingBag size={20} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full flex items-center justify-center" style={{ width: 16, height: 16, fontSize: 10 }}>2</span>
        </button>

        {open === "account" && (
          <div style={{ ...dropdownStyle, width: 260, padding: 20 }}>
            <p className="text-white font-semibold mb-3 text-sm">My Account</p>
            <div className="flex flex-col gap-2">
              <input type="email" placeholder="Email" className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} />
              <input type="password" placeholder="Password" className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} />
              <button className="py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80" style={{ background: theme.btn, color: theme.btnText }}>Sign In</button>
            </div>
            <p className="text-white/30 text-xs text-center mt-3">No account? <span className="cursor-pointer" style={{ color: theme.btn }}>Register</span></p>
          </div>
        )}

        {open === "cart" && (
          <div style={{ ...dropdownStyle, width: 280, padding: 16 }}>
            <p className="text-white font-semibold mb-3 text-sm">Cart</p>
            {CART_ITEMS.map(item => (
              <div key={item.id} className="flex items-center gap-3 mb-3">
                <img src={item.image} alt={item.name} style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 6 }} />
                <div>
                  <p className="text-white text-sm">{item.name}</p>
                  <p className="text-white/40 text-xs">£{item.price}</p>
                </div>
              </div>
            ))}
            <button className="w-full py-2 rounded-lg text-sm font-semibold mt-1 transition-opacity hover:opacity-80" style={{ background: theme.btn, color: theme.btnText }}>
              Checkout · £{CART_ITEMS.reduce((s, i) => s + i.price, 0).toFixed(2)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BACKGROUND TRANSITION ────────────────────────────────────────────────────

function Background({ color }: { color: string }) {
  const base = useRef<HTMLDivElement>(null);
  const blob = useRef<HTMLDivElement>(null);
  const prev = useRef(color);

  // Set initial color
  useEffect(() => { if (base.current) base.current.style.backgroundColor = color; }, []);

  useEffect(() => {
    if (prev.current === color || !blob.current || !base.current) return;
    const el = blob.current;
    el.style.background = `radial-gradient(circle, ${color} 90%, transparent 100%)`;
    el.style.display = "block";
    gsap.fromTo(el,
      { clipPath: "circle(0% at center)", scale: 0.1 },
      { clipPath: "circle(150% at center)", scale: 10, duration: 1.8, ease: "power3.out",
        onComplete: () => { if (base.current) base.current.style.backgroundColor = color; el.style.display = "none"; }
      }
    );
    prev.current = color;
  }, [color]);

  return (
    <>
      <div ref={base} className="absolute inset-0" style={{ zIndex: -2 }} />
      <div ref={blob} className="absolute rounded-full" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 200, height: 200, display: "none", zIndex: -1, willChange: "transform" }} />
    </>
  );
}

// ─── CONTACT BUTTON ───────────────────────────────────────────────────────────

function ContactBtn({ mobile }: { mobile: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const sz = mobile ? 60 : 96;
  return (
    <div ref={ref} className="absolute z-50" style={{ bottom: mobile ? 16 : 32, right: mobile ? 16 : 48 }}>
      <button onClick={() => setOpen(o => !o)} className="flex flex-col items-center justify-center rounded-full text-white transition-all hover:bg-white/20"
        style={{ width: sz, height: sz, border: "1px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.08)", fontSize: mobile ? 11 : 13 }}>
        <span>Get</span><span>This</span>
      </button>
      {open && (
        <div className="absolute bottom-full mb-3 right-0 rounded-2xl p-4" style={{ background: "rgba(0,0,0,0.92)", border: "1px solid rgba(0,255,65,0.25)", minWidth: 200, animation: "scaleIn 0.15s ease-out" }}>
          <p className="text-center font-semibold text-sm mb-1" style={{ color: "#00ff41" }}>Contact</p>
          <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Contact details coming soon.</p>
        </div>
      )}
    </div>
  );
}

// ─── WATER WAVE (loaded dynamically — no SSR) ─────────────────────────────────

const WaterWave = dynamic(() => import("react-water-wave"), {
  ssr: false,
  loading: () => <div className="h-screen w-full" />,
});

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [flavor, setFlavor] = useState<Flavor>("Original Strike");
  const [size, setSize] = useState("355 ML");
  const theme = THEMES[flavor];
  const mobile = useMobile();

  useEffect(() => {
    document.body.style.transition = "background-color 0.6s ease";
    document.body.style.backgroundColor = theme.bg;
  }, [theme.bg]);

  const handleChange = useCallback((name: string) => {
    if (name in THEMES) setFlavor(name as Flavor);
  }, []);

  const carousel = useMemo(() => <Carousel onChange={handleChange} />, [handleChange]);

  return (
    <div className="relative w-full max-w-[1440px] mx-auto h-[100dvh]" style={{ borderLeft: "1px solid rgba(255,255,255,0.08)", borderRight: "1px solid rgba(255,255,255,0.08)" }}>

      <NavBar theme={theme} />

      <WaterWave dropRadius={mobile ? 8 : 10} perturbance={mobile ? 0.006 : 0.01} imageUrl="/assets/images/drop.png" resolution={mobile ? 700 : 1900}>
        {() => (
          <div className="relative w-full h-[100dvh] overflow-hidden">
            <Background color={theme.bg} />

            {/* Glow blob */}
            <div className="absolute rounded-full pointer-events-none" style={{
              left: "50%", top: "50%", transform: "translate(-50%,-50%)",
              background: theme.glow, filter: `blur(${mobile ? 380 : 560}px)`,
              width: mobile ? 380 : 640, height: mobile ? 380 : 640,
              transition: "all 1s ease", opacity: 0.7, zIndex: 22,
            }} />

            <div className={`relative h-full max-w-[1440px] mx-auto ${mobile ? "px-4" : "pl-16 pr-4"}`}>

              {/* Big background brand text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: -1 }}>
                <h1 style={{
                  fontFamily: "var(--font-thunder), sans-serif",
                  fontSize: mobile ? "min(9vw, 3.5rem)" : "min(8vw, 10rem)",
                  fontWeight: 500, color: "white", letterSpacing: "0.04em",
                  textTransform: "uppercase", whiteSpace: mobile ? "normal" : "nowrap", textAlign: "center",
                  textShadow: `0 0 60px ${theme.glow}55`,
                  transition: "text-shadow 0.8s ease",
                }}>
                  MONSTER × RED BULL
                </h1>
              </div>

              {/* 3D Carousel */}
              {carousel}

              {/* Size selector */}
              <div className={`absolute z-50 flex ${mobile ? "flex-row gap-2 top-20 left-4" : "flex-col gap-3 top-1/2 -translate-y-1/2 left-6"}`}>
                {SIZES.map(s => (
                  <button key={s} onClick={() => setSize(s)} style={{
                    width: 52, 
                    height: 52, 
                    borderRadius: "50%", 
                    display: "flex", 
                    flexDirection: "column",
                    alignItems: "center", 
                    justifyContent: "center", // Fixed formatting and syntax typo here!
                    cursor: "pointer", 
                    transition: "all 0.3s",
                    background: size === s ? theme.btn : "rgba(255,255,255,0.1)",
                    color: size === s ? theme.btnText : "white",
                    border: `1px solid ${size === s ? theme.btn : "rgba(255,255,255,0.25)"}`,
                    fontSize: 10, 
                    fontWeight: 600,
                  }}>
                    {s.split(" ").map((p, i) => <span key={i}>{p}</span>)}
                  </button>
                ))}
              </div>

              {/* Product info */}
              <div className="absolute z-50" style={{ bottom: mobile ? 56 : 32, left: mobile ? 16 : 80, right: mobile ? 16 : "auto", maxWidth: mobile ? "auto" : 500 }}>
                <h2 style={{ fontFamily: "var(--font-thunder), sans-serif", fontSize: mobile ? "2.2rem" : "3.5rem", fontWeight: 500, color: "white", marginBottom: 8, textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>
                  {flavor}
                </h2>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: mobile ? 14 : 16, lineHeight: 1.6, textShadow: "0 1px 6px rgba(0,0,0,0.5)", marginBottom: 16 }}>
                  {DESCRIPTIONS[flavor]}
                </p>
                {!mobile && (
                  <button className="transition-opacity hover:opacity-80" style={{ padding: "8px 28px", borderRadius: 999, background: theme.btn, color: theme.btnText, fontWeight: 600, fontSize: 14 }}>
                    Explore
                  </button>
                )}
              </div>

              <ContactBtn mobile={mobile} />
            </div>
          </div>
        )}
      </WaterWave>

      {/* Concept note */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[200] pointer-events-none" style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, letterSpacing: "0.2em", whiteSpace: "nowrap" }}>
        ⚡ THIS IS A CONCEPT — NOT AN OFFICIAL PRODUCT ⚡
      </div>
    </div>
  );
}