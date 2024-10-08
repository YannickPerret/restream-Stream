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
            {
                protocol: 'https',
                hostname: 'restream.s3.swiss-backup03.infomaniak.com',
            },
            {
                protocol: 'https',
                hostname: 's3.pub1.infomaniak.cloud',
            }
        ],
        dangerouslyAllowSVG: true,
    },
    output: "standalone",
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
