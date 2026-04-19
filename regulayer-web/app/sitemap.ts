import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://regulayer.tech',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: 'https://regulayer.tech/docs',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.95,
        },
        {
            url: 'https://regulayer.tech/architecture',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: 'https://regulayer.tech/pricing',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: 'https://regulayer.tech/trust',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: 'https://regulayer.tech/about',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: 'https://regulayer.tech/blog',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: 'https://regulayer.tech/contact',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: 'https://regulayer.tech/careers',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: 'https://regulayer.tech/integrations',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: 'https://regulayer.tech/glossary',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: 'https://regulayer.tech/use-cases',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: 'https://regulayer.tech/compare',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.95,
        },
        {
            url: 'https://regulayer.tech/eu-ai-act-compliance-checklist',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.95,
        },
        {
            url: 'https://regulayer.tech/eu-ai-act-penalty-calculator',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.95,
        },
        {
            url: 'https://regulayer.tech/badge',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: 'https://regulayer.tech/status',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.5,
        },
    ];
}

