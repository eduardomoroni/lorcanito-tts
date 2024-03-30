/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
import { withSentryConfig } from "@sentry/nextjs";

!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

/** @type {import("next").NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "mdx"],
  transpilePackages: ["@lorcanito/engine"],
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
      config.externals.push({
        bufferutil: "bufferutil",
        "utf-8-validate": "utf-8-validate",
        "supports-color": "supports-color",
      });
    }

    return config;
  },
  async rewrites() {
    return [
      {
        source: "/socket.io/:path*",
        destination: "/api/socketio/:path*",
      },
    ];
  },
  // experimental: {
  //   scrollRestoration: true,
  // },
  headers: () => [
    {
      source: "/lobbies/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "no-store",
        },
      ],
    },
    {
      source: "/lobby",
      headers: [
        {
          key: "Cache-Control",
          value: "no-store",
        },
      ],
    },
    {
      source: "/games/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "no-store",
        },
      ],
    },
    {
      source: "/game",
      headers: [
        {
          key: "Cache-Control",
          value: "no-store",
        },
      ],
    },
  ],
  images: {
    minimumCacheTTL: 86400,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "six-inks.pages.dev",
        pathname: "/assets/images/**",
      },
      {
        protocol: "https",
        hostname: "lorcanito.imgix.net",
        pathname: "/assets/images/**",
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

  // Optional build-time configuration options
  // sentry: {
  //   // See the sections below for information on the following options:
  //   //   'Configure Source Maps':
  //   //     - disableServerWebpackPlugin
  //   //     - disableClientWebpackPlugin
  //   //     - hideSourceMaps
  //   //     - widenClientFileUpload
  //   //   'Configure Legacy Browser Support':
  //   //     - transpileClientSDK
  //   //   'Configure Serverside Auto-instrumentation':
  //   //     - autoInstrumentServerFunctions
  //   //     - excludeServerRoutes
  //   //   'Configure Tunneling to avoid Ad-Blockers':
  //   //     - tunnelRoute
  // },
};

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, configFile, stripPrefix, urlPrefix, include, ignore

  org: "lorcanito",
  project: "lorcanito-tts",

  // An auth token is required for uploading source maps.
  authToken: process.env.SENTRY_AUTH_TOKEN,

  silent: true, // Suppresses all logs

  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

export default withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: "lorcanito-wn",
    project: "lorcanito-simulator",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    // transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    // tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  },
);
