import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Regulayer — EU AI Act Compliance & AI Risk Management Software',
        short_name: 'Regulayer',
        description: 'Enterprise AI compliance software. Real-time AI risk management proxy with EU AI Act conformity, Human-in-the-Loop governance, and ISO 42001 audit automation.',
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
