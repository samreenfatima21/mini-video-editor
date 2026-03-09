"use client";

interface ShapeRendererProps {
  shape: string;
  size?: number;
  color?: string;
}

const shapes: Record<string, (size: number, color: string) => React.ReactNode> = {
  circle: (size, color) => (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill={color} />
    </svg>
  ),
  square: (size, color) => (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="5" y="5" width="90" height="90" fill={color} rx="4" />
    </svg>
  ),
  star: (size, color) => (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill={color} />
    </svg>
  ),
  arrow: (size, color) => (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <polygon points="10,50 60,10 60,35 90,35 90,65 60,65 60,90" fill={color} />
    </svg>
  ),
  heart: (size, color) => (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path d="M50 88 C25 65 5 50 5 30 C5 15 15 5 30 5 C40 5 48 12 50 18 C52 12 60 5 70 5 C85 5 95 15 95 30 C95 50 75 65 50 88Z" fill={color} />
    </svg>
  ),
  triangle: (size, color) => (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <polygon points="50,10 90,90 10,90" fill={color} />
    </svg>
  ),
  diamond: (size, color) => (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <polygon points="50,5 95,50 50,95 5,50" fill={color} />
    </svg>
  ),
  checkmark: (size, color) => (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path d="M20 55 L40 75 L80 25" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export default function ShapeRenderer({ shape, size = 48, color = "#7c5cfc" }: ShapeRendererProps) {
  const renderer = shapes[shape];
  if (!renderer) return <span>{shape}</span>;
  return renderer(size, color);
}

export const SHAPE_NAMES = Object.keys(shapes);
