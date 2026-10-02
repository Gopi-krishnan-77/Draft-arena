import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // A stray package-lock.json exists in the home directory; pin the tracing root
  // to this project so Next stops inferring the wrong workspace root.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
