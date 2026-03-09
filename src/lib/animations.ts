import type { TextAnimation } from "@/types/editor";

export interface AnimationConfig {
  displayName: string;
  cssClass: string;
}

export const ANIMATIONS: Record<TextAnimation, AnimationConfig> = {
  none: { displayName: "None", cssClass: "" },
  "fade-in": { displayName: "Fade In", cssClass: "animate-text-fade-in" },
  typewriter: { displayName: "Typewriter", cssClass: "animate-text-typewriter" },
  "slide-in": { displayName: "Slide In", cssClass: "animate-text-slide-in" },
  pop: { displayName: "Pop", cssClass: "animate-text-pop" },
};

export const ANIMATION_OPTIONS = Object.entries(ANIMATIONS).map(([key, config]) => ({
  value: key as TextAnimation,
  label: config.displayName,
}));

/**
 * Build FFmpeg drawtext animation expressions.
 * Returns partial overrides for drawtext params.
 */
export function buildFFmpegAnimationExpr(
  animation: TextAnimation,
  startTime: number,
  duration: number
): { alpha?: string; x?: string; fontsize?: string; enable?: string } {
  const end = startTime + duration;
  const enable = `enable='between(t,${startTime},${end})'`;

  switch (animation) {
    case "fade-in":
      return {
        alpha: `alpha='if(lt(t-${startTime},0.5),(t-${startTime})/0.5,1)'`,
        enable,
      };
    case "slide-in":
      return {
        x: `x='if(lt(t-${startTime},0.4),(-tw)+(tw+(w*0.5-tw/2))*((t-${startTime})/0.4),(w*0.5-tw/2))'`,
        enable,
      };
    case "pop":
      return {
        fontsize: `fontsize='if(lt(t-${startTime},0.3),trunc(FONTSIZE*((t-${startTime})/0.3)*1.2),if(lt(t-${startTime},0.5),trunc(FONTSIZE*(1.2-0.2*((t-${startTime}-0.3)/0.2))),FONTSIZE))'`,
        enable,
      };
    case "typewriter":
      return { enable };
    default:
      return {};
  }
}
