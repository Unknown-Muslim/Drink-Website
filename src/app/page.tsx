"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FaUser } from "react-icons/fa";
import { GiShoppingBag } from "react-icons/gi";
import { ErrorBoundary } from "react-error-boundary";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type JuiceName = "Original Strike" | "Red Storm" | "Ultra Void" | "Toxic Surge";

interface ThemeConfig {
  mainBgColor: string;
  blurColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
}

interface JuiceInfo { title: string; description: string; }
interface NavItem   { label: string; }
interface SizeOption { size: string; unit: string; selected?: boolean; }
interface CartItem  { id: number; name: string; price: number; quantity: number; image: string; }

// ─── DATA ─────────────────────────────────────────────────────────────────────

const canThemeMap: Record<JuiceName, ThemeConfig> = {
  "Original Strike": { mainBgColor: "#0a1a0a", blurColor: "#00ff41", buttonBgColor: "#00ff41", buttonTextColor: "#0a1a0a" },
  "Red Storm":       { mainBgColor: "#1a0505", blurColor: "#ff1a1a", buttonBgColor: "#ff1a1a", buttonTextColor: "#ffffff" },
  "Ultra Void":      { mainBgColor: "#05050f", blurColor: "#6600ff", buttonBgColor: "#6600ff", buttonTextColor: "#ffffff" },
  "Toxic Surge":     { mainBgColor: "#0f1a00", blurColor: "#ccff00", buttonBgColor: "#ccff00", buttonTextColor: "#0f1a00" },
};

const juiceData: Record<JuiceName, JuiceInfo> = {
  "Original Strike": { title: "Original Strike", description: "The classic collision. Monster's raw power meets Red Bull's precision in a neon-green surge that hits harder than anything you've felt before." },
  "Red Storm":       { title: "Red Storm",        description: "Crimson chaos unleashed. A scorching fusion of Monster heat and Red Bull intensity — this one doesn't slow down. Ever." },
  "Ultra Void":      { title: "Ultra Void",       description: "Enter the darkness. Ultra Void blends deep space cold with electric charge — a flavour that exists beyond the limits of ordinary energy." },
  "Toxic Surge":     { title: "Toxic Surge",      description: "Radioactive rush. Toxic Surge delivers a citrus-acid jolt at the intersection of Monster aggression and Red Bull sharpness." },
};

const juiceCans = [
  { name: "Original Strike" as JuiceName, color: "#00ff41", model: "/assets/3d/can/lemon.glb",     position: "top"    },
  { name: "Red Storm"       as JuiceName, color: "#ff1a1a", model: "/assets/3d/can/raspberry.glb", position: "right"  },
  { name: "Ultra Void"      as JuiceName, color: "#6600ff", model: "/assets/3d/can/blueberry.glb", position: "bottom" },
  { name: "Toxic Surge"     as JuiceName, color: "#ccff00", model: "/assets/3d/can/mango.glb",     position: "left"   },
];

const positionClasses = [
  "absolute top-0 left-1/2 -translate-x-1/2",
  "absolute top-1/2 right-0 -translate-y-1/2 rotate-90",
  "absolute bottom-0 left-1/2 -translate-x-1/2 rotate-180",
  "absolute top-1/2 left-0 -translate-y-1/2 -rotate-90",
];

const rotations: [number, number, number][] = [
  [0, Math.PI / 3, 0],
  [0, Math.PI / 3, 0],
  [0, Math.PI / 3, 0],
  [0, Math.PI / 3, 0],
];

const navItems: NavItem[]   = [{ label: "Flavours" }, { label: "Drinks" }, { label: "Energy" }, { label: "About" }, { label: "Contact" }];
const sizes: SizeOption[]   = [{ size: "355", unit: "ML", selected: true }, { size: "500", unit: "ML" }, { size: "1", unit: "L" }];
const cartItems: CartItem[] = [
  { id: 1, name: "Original Strike", price: 4.99, quantity: 1, image: "/assets/images/can/lemon.webp" },
  { id: 2, name: "Ultra Void",      price: 5.49, quantity: 1, image: "/assets/images/can/blueberry.webp" },
];

// ─── HOOKS ────────────────────────────────────────────────────────────────────

function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

// ─── 3D CAN ───────────────────────────────────────────────────────────────────

function Can3D({ modelPath, rotate, isMobile, onLoaded }: {
  modelPath: string; rotate: [number, number, number];
  isMobile: boolean; onLoaded?: () => void;
}) {
  const { scene } = useGLTF(modelPath);
  const ref = useRef<THREE.Group>(null);
  const time = useRef(0);
  const loaded = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const clone = scene.clone();
    clone.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        const m = o as THREE.Mesh;
        if (m.material instanceof THREE.MeshStandardMaterial) {
          m.material.metalness = 0.95;
          m.material.roughness = 0.02;
        }
      }
    });
    while (ref.current.children.length) ref.current.remove(ref.current.children[0]);
    ref.current.add(clone);
    if (onLoaded && !loaded.current) {
      loaded.current = true;
      setTimeout(onLoaded, 200);
    }
  }, [scene, onLoaded]);

  useFrame((_s, delta) => {
    if (!ref.current) return;
    time.current += delta * 0.5;
    const m = isMobile ? 0.3 : 1;
    const smooth = (t: number, f: number) => { const v = (t * f) % 2; return v <= 1 ? v : 2 - v; };
    ref.current.rotation.x = rotate[0] + (smooth(time.current, 0.3) * 2 - 1) * 0.05 * m;
    ref.current.rotation.y = rotate[1] + (smooth(time.current, 0.2) * 2 - 1) * 0.03 * m;
    ref.current.rotation.z = rotate[2] + (smooth(time.current, 0.25) * 2 - 1) * 0.05 * m;
  });

  return (
    <group ref={ref} rotation={rotate} scale={isMobile ? 0.75 : 1} position={[0.005, 0.045, 0]} castShadow receiveShadow />
  );
}

function CanvasContainer({ modelPath, rotation, isMobile, isActive, onLoaded }: {
  modelPath: string; rotation: [number, number, number];
  isMobile: boolean; isActive: boolean; onLoaded?: () => void;
}) {
  return (
    <ErrorBoundary fallback={<div />}>
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-5, -5, -5]} intensity={0.4} />
        <Can3D modelPath={modelPath} rotate={rotation} isMobile={isMobile} onLoaded={isActive ? onLoaded : undefined} />
        <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.5} />
      </Canvas>
    </ErrorBoundary>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

function NavBar({ themeColor }: { themeColor: string }) {
  const [dropdown, setDropdown] = useState<"cart" | "account" | null>(null);
  const isMobile = useMobile();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex fixed left-1/2 -translate-x-1/2 top-0 w-full max-w-[1440px] items-center justify-between px-8 py-3 z-[100]"
      style={{ backdropFilter: "blur(2px)", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
      <div className="text-2xl uppercase font-bold text-white" style={{ fontFamily: "var(--font-thunder)", letterSpacing: "0.05em" }}>
        MxRB
      </div>
      {!isMobile && (
        <nav className="flex gap-8">
          {navItems.map((item) => (
            <span key={item.label} className="text-white/70 hover:text-white cursor-pointer transition-colors text-sm tracking-widest uppercase">
              {item.label}
            </span>
          ))}
        </nav>
      )}
      <div ref={ref} className="flex items-center gap-4 relative">
        <span className="text-white cursor-pointer hover:opacity-70 transition-opacity" onClick={() => setDropdown(d => d === "account" ? null : "account")}>
          <FaUser size={18} />
        </span>
        <span className="text-white cursor-pointer hover:opacity-70 transition-opacity relative" onClick={() => setDropdown(d => d === "cart" ? null : "cart")}>
          <GiShoppingBag size={20} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">2</span>
        </span>

        {dropdown === "account" && (
          <div className="absolute right-0 top-10 w-64 rounded-2xl shadow-lg overflow-hidden" style={{ background: "rgba(0,0,0,0.9)", border: "1px solid rgba(0,255,65,0.2)", animation: "scaleIn 0.2s ease-out" }}>
            <div className="p-5">
              <h3 className="font-semibold mb-3 text-white">My Account</h3>
              <div className="flex flex-col gap-2">
                <input type="email" placeholder="Email" className="px-3 py-2 rounded-lg text-sm bg-white/10 text-white border border-white/20 outline-none" />
                <input type="password" placeholder="Password" className="px-3 py-2 rounded-lg text-sm bg-white/10 text-white border border-white/20 outline-none" />
                <button className="py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: themeColor, color: themeColor === "#00ff41" || themeColor === "#ccff00" ? "#000" : "#fff" }}>Sign In</button>
              </div>
              <p className="text-white/40 text-xs text-center mt-3">Don&apos;t have an account? <span className="cursor-pointer" style={{ color: themeColor }}>Register</span></p>
            </div>
          </div>
        )}

        {dropdown === "cart" && (
          <div className="absolute right-0 top-10 w-72 rounded-2xl shadow-lg overflow-hidden" style={{ background: "rgba(0,0,0,0.9)", border: "1px solid rgba(0,255,65,0.2)", animation: "scaleIn 0.2s ease-out" }}>
            <div className="p-4">
              <h3 className="font-semibold mb-3 text-white">Cart</h3>
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="w-10 h-10 object-contain rounded" />
                  <div className="flex-1">
                    <p className="text-white text-sm">{item.name}</p>
                    <p className="text-white/50 text-xs">£{item.price}</p>
                  </div>
                </div>
              ))}
              <button className="w-full py-2 rounded-lg text-sm font-medium mt-2" style={{ backgroundColor: themeColor, color: themeColor === "#00ff41" || themeColor === "#ccff00" ? "#000" : "#fff" }}>
                Checkout · £{cartItems.reduce((s, i) => s + i.price, 0).toFixed(2)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ANIMATED BACKGROUND ──────────────────────────────────────────────────────

function AnimatedBackground({ color }: { color: string }) {
  const currentRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  const prevColor = useRef(color);

  useEffect(() => {
    if (!nextRef.current || !currentRef.current) return;
    if (prevColor.current === color) return;
    const el = nextRef.current;
    el.style.background = `radial-gradient(circle, ${color} 90%, ${color}00 100%)`;
    el.style.display = "block";
    gsap.fromTo(el, { clipPath: "circle(0% at center)", scale: 0.1 }, {
      clipPath: "circle(150% at center)", scale: 10, duration: 2, ease: "power3.out",
      onComplete: () => {
        if (currentRef.current) currentRef.current.style.backgroundColor = color;
        el.style.display = "none";
      }
    });
    prevColor.current = color;
  }, [color]);

  useEffect(() => {
    if (currentRef.current) currentRef.current.style.backgroundColor = color;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div ref={currentRef} className="absolute inset-0 z-[-2]" />
      <div ref={nextRef} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[-1] w-[200px] h-[200px] rounded-full" style={{ display: "none", willChange: "transform" }} />
    </>
  );
}

// ─── CAROUSEL ─────────────────────────────────────────────────────────────────

function Carousel({ onCanChange }: { onCanChange: (name: string) => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobile();

  useEffect(() => {
    juiceCans.forEach(c => useGLTF.preload(c.model));
    gsap.set(wheelRef.current, { rotation: 0 });
    onCanChange(juiceCans[0].name);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = useCallback((dir: 1 | -1) => {
    if (isAnimating || !loaded) return;
    setIsAnimating(true);
    const next = (activeIndex - dir + juiceCans.length) % juiceCans.length;
    onCanChange(juiceCans[next].name);
    gsap.to(wheelRef.current, {
      rotation: `+=${dir * 90}`, duration: 1, ease: "power2.inOut",
      onComplete: () => { setActiveIndex(next); setIsAnimating(false); }
    });
  }, [activeIndex, isAnimating, loaded, onCanChange]);

  useEffect(() => {
    const handler = (e: WheelEvent) => { if (e.deltaY > 0) { go(1); } else { go(-1); } };
    window.addEventListener("wheel", handler, { passive: true });
    return () => window.removeEventListener("wheel", handler);
  }, [go]);

  const handleLoaded = useCallback(() => {
    setLoaded(true);
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div className="relative w-full h-full z-50">
      {!visible && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        </div>
      )}
      <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }}>
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 ${isMobile ? "translate-y-[1%]" : "translate-y-[3%]"} w-[300vh] h-[300vh] flex items-center justify-center`}>
          <div ref={wheelRef} className="relative w-full h-full flex items-center justify-center" style={{ transformOrigin: "center center" }}>
            {juiceCans.map((can, i) => (
              <div key={can.name} className={`${positionClasses[i]} ${isMobile ? "w-[45%] h-[45%]" : "w-1/2 h-1/2"}`}>
                <CanvasContainer modelPath={can.model} rotation={rotations[i]} isMobile={isMobile} isActive={i === activeIndex} onLoaded={i === 0 ? handleLoaded : undefined} />
              </div>
            ))}
          </div>
        </div>

        {/* Nav arrows */}
        <button onClick={() => go(-1)} disabled={isAnimating || !loaded}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", color: "white" }}>
          ‹
        </button>
        <button onClick={() => go(1)} disabled={isAnimating || !loaded}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", color: "white" }}>
          ›
        </button>
      </div>
    </div>
  );
}

// ─── CONTACT BUTTON ───────────────────────────────────────────────────────────

function ContactButton({ isMobile }: { isMobile: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const sz = isMobile ? 60 : 100;
  return (
    <div ref={ref} className={`absolute z-50 ${isMobile ? "bottom-4 right-4" : "bottom-8 right-12"}`}>
      <button onClick={() => setOpen(o => !o)} className="rounded-full border border-white/50 flex flex-col items-center justify-center transition-all bg-white/10 hover:bg-white/20 text-white text-xs"
        style={{ width: sz, height: sz }}>
        <span>Get</span><span>This</span>
      </button>
      {open && (
        <div className="absolute bottom-full mb-3 right-0 rounded-2xl p-4 shadow-lg" style={{ background: "rgba(0,0,0,0.9)", border: "1px solid rgba(0,255,65,0.3)", minWidth: 200, animation: "scaleIn 0.2s ease-out" }}>
          <p className="text-center font-semibold mb-1" style={{ color: "#00ff41" }}>Contact</p>
          <p className="text-center text-sm text-white/50">Contact details coming soon.</p>
        </div>
      )}
    </div>
  );
}

// ─── WATER WAVE (dynamic) ─────────────────────────────────────────────────────

const WaterWave = dynamic(() => import("react-water-wave"), {
  ssr: false,
  loading: () => <div className="h-screen overflow-hidden relative" />,
});

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Home() {
  const [themeName, setThemeName] = useState<JuiceName>("Original Strike");
  const theme = canThemeMap[themeName];
  const juice = juiceData[themeName];
  const isMobile = useMobile();

  const [selectedSize, setSelectedSize] = useState("355");

  useEffect(() => {
    document.body.style.transition = "background-color 0.6s ease";
    document.body.style.backgroundColor = theme.mainBgColor;
  }, [theme.mainBgColor]);

  const handleCanChange = useCallback((name: string) => {
    if (name in canThemeMap) setThemeName(name as JuiceName);
  }, []);

  const carouselMemo = useMemo(() => <Carousel onCanChange={handleCanChange} />, [handleCanChange]);

  return (
    <div className="relative w-full max-w-[1440px] mx-auto h-[100dvh] shadow-2xl select-none" style={{ borderLeft: "1px solid rgba(255,255,255,0.1)", borderRight: "1px solid rgba(255,255,255,0.1)" }}>

      <NavBar themeColor={theme.buttonBgColor} />

      <WaterWave dropRadius={isMobile ? 8 : 10} perturbance={isMobile ? 0.006 : 0.01} imageUrl="/assets/images/drop.png" resolution={isMobile ? 700 : 1900}>
        {() => (
          <div className="h-[100dvh] overflow-hidden w-full relative">
            <AnimatedBackground color={theme.mainBgColor} />

            {/* Blurred glow */}
            <div className="absolute rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ backgroundColor: theme.blurColor, filter: `blur(${isMobile ? 427 : 610}px)`, width: isMobile ? 420 : 700, height: isMobile ? 420 : 700, transition: "all 1s ease", zIndex: 22 }} />

            <div className={`max-w-[1440px] ${isMobile ? "px-4" : "pr-5 pl-[70px]"} h-full max-h-[1080px] m-auto relative`}>

              {/* Big background brand text */}
              <div className="absolute z-[-1] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none">
                <h1 className="leading-none text-white" style={{
                  fontFamily: "var(--font-thunder), sans-serif",
                  fontWeight: 500,
                  fontSize: isMobile ? "clamp(2rem,8vw,4rem)" : "clamp(4rem,7vw,11rem)",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  textShadow: `0 0 40px ${theme.blurColor}66, 0 0 80px ${theme.blurColor}22`,
                  whiteSpace: isMobile ? "normal" : "nowrap",
                  transition: "text-shadow 1s ease",
                }}>
                  MONSTER × RED BULL
                </h1>
              </div>

              {/* 3D Carousel */}
              <div className={`${isMobile ? "relative" : "absolute"} top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-full h-full z-50`}>
                {carouselMemo}
              </div>

              {/* Size selector */}
              <div className={`absolute ${isMobile ? "top-20 left-4" : "top-1/2 -translate-y-1/2 left-8"} z-50 flex ${isMobile ? "flex-row gap-2" : "flex-col gap-3"}`}>
                {sizes.map(s => (
                  <button key={s.size} onClick={() => setSelectedSize(s.size)}
                    className="rounded-full flex flex-col items-center justify-center transition-all text-xs font-medium"
                    style={{
                      width: 48, height: 48,
                      backgroundColor: selectedSize === s.size ? theme.buttonBgColor : "rgba(255,255,255,0.15)",
                      color: selectedSize === s.size ? theme.buttonTextColor : "white",
                      border: `1px solid ${selectedSize === s.size ? theme.buttonBgColor : "rgba(255,255,255,0.3)"}`,
                    }}>
                    <span className="font-bold text-xs">{s.size}</span>
                    <span className="text-[9px] opacity-70">{s.unit}</span>
                  </button>
                ))}
              </div>

              {/* Product info */}
              <div className={`absolute ${isMobile ? "bottom-14 left-4 right-4" : "bottom-8 left-20 max-w-[520px]"} z-50`}>
                <div className="p-3 px-5 rounded-xl">
                  <h2 className="text-white font-light mb-3" style={{ fontFamily: "var(--font-thunder)", fontSize: isMobile ? "2.5rem" : "3.5rem", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                    {juice.title}
                  </h2>
                  <p className="text-white/80 text-base mb-4 leading-relaxed" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                    {juice.description}
                  </p>
                  {!isMobile && (
                    <button className="px-6 py-2 rounded-full font-medium transition-all hover:opacity-80"
                      style={{ backgroundColor: theme.buttonBgColor, color: theme.buttonTextColor }}>
                      Explore
                    </button>
                  )}
                </div>
              </div>

              <ContactButton isMobile={isMobile} />
            </div>
          </div>
        )}
      </WaterWave>

      {/* Concept disclaimer */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[200] pointer-events-none text-center"
        style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", letterSpacing: "0.18em" }}>
        ⚡ THIS IS A CONCEPT — NOT AN OFFICIAL PRODUCT ⚡
      </div>
    </div>
  );
}