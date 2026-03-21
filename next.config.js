/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Only treat TypeScript files as pages to avoid picking up legacy src/pages/*.jsx
  pageExtensions: ['ts', 'tsx', 'mdx'],
  eslint: {
    // ESLint is run separately; the Vite-era eslint.config.js is not compatible
    // with Next.js's built-in ESLint runner. Run `next lint` after adding
    // a Next.js-compatible .eslintrc.json.
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
