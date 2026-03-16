/**
 * Next.js Configuration
 *
 * The "standalone" output mode generates a self-contained build that includes
 * only the files needed to run in production (no node_modules). This is
 * essential for the Docker deployment -- the Dockerfile copies just the
 * standalone output into the final image, resulting in a much smaller
 * container (~100-150 MB vs. 500+ MB with full node_modules).
 */

import type { NextConfig } from "next";

const isNetlify = process.env.NETLIFY === "true";

const nextConfig: NextConfig = {
  ...(isNetlify ? {} : { output: "standalone" }),
};

export default nextConfig;
