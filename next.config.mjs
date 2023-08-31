/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
// import {withSentryConfig} from "@sentry/nextjs";

!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));
//import { withSentryConfig } from "@sentry/nextjs";

/** @type {import("next").NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  // TODO: enable only locally
  // webVitalsAttribution: ['CLS', 'LCP'],
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals.push({ bufferutil: "bufferutil", "utf-8-validate": "utf-8-validate", "supports-color": "supports-color" });
    }

    return config;
  },
  headers: () => [
    {
      source: '/lobbies/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store',
        },
      ],
    },
    {
      source: '/lobby',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store',
        },
      ],
    },
    {
      source: '/games/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store',
        },
      ],
    },
    {
      source: '/game',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store',
        },
      ],
    },
  ],
  images: {
    // minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lorcanito.imgix.net",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "lorcanito.com",
        pathname: "/assets/images/**",
      },
      {
        protocol: "https",
        hostname: "lorcania.com",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;