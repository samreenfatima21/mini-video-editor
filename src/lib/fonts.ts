import type { FontFamily } from "@/types/editor";

export interface FontConfig {
  displayName: string;
  cssFamily: string;
  ttfFilename: string;
}

export const FONTS: Record<FontFamily, FontConfig> = {
  inter: {
    displayName: "Inter",
    cssFamily: "var(--font-inter)",
    ttfFilename: "Inter-Regular.ttf",
  },
  "roboto-mono": {
    displayName: "Roboto Mono",
    cssFamily: "var(--font-roboto-mono)",
    ttfFilename: "RobotoMono-Regular.ttf",
  },
  playfair: {
    displayName: "Playfair Display",
    cssFamily: "var(--font-playfair)",
    ttfFilename: "PlayfairDisplay-Regular.ttf",
  },
  oswald: {
    displayName: "Oswald",
    cssFamily: "var(--font-oswald)",
    ttfFilename: "Oswald-Regular.ttf",
  },
  "dancing-script": {
    displayName: "Dancing Script",
    cssFamily: "var(--font-dancing-script)",
    ttfFilename: "DancingScript-Regular.ttf",
  },
  "bebas-neue": {
    displayName: "Bebas Neue",
    cssFamily: "var(--font-bebas-neue)",
    ttfFilename: "BebasNeue-Regular.ttf",
  },
};

export const FONT_OPTIONS = Object.entries(FONTS).map(([key, config]) => ({
  value: key as FontFamily,
  label: config.displayName,
}));
