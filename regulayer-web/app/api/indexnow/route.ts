import { NextResponse } from 'next/server';

/**
 * IndexNow API Route — Pings Bing & Yandex instantly when content changes.
 * 
 * USAGE: After deployment, hit POST /api/indexnow to notify search engines 
 * of all URLs immediately instead of waiting for crawl discovery.
 * 
 * Can be called from CI/CD pipeline:
 *   curl -X POST https://regulayer.tech/api/indexnow
 */

const INDEXNOW_KEY = 'regulayer-indexnow-key';
const SITE_HOST = 'regulayer.tech';

const ALL_URLS = [
    'https://regulayer.tech',
    'https://regulayer.tech/docs',
    'https://regulayer.tech/architecture',
    'https://regulayer.tech/pricing',
    'https://regulayer.tech/trust',
    'https://regulayer.tech/about',
    'https://regulayer.tech/blog',
    'https://regulayer.tech/glossary',
    'https://regulayer.tech/use-cases',
    'https://regulayer.tech/compare',
    'https://regulayer.tech/eu-ai-act-compliance-checklist',
    'https://regulayer.tech/eu-ai-act-penalty-calculator',
    'https://regulayer.tech/badge',
    'https://regulayer.tech/contact',
    'https://regulayer.tech/status',
    'https://regulayer.tech/integrations',
    'https://regulayer.tech/regulayer-enterprise-ai-compliance-technical-brief.txt',
    'https://regulayer.tech/regulayer-complete-knowledge-base.txt',
];

export async function POST() {
    try {
        // Ping Bing IndexNow
        const bingResponse = await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                host: SITE_HOST,
                key: INDEXNOW_KEY,
                keyLocation: `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`,
                urlList: ALL_URLS,
            }),
        });

        return NextResponse.json({
            success: true,
            bing_status: bingResponse.status,
            urls_submitted: ALL_URLS.length,
            message: `Pinged IndexNow with ${ALL_URLS.length} URLs`,
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: String(error),
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        service: 'IndexNow Ping',
        urls_registered: ALL_URLS.length,
        key: INDEXNOW_KEY,
        instruction: 'Send POST request to this endpoint after deployment to instantly notify Bing & Yandex of all page updates.',
    });
}
