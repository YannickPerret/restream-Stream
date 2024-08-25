/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: '0.0.0.0',
                port: '3333',
                pathname: '/images/**',
            },
            {
                protocol: 'https',
                hostname: '0.0.0.0',
                port: '3333',
                pathname: '/images/**',
            },
        ],
    },
    output: "standalone",
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
