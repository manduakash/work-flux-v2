import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Helper to decode cookies that were stored as Base64 encoded JSON strings
 * (Matching the logic in src/utils/cookies.ts)
 */
function getDecodedCookie(request: NextRequest, name: string) {
    const cookie = request.cookies.get(name);
    if (!cookie) return null;
    try {
        // Base64 decode -> JSON parse
        const decoded = atob(cookie.value);
        return JSON.parse(decoded);
    } catch (e) {
        // If it's not JSON or not Base64, return the raw value as a fallback or null
        return cookie.value;
    }
}

export default function proxy(request: NextRequest) {
    const token = getDecodedCookie(request, 'token');
    const role = getDecodedCookie(request, 'role');
    const { pathname } = request.nextUrl;

    // Define public routes that don't need authentication
    const publicRoutes = ['/login', '/', '/register'];
    const isPublicRoute = publicRoutes.some(route => pathname === route);

    // 1. Auth Guard: Redirect to login if no token and accessing protected route
    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. Role-Based Access Control (RBAC)
    if (token) {
        // If user is logged in but tries to access login page or the root landing page, redirect to their dashboard
        if (isPublicRoute && (pathname === '/login' || pathname === '/')) {
            if (role === 'MANAGEMENT') return NextResponse.redirect(new URL('/admin-dashboard', request.url));
            if (role === 'TEAM_LEAD') return NextResponse.redirect(new URL('/team-lead-dashboard', request.url));
            if (role === 'DEVELOPER') return NextResponse.redirect(new URL('/developer-dashboard', request.url));
            return NextResponse.redirect(new URL('/admin-dashboard', request.url)); // Default fallback
        }

        // Protect Admin Routes
        if (pathname.startsWith('/admin-dashboard') && role !== 'MANAGEMENT') {
            return redirectToAuthorizedDashboard(role, request);
        }

        // Protect Team Lead Routes
        const teamLeadRoutes = [
            '/team-lead-dashboard',
            '/team-management',
            '/project-create',
            '/project-oversight',
            '/performance'
        ];
        if (teamLeadRoutes.some(route => pathname.startsWith(route))) {
            // Management also has access to TL routes usually
            if (role !== 'TEAM_LEAD' && role !== 'MANAGEMENT') {
                return redirectToAuthorizedDashboard(role, request);
            }
        }

        // Protect Developer Routes
        if (pathname.startsWith('/developer-dashboard')) {
            if (role !== 'DEVELOPER' && role !== 'TEAM_LEAD' && role !== 'MANAGEMENT') {
                return redirectToAuthorizedDashboard(role, request);
            }
        }
    }

    return NextResponse.next();
}

/**
 * Redirects user to their designated dashboard based on their role
 */
function redirectToAuthorizedDashboard(role: string, request: NextRequest) {
    if (role === 'MANAGEMENT') return NextResponse.redirect(new URL('/admin-dashboard', request.url));
    if (role === 'TEAM_LEAD') return NextResponse.redirect(new URL('/team-lead-dashboard', request.url));
    if (role === 'DEVELOPER') return NextResponse.redirect(new URL('/developer-dashboard', request.url));
    return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files with extensions (e.g., .mp4, .png, .jpg)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.mp4|.*\\.png|.*\\.jpg).*)',
    ],
}
