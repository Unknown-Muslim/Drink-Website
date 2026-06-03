"use client";
import { useState, useRef, useEffect } from "react";
import { ScrollDownButtonProps } from "../types";

export default function ScrollDownButton({
  firstLine,
  secondLine,
  size = 100,
  textColor = "white",
  isMobile,
}: ScrollDownButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    setShowMenu((prev) => !prev);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const mobileSize = isMobile ? 60 : size;
  const mobileFontSize = isMobile ? "text-xs" : "";

  return (
    <div
      className={`absolute ${
        isMobile
          ? "bottom-4 right-4"
          : "bottom-[clamp(2rem,1.8vw,9rem)] right-[clamp(2rem,4.5vw,9rem)]"
      } z-50`}
      ref={buttonRef}
    >
      <button
        className="rounded-full border border-white/50 flex flex-col items-center justify-center transition-all duration-300 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.25)]"
        style={{
          width: `${mobileSize}px`,
          height: `${mobileSize}px`,
          color: textColor,
        }}
        onClick={handleClick}
      >
        <span className={`text-shadow-xs ${mobileFontSize}`}>{firstLine}</span>
        <span className={`text-shadow-xs ${mobileFontSize}`}>{secondLine}</span>
      </button>

      {showMenu && (
        <div
          className="absolute bottom-full mb-4 right-0 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden"
          style={{
            animation: "scaleIn 0.2s ease-out forwards",
            zIndex: 600,
            background: "rgba(0,0,0,0.85)",
            border: "1px solid rgba(0,255,65,0.3)",
            minWidth: "220px",
          }}
        >
          <div className="p-4">
            <h3
              className={`font-semibold mb-1 text-center ${
                isMobile ? "text-sm" : "text-base"
              }`}
              style={{ color: "#00ff41" }}
            >
              Contact
            </h3>
            <p
              className="text-center text-sm"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Contact details coming soon.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}