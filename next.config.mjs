import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

// GITHUB_PAGES=true builds a static export into out/, served under NEXT_PUBLIC_BASE_PATH (e.g. "/kwirky-website").
const pages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {(phase: string) => import('next').NextConfig} */
export default function nextConfig(phase) {
  return {
    reactStrictMode: true,
    images: { unoptimized: true },
    // The dev server gets its own folder so running `npm run build` while `npm run dev` is open can't corrupt it.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
    ...(pages && { output: "export", trailingSlash: true, basePath }),
  };
}
