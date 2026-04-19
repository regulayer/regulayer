import { NextRequest, NextResponse } from 'next/server';

/**
 * Embeddable Badge API — The #1 Automated Backlinking Engine
 * 
 * Other websites embed this badge on their site to show "EU AI Act Compliant — Powered by Regulayer"
 * Every embed creates an automatic dofollow backlink to regulayer.tech
 * 
 * Usage: <a href="https://regulayer.tech"><img src="https://regulayer.tech/api/badge?style=dark" /></a>
 * 
 * This is how Cloudflare, WordPress.org, and Built With generated millions of backlinks.
 */

function generateSVG(style: string, text: string) {
  const isDark = style === 'dark';
  const bg = isDark ? '#1a1410' : '#ffffff';
  const border = isDark ? '#3d2e23' : '#e8ddd4';
  const textColor = isDark ? '#f5e6d8' : '#1a1410';
  const accentColor = '#e86331';
  const subTextColor = isDark ? '#8a7a6d' : '#6b5d52';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="44" viewBox="0 0 240 44">
  <rect width="240" height="44" rx="6" fill="${bg}" stroke="${border}" stroke-width="1"/>
  <rect x="0" y="0" width="44" height="44" rx="6" fill="${accentColor}15"/>
  <path d="M16 16 L28 16 L28 28 L16 28 Z M18 20 L26 20 M18 24 L26 24" stroke="${accentColor}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <circle cx="22" cy="22" r="3" fill="${accentColor}" opacity="0.3"/>
  <text x="52" y="19" font-family="system-ui,-apple-system,sans-serif" font-size="11" font-weight="700" fill="${textColor}">${text}</text>
  <text x="52" y="33" font-family="system-ui,-apple-system,sans-serif" font-size="9" fill="${subTextColor}">Powered by Regulayer</text>
</svg>`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const style = searchParams.get('style') || 'light';
  const variant = searchParams.get('variant') || 'compliant';

  const texts: Record<string, string> = {
    'compliant': 'EU AI Act Compliant',
    'governed': 'AI Governance Active',
    'audited': 'Cryptographic Audit Trail',
    'hitl': 'Human-in-the-Loop Verified',
    'iso': 'ISO 42001 Conformant',
  };

  const text = texts[variant] || texts['compliant'];
  const svg = generateSVG(style, text);

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
