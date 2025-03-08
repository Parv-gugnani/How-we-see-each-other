/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uploadthing.com',
        pathname: '/f/**',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: '/f/**',
      }
    ],
  },
};

module.exports = nextConfig; 