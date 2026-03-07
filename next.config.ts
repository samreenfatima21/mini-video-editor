import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These headers are REQUIRED for FFmpeg.wasm to work.
  // FFmpeg.wasm uses SharedArrayBuffer, which browsers only allow
  // when these security headers are set.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
