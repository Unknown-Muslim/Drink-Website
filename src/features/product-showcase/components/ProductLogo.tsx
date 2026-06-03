"use client";
import { JuicyLogoProps } from "../types";

export default function ProductLogo({
  text,
  color = "white",
  fontFamily = "var(--font-thunder), sans-serif",
  className = "",
  isMobile = false,
}: JuicyLogoProps) {
  return (
    <div className="absolute z-[-1]! left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center">
      <h1
        className={`leading-none select-none ${className}`}
        style={{
          fontFamily,
          color,
          fontWeight: 500,
          fontSize: isMobile ? "clamp(2.5rem,8vw,4rem)" : "clamp(4rem,8vw,12rem)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          display: "inline-block",
          textShadow: "0 0 40px rgba(0,255,65,0.4), 0 0 80px rgba(0,255,65,0.15)",
          whiteSpace: isMobile ? "normal" : "nowrap",
        }}
      >
        {text}
      </h1>
    </div>
  );
}