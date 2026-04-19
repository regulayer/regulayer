import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: 'Googlebot',
                allow: [
                    '/',
                    '/glossary',
                    '/compare',
                    '/use-cases',
                    '/eu-ai-act-compliance-checklist',
                    '/regulayer-enterprise-ai-compliance-technical-brief.txt',
                    '/regulayer-complete-knowledge-base.txt',
                    '/regulayer-agentic-master-prompt.txt',
                ],
                disallow: ['/dashboard', '/settings', '/projects', '/billing', '/superadmin'],
            },
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/dashboard', '/api', '/settings', '/projects', '/billing', '/superadmin'],
            },
        ],
        sitemap: 'https://regulayer.tech/sitemap.xml',
        host: 'https://regulayer.tech',
    };
}

