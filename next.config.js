/** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     domains: ["sleepercdn.com"],
//   },
// };
module.exports = module.exports = {
  eslint: { ignoreDuringBuilds: true },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  future: {
    webpack5: true, // by default, if you customize webpack config, they switch back to version 4.
    // Looks like backward compatibility approach.
  },
  images: {
    domains: ["sleepercdn.com", "img.freepik.com"],
  },
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback, // if you miss it, all the other options in fallback, specified
      // by next.js will be dropped. Doesn't make much sense, but how it is
      fs: false, // the solution
    };

    return config;
  },
};
