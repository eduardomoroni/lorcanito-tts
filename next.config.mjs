
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
  async rewrites() {
    return [
      {
        source: '/socket.io/:path*',
        destination: '/api/socketio/:path*',
      },
    ]
  },
  // experimental: {
  //   scrollRestoration: true,
  // },
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

// const sentryWebpackPluginOptions = {
//   // Additional config options for the Sentry Webpack plugin. Keep in mind that
//   // the following options are set automatically, and overriding them is not
//   // recommended:
//   //   release, url, authToken, configFile, stripPrefix,
//   //   urlPrefix, include, ignore
//
//   org: "lorcanito",
//   project: "lorcanito-tts",
//   sentry: {
//     disableServerWebpackPlugin: true,
//     disableClientWebpackPlugin: true,
//     hideSourceMaps: true,
//   },
//   silent: false, // Suppresses all logs
//
//   // For all available options, see:
//   // https://github.com/getsentry/sentry-webpack-plugin#options.
// };
//
// export default withSentryConfig(config, sentryWebpackPluginOptions);

// function remarkMDXLayout(source) {
//   let parser = Parser.extend(jsx())
//   let parseOptions = { ecmaVersion: 'latest', sourceType: 'module' }
//
//   return (tree, file) => {
//     let filename = path.relative(file.cwd, file.history[0])
//     let segments = filename.split(path.sep)
//     let segmentsStr = JSON.stringify(segments)
//
//     let imp = `import _Layout from '${source}'`
//     let exp = `export default function Layout(props) {
//       return <_Layout {...props} _segments={${segmentsStr}} />
//     }`
//
//     tree.children.push(
//         {
//           type: 'mdxjsEsm',
//           value: imp,
//           data: { estree: parser.parse(imp, parseOptions) },
//         },
//         {
//           type: 'mdxjsEsm',
//           value: exp,
//           data: { estree: parser.parse(exp, parseOptions) },
//         }
//     )
//   }
// }

// export default async function config() {
//   let highlighter = await shiki.getHighlighter({
//     theme: 'css-variables',
//   })
//
//   let withMDX = nextMDX({
//     extension: /\.mdx$/,
//     options: {
//       recmaPlugins: [recmaImportImages],
//       rehypePlugins: [
//         [rehypeShiki, { highlighter }],
//         [
//           remarkRehypeWrap,
//           {
//             node: { type: 'mdxJsxFlowElement', name: 'Typography' },
//             start: ':root > :not(mdxJsxFlowElement)',
//             end: ':root > mdxJsxFlowElement',
//           },
//         ],
//       ],
//       remarkPlugins: [
//         remarkGfm,
//         remarkUnwrapImages,
//         [
//           unifiedConditional,
//           [
//             new RegExp(`^${escapeStringRegexp(path.resolve('src/app/blog'))}`),
//             [[remarkMDXLayout, '@/app/blog/wrapper']],
//           ],
//           [
//             new RegExp(`^${escapeStringRegexp(path.resolve('src/app/work'))}`),
//             [[remarkMDXLayout, '@/app/work/wrapper']],
//           ],
//         ],
//       ],
//     },
//   })
//
//   return withMDX(nextConfig)
// }

