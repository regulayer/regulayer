import { NextResponse } from 'next/server';

/**
 * 🔴 RSS OVERRIDE SECRETS 🔴
 * Search engines (specifically Googlebot) are hard-coded to prioritize RSS feeds 
 * natively because they assume it's breaking news. 
 * By providing an RSS feed populated with our core SEO hubs, Google will index them
 * within minutes of discovery instead of waiting days in the standard crawl queue.
 */

export async function GET() {
    const SITE_URL = 'https://regulayer.tech';
    const lastBuildDate = new Date().toUTCString();

    const items = [
        {
            title: 'EU AI Act Compliance Checklist 2026',
            link: `${SITE_URL}/eu-ai-act-compliance-checklist`,
            description: 'The definitive EU AI Act compliance checklist for enterprises. Step-by-step guide to Article 9, 12, 14, 27.',
            pubDate: lastBuildDate,
        },
        {
            title: 'AI Compliance Penalty Calculator | EU AI Act',
            link: `${SITE_URL}/eu-ai-act-penalty-calculator`,
            description: 'Calculate your maximum exposure to EU AI Act Article 71 penalties based on revenue, system risk, and violations.',
            pubDate: lastBuildDate,
        },
        {
            title: 'AI Compliance Software Comparison 2026',
            link: `${SITE_URL}/compare`,
            description: 'Regulayer vs LangSmith vs Helicone vs Datadog. Compare active AI interception vs passive observability logging.',
            pubDate: lastBuildDate,
        },
        {
            title: 'AI Risk Management Definitions & Glossary',
            link: `${SITE_URL}/glossary`,
            description: 'Comprehensive glossary of AI compliance terminology. Understand HITL governance, WORM storage, ISO 42001, and NIST AI RMF.',
            pubDate: lastBuildDate,
        },
        {
            title: 'Regulayer Compliance Trust Badge',
            link: `${SITE_URL}/badge`,
            description: 'Add the EU AI Act compliance badge to your website. Verify your automated HITL governance processes.',
            pubDate: lastBuildDate,
        }
    ];

    const feed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Regulayer AI Compliance News &amp; Updates</title>
    <link>${SITE_URL}</link>
    <description>Enterprise infrastructure updates for EU AI Act and ISO 42001 compliance.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${items.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <description><![CDATA[${item.description}]]></description>
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="true">${item.link}</guid>
    </item>`).join('')}
  </channel>
</rss>`;

    return new NextResponse(feed, {
        headers: {
            'Content-Type': 'application/xml',
            // No cache so Google always sees fresh pubDates
            'Cache-Control': 'no-store, max-age=0',
        },
    });
}
