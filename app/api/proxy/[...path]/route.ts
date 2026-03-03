import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
const COOKIE_NAME = 'alexstore_token';

/**
 * Proxy API route: forwards all requests to the NestJS backend
 * with the JWT token from HttpOnly cookie.
 *
 * Catches:
 *   /api/proxy/users      → backend /users
 *   /api/proxy/products   → backend /products
 *   /api/proxy/orders/123 → backend /orders/123
 */
export async function GET(request: NextRequest) {
    return proxyRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
    return proxyRequest(request, 'POST');
}

export async function PATCH(request: NextRequest) {
    return proxyRequest(request, 'PATCH');
}

export async function PUT(request: NextRequest) {
    return proxyRequest(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
    return proxyRequest(request, 'DELETE');
}

async function proxyRequest(request: NextRequest, method: string) {
    try {
        const token = request.cookies.get(COOKIE_NAME)?.value;

        // Build backend URL from the request path
        const url = new URL(request.url);
        const backendPath = url.pathname.replace('/api/proxy', '');
        const backendUrl = `${BACKEND_URL}${backendPath}${url.search}`;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const fetchOptions: RequestInit = { method, headers };

        // Only include body for non-GET requests
        if (method !== 'GET' && method !== 'DELETE') {
            try {
                const body = await request.json();
                fetchOptions.body = JSON.stringify(body);
            } catch {
                // No body to parse
            }
        }

        const backendRes = await fetch(backendUrl, fetchOptions);
        const data = await backendRes.json();

        return NextResponse.json(data, { status: backendRes.status });
    } catch (error) {
        return NextResponse.json(
            { message: 'Proxy error' },
            { status: 502 }
        );
    }
}
