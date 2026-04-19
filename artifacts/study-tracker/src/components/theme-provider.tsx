import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

interface OverlayProps {
  isActive: boolean;
  fromTheme: Theme;
}

/**
 * Translucent Iris / Ripple Animation
 *
 * Light → Dark:
 *   A frosted-dark overlay covers the WHOLE screen, then contracts (zooms inward)
 *   toward the exact center, like an iris closing. As it shrinks to a point
 *   at the middle, a translucent 🌙 moon glows at the center briefly.
 *
 * Dark → Light:
 *   A frosted-light overlay starts as a tiny dot at the center, then expands
 *   (zooms outward) toward all screen edges like a ripple. A translucent ☀️ sun
 *   pops at the center as the ripple radiates out from it.
 */
function ThemeTransitionOverlay({ isActive, fromTheme }: OverlayProps) {
  const isLightToDark = fromTheme === "light";

  // Overlay color — translucent so content bleeds through
  const overlayBg = isLightToDark
    ? "rgba(5, 7, 20, 0.80)"         // translucent deep navy for dark overlay
    : "rgba(252, 249, 240, 0.82)";   // translucent warm ivory for light overlay

  // Icon glow
  const iconFilter = isLightToDark
    ? "drop-shadow(0 0 48px rgba(180, 160, 255, 0.95)) drop-shadow(0 0 96px rgba(130, 100, 255, 0.55))"
    : "drop-shadow(0 0 56px rgba(251, 191, 36, 0.95)) drop-shadow(0 0 110px rgba(255, 160, 10, 0.50))";

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* ── Translucent frosted overlay ── */}
          <motion.div
            key="iris-overlay"
            className="fixed inset-0 pointer-events-none"
            style={{
              zIndex: 9998,
              backgroundColor: overlayBg,
              backdropFilter: "blur(18px) saturate(0.55)",
              WebkitBackdropFilter: "blur(18px) saturate(0.55)",
            }}
            initial={{
              // Light→Dark: start full-screen → contract to centre
              // Dark→Light: start as invisible dot at centre → expand to full
              clipPath: isLightToDark
                ? "circle(160% at 50% 50%)"
                : "circle(0% at 50% 50%)",
            }}
            animate={{
              clipPath: isLightToDark
                ? "circle(0% at 50% 50%)"     // iris closes to centre
                : "circle(160% at 50% 50%)",  // ripple bursts to edges
            }}
            transition={{
              duration: 0.85,
              ease: isLightToDark
                ? [0.6, 0.0, 0.8, 1.0]   // fast start, eases at end (feels like closing)
                : [0.2, 0.0, 0.4, 1.0],  // gentle start, accelerates outward
            }}
          />

          {/* ── Radial glow ring behind the icon ── */}
          <div
            className="fixed inset-0 pointer-events-none flex items-center justify-center"
            style={{ zIndex: 9999 }}
          >
            <motion.div
              key="glow-ring"
              style={{
                width: "320px",
                height: "320px",
                borderRadius: "50%",
                flexShrink: 0,
                background: isLightToDark
                  ? "radial-gradient(circle, rgba(160,120,255,0.18) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(251,191,36,0.20) 0%, transparent 70%)",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.8, 1.4, 0], opacity: [0, 0.9, 0.7, 0] }}
              transition={{
                duration: 0.9,
                delay: isLightToDark ? 0.08 : 0.05,
                times: [0, 0.3, 0.6, 1],
                ease: "easeOut",
              }}
            />
          </div>

          {/* ── Moon / Sun icon — fixed to viewport center via flex wrapper ── */}
          {/* NOTE: We CANNOT use top/left + transform:translate on the motion.div itself
              because Framer Motion's scale animation overwrites the CSS transform,
              breaking the centering. Use a static container to center instead. */}
          <div
            className="fixed inset-0 pointer-events-none flex items-center justify-center"
            style={{ zIndex: 10000 }}
          >
            <motion.div
              key="theme-icon"
              className="select-none"
              style={{
                fontSize: "9rem",
                lineHeight: 1,
                filter: iconFilter,
              }}
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{
                scale:   [0.2, 1.15, 1.0, 0.95, 0.6],
                opacity: [0,   0.65, 0.52, 0.38, 0  ],
              }}
              transition={{
                duration: 0.95,
                delay: isLightToDark ? 0.06 : 0.04,
                times:  [0,  0.22, 0.45, 0.70, 1.0],
                ease: "easeOut",
              }}
            >
              {isLightToDark ? "🌙" : "☀️"}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem("scholar-theme") as Theme) || "dark";
    } catch {
      return "dark";
    }
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionFrom, setTransitionFrom] = useState<Theme>("dark");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("scholar-theme", theme);
    } catch {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    if (isTransitioning) return;
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTransitionFrom(theme);
    setIsTransitioning(true);

    /**
     * Timing strategy:
     *
     * Light→Dark (iris contracts):
     *   The overlay is still covering most of the screen until ~t=500ms.
     *   Switch the theme at t=480ms so the dark bg is revealed as the
     *   overlay finishes collapsing — seamless handoff.
     *
     * Dark→Light (ripple expands):
     *   The overlay has barely started expanding at t=80ms.
     *   Switch the theme immediately so the light bg is already in place
     *   as the frosted overlay sweeps over and then fades out.
     */
    const themeDelay = (ft: Theme) => ft === "light" ? 480 : 80;
    setTimeout(() => setTheme(next), themeDelay(theme));

    // Remove overlay after animation fully completes
    setTimeout(() => setIsTransitioning(false), 1050);
  }, [theme, isTransitioning]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
      <ThemeTransitionOverlay isActive={isTransitioning} fromTheme={transitionFrom} />
    </ThemeContext.Provider>
  );
}
