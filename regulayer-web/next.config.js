const domain = process.env.DOMAIN || 'localhost';
const isLocal = domain === 'localhost' || domain === '127.0.0.1';
const defaultApiUrl = isLocal ? 'http://localhost:8080' : `https://api.${domain}`;

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || defaultApiUrl,
        NEXT_PUBLIC_DOMAIN: domain,
    },
};

module.exports = nextConfig;
