import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('regulayer_token')?.value

    // Define paths
    const pathname = request.nextUrl.pathname
    const isAuthPage = pathname.startsWith('/login') ||
        pathname.startsWith('/signup') ||
        pathname.startsWith('/forgot-password') ||
        pathname.startsWith('/reset-password')

    // Public paths that don't satisfy the "isAuthPage" check above but should be accessible
    const isPublicPath = pathname === '/' ||
        pathname.startsWith('/pricing') ||
        pathname.startsWith('/about') ||
        pathname.startsWith('/legal') ||
        pathname.startsWith('/docs') ||
        pathname.startsWith('/contact') ||
        pathname.startsWith('/status') ||
        pathname.startsWith('/trust') ||
        pathname.startsWith('/security') ||
        pathname.startsWith('/integrations') ||
        pathname.startsWith('/careers') ||
        pathname.startsWith('/blog') ||
        pathname.startsWith('/accept-invite')

    // Check if it's a static asset or API route (handled by matcher config usually, but good to be safe)
    if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
        return NextResponse.next()
    }

    // Case 1: Unauthenticated user trying to access protected route
    if (!token && !isAuthPage && !isPublicPath) {
        const loginUrl = new URL('/login', request.url)
        // Redirect to login
        return NextResponse.redirect(loginUrl)
    }

    // Case 2: Authenticated user trying to access auth pages (login/signup)
    if (token && isAuthPage) {
        // Redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * 1. /api/ (API routes)
         * 2. /_next/ (Next.js internals)
         * 3. /_static (inside /public)
         * 4. /favicon.ico, /sitemap.xml
         * 5. all root files inside /public (e.g. /images/*)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|images).*)',
    ],
}
