/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Smile ID's Web SDK renders inside a cross-origin iframe served from
            // cdn.usesmileid.com. camera=(self) alone blocks that iframe from
            // using the camera, so its origin must be explicitly allowed.
            key: 'Permissions-Policy',
            value: 'camera=(self "https://cdn.usesmileid.com" "https://cdn.smileidentity.com"), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
}

export default nextConfig