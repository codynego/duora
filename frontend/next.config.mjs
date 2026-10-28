/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{
      source: '/:path(dashboard|onboarding|login|signup|forgot-password|reset-password|verify-email|profile|offline)/:rest*',
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
    }];
  },
};

export default nextConfig;
