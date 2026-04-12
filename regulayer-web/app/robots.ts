import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard', '/api', '/settings', '/projects', '/billing'],
        },
        sitemap: 'https://regulayer.tech/sitemap.xml',
    };
}
