import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const TOKEN_COOKIE = 'alexstore_token';

// ─── JWT Payload type (matches backend) ──────────────────────────────────────
interface JwtPayload {
    sub: string;
    email: string;
    role: 'ADMIN' | 'SELLER' | 'BUYER';
}

// ─── Role-based route rules ──────────────────────────────────────────────────
const ROLE_ROUTES: Record<string, string[]> = {
    '/admin': ['ADMIN'],
    '/seller': ['SELLER'],
};

// Routes accessible by any authenticated user
const AUTH_ROUTES = ['/profile', '/cart', '/checkout', '/orders'];

// Routes that redirect away if already logged in
const GUEST_ROUTES = ['/login', '/register'];

// Role → default dashboard mapping
const ROLE_DASHBOARDS: Record<string, string> = {
    ADMIN: '/admin/dashboard',
    SELLER: '/seller/dashboard',
    BUYER: '/',
};

async function verifyToken(token: string): Promise<JwtPayload | null> {
    try {
        const secretStr = process.env.JWT_SECRET;
        if (!secretStr) {
            console.error('JWT_SECRET is not defined in middleware');
            return null;
        }

        const secret = new TextEncoder().encode(secretStr.replace(/"/g, '').trim());
        const { payload } = await jwtVerify(token, secret);
        return payload as unknown as JwtPayload;
    } catch (error) {
        console.error('JWT verification failed in middleware:', error);
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const token = request.cookies.get(TOKEN_COOKIE)?.value;
    const { pathname } = request.nextUrl;

    // Parse JWT if token exists
    const jwtPayload = token ? await verifyToken(token) : null;
    const isAuthenticated = !!jwtPayload;
    const role = jwtPayload?.role;

    // ─── 1. Role-restricted routes (admin, seller) ────────────────────────
    for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
        if (pathname.startsWith(routePrefix)) {
            if (!isAuthenticated) {
                const loginUrl = new URL('/login', request.url);
                loginUrl.searchParams.set('callbackUrl', pathname);
                return NextResponse.redirect(loginUrl);
            }

            if (!role || !allowedRoles.includes(role)) {
                // Wrong role → redirect to their own dashboard
                const dashboard = ROLE_DASHBOARDS[role || 'BUYER'] || '/';
                return NextResponse.redirect(new URL(dashboard, request.url));
            }

            return NextResponse.next();
        }
    }

    // ─── 2. Auth-required routes (any role) ───────────────────────────────
    const isAuthRequired = AUTH_ROUTES.some((route) => pathname.startsWith(route));
    if (isAuthRequired && !isAuthenticated) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ─── 3. Guest-only routes (login, register) ──────────────────────────
    const isGuestRoute = GUEST_ROUTES.some((route) => pathname.startsWith(route));
    if (isGuestRoute && isAuthenticated && role) {
        const dashboard = ROLE_DASHBOARDS[role] || '/';
        return NextResponse.redirect(new URL(dashboard, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/seller/:path*',
        '/profile/:path*',
        '/cart/:path*',
        '/checkout/:path*',
        '/orders/:path*',
        '/login',
        '/register',
    ],
};
