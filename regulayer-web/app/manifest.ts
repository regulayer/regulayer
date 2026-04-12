import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Regulayer Enterprise AI Trust',
        short_name: 'Regulayer',
        description: 'The definitive cryptographic reverse proxy and WORM governance engine for EU AI Act compliance. Intercept, evaluate, and seal LLM inference.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#FF6F3C',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/apple-touch-icon.png',
                sizes: '180x180',
                type: 'image/png',
            },
        ],
    };
}
