/**
 * Design tokens ported from the LymphDoc web app (index.css).
 * Use these for style props that can't be expressed as Tailwind classes
 * (SVG strokes, gradients via expo-linear-gradient or fallback solid colors).
 */
export const colors = {
  background: "hsl(210, 30%, 98%)",
  foreground: "hsl(220, 25%, 18%)",
  card: "hsl(0, 0%, 100%)",
  primary: "hsl(199, 89%, 58%)",
  primaryForeground: "hsl(0, 0%, 100%)",
  muted: "hsl(210, 20%, 94%)",
  mutedForeground: "hsl(220, 10%, 50%)",
  border: "hsl(210, 20%, 90%)",
  droppiSky: "hsl(199, 89%, 58%)",
  droppiSkyLight: "hsl(199, 89%, 92%)",
  droppiLavender: "hsl(270, 50%, 75%)",
  droppiLavenderLight: "hsl(270, 50%, 94%)",
  droppiPeach: "hsl(20, 90%, 72%)",
  droppiPeachLight: "hsl(20, 90%, 94%)",
  droppiMint: "hsl(160, 50%, 60%)",
  droppiMintLight: "hsl(160, 50%, 93%)",
  droppiRose: "hsl(340, 75%, 65%)",
  droppiWarm: "hsl(35, 90%, 60%)",
} as const;

/** Gradient endpoint pairs (use with expo-linear-gradient if added, or first color as solid fallback). */
export const gradients = {
  sky: ["hsl(199, 89%, 58%)", "hsl(220, 80%, 65%)"],
  calm: ["hsl(199, 89%, 92%)", "hsl(270, 50%, 94%)"],
  warm: ["hsl(20, 90%, 94%)", "hsl(340, 75%, 94%)"],
  fresh: ["hsl(160, 50%, 93%)", "hsl(199, 89%, 92%)"],
  droppi: ["hsl(199, 89%, 70%)", "hsl(330, 80%, 78%)"],
  droppiSoft: ["hsl(199, 89%, 92%)", "hsl(330, 80%, 94%)"],
} as const;
