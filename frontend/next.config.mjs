/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // AniList CDN covers/banners are hotlinked per design.md
      { protocol: 'https', hostname: 's4.anilist.co' },
      { protocol: 'https', hostname: '*.anilist.co' },
    ],
  },
};

export default nextConfig;
