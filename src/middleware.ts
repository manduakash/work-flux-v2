import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Helper to decode cookies that were stored as Base64 encoded JSON strings
 */
function getDecodedCookie(request: NextRequest, name: string) {
    const cookie = request.cookies.get(name);
    if (!cookie) return null;
    try {
        const decoded = atob(cookie.value);
        return JSON.parse(decoded);
    } catch (e) {
        return cookie.value;
    }
}

export default function middleware(request: NextRequest) {
    const token = getDecodedCookie(request, 'token');
    const role = getDecodedCookie(request, 'role');
    const { pathname } = request.nextUrl;

    const publicRoutes = ['/login', '/', '/register', '/session-expired'];
    const isPublicRoute = publicRoutes.some(route => pathname === route);

    // 1. Unauthenticated users trying to access protected routes
    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL('/session-expired', request.url));
    }

    // 2. Authenticated users
    if (token) {
        // If role is missing, we are in a broken state. Clear session and go to login.
        if (!role && pathname !== '/login') {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('token');
            response.cookies.delete('role');
            response.cookies.delete('user');
            return response;
        }

        // Redirect from public routes to appropriate dashboard
        if (isPublicRoute && (pathname === '/login' || pathname === '/')) {
            if (role === 'MANAGEMENT') return NextResponse.redirect(new URL('/admin-dashboard', request.url));
            if (role === 'TEAM_LEAD') return NextResponse.redirect(new URL('/team-lead-dashboard', request.url));
            if (role === 'DEVELOPER') return NextResponse.redirect(new URL('/developer-dashboard', request.url));

            // If we have a token but an unrecognized role, don't fallback to a protected route!
            // This prevents the infinite loop.
            if (pathname !== '/login') {
                return NextResponse.redirect(new URL('/login', request.url));
            }
            return NextResponse.next();
        }

        // RBAC Area Guards
        if (pathname.startsWith('/admin-dashboard') && role !== 'MANAGEMENT') {
            return redirectToAuthorizedDashboard(role, request);
        }

        const managementRoutes = ['/team-management', '/create-manage-task', '/project-create', '/project-oversight', '/performance'];
        if (managementRoutes.some(route => pathname.startsWith(route))) {
            if (role !== 'TEAM_LEAD' && role !== 'MANAGEMENT' && role !== 'DEVELOPER') {
                return redirectToAuthorizedDashboard(role, request);
            }
        }

        if (pathname.startsWith('/developer-dashboard')) {
            if (role !== 'DEVELOPER' && role !== 'TEAM_LEAD' && role !== 'MANAGEMENT') {
                return redirectToAuthorizedDashboard(role, request);
            }
        }
    }

    return NextResponse.next();
}

function redirectToAuthorizedDashboard(role: any, request: NextRequest) {
    if (role === 'MANAGEMENT') return NextResponse.redirect(new URL('/admin-dashboard', request.url));
    if (role === 'TEAM_LEAD') return NextResponse.redirect(new URL('/team-lead-dashboard', request.url));
    if (role === 'DEVELOPER') return NextResponse.redirect(new URL('/developer-dashboard', request.url));

    // Fallback: If no recognized role, go to login and clear token to break any potential loops
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    response.cookies.delete('role');
    response.cookies.delete('user');
    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.mp4|.*\\.png|.*\\.jpg).*)'],
}
