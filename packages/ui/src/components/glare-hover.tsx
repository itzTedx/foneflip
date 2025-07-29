"use client";

import React, { useCallback, useMemo, useRef } from "react";

import { cn } from "@ziron/utils";

interface GlareHoverProps {
  children?: React.ReactNode;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  transitionDuration?: number;
  playOnce?: boolean;
  className?: string;
}

const GlareHover: React.FC<GlareHoverProps> = ({
  children,
  glareColor = "#ffffff",
  glareOpacity = 0.5,
  glareAngle = -45,
  glareSize = 250,
  transitionDuration = 650,
  playOnce = false,
  className = "",
}) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Memoize the rgba color conversion to avoid recalculation on every render
  const rgbaColor = useMemo(() => {
    const hex = glareColor.replace("#", "");

    // Handle 6-digit hex colors
    if (/^[\dA-Fa-f]{6}$/.test(hex)) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
    }

    // Handle 3-digit hex colors
    if (
      typeof hex === "string" &&
      hex.length === 3 &&
      /^[\dA-Fa-f]{3}$/.test(hex)
    ) {
      const r = parseInt(
        (hex[0]?.toString() ?? "") + (hex[0]?.toString() ?? ""),
        16
      );
      const g = parseInt(
        (hex[1]?.toString() ?? "") + (hex[1]?.toString() ?? ""),
        16
      );
      const b = parseInt(
        (hex[2]?.toString() ?? "") + (hex[2]?.toString() ?? ""),
        16
      );
      return `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
    }

    // Fallback to original color if not a valid hex
    return glareColor;
  }, [glareColor, glareOpacity]);

  // Memoize the overlay style to prevent unnecessary re-renders
  const overlayStyle: React.CSSProperties = useMemo(
    () => ({
      position: "absolute",
      inset: 0,
      background: `linear-gradient(${glareAngle}deg,
        hsla(0,0%,0%,0) 60%,
        ${rgbaColor} 70%,
        hsla(0,0%,0%,0) 100%)`,
      backgroundSize: `${glareSize}% ${glareSize}%, 100% 100%`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "-100% -100%, 0 0",
      pointerEvents: "none",
    }),
    [glareAngle, rgbaColor, glareSize]
  );

  // Use useCallback to prevent unnecessary re-renders of event handlers
  const animateIn = useCallback(() => {
    const el = overlayRef.current;
    if (!el) return;

    // Force reflow to ensure transition works properly
    el.style.transition = "none";
    el.style.backgroundPosition = "-100% -100%, 0 0";
    void el.offsetHeight; // Trigger reflow

    el.style.transition = `${transitionDuration}ms ease`;
    el.style.backgroundPosition = "100% 100%, 0 0";
  }, [transitionDuration]);

  const animateOut = useCallback(() => {
    const el = overlayRef.current;
    if (!el) return;

    if (playOnce) {
      // For playOnce mode, immediately reset without transition
      el.style.transition = "none";
      el.style.backgroundPosition = "-100% -100%, 0 0";
    } else {
      // Normal mode with transition
      el.style.transition = `${transitionDuration}ms ease`;
      el.style.backgroundPosition = "-100% -100%, 0 0";
    }
  }, [playOnce, transitionDuration]);

  return (
    <div
      className={cn(
        "relative grid cursor-pointer place-items-center overflow-hidden border",
        className
      )}
      onMouseEnter={animateIn}
      onMouseLeave={animateOut}
    >
      <div ref={overlayRef} style={overlayStyle} />
      {children}
    </div>
  );
};

export default GlareHover;
