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

        // Handle path mapping: /uploads should hit the backend root, everything else hits /api/v1
        let backendUrlBase = process.env.BACKEND_URL || 'http://localhost:8080';
        if (!backendPath.startsWith('/uploads')) {
            backendUrlBase = `${backendUrlBase}/api/v1`;
        }

        const backendUrl = `${backendUrlBase}${backendPath}${url.search}`;

        const incomingContentType = request.headers.get('content-type');
        console.log(`[Proxy] ${method} ${backendUrl} (Content-Type: ${incomingContentType})`);

        // Copy original headers
        const headers = new Headers();
        request.headers.forEach((value, key) => {
            if (['host', 'connection'].includes(key.toLowerCase())) return;
            headers.set(key, value);
        });

        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        const fetchOptions: RequestInit = {
            method,
            headers,
        };

        if (method !== 'GET' && method !== 'DELETE') {
            const body = await request.arrayBuffer();
            if (body.byteLength > 0) {
                fetchOptions.body = body;
            }
        }

        const backendRes = await fetch(backendUrl, fetchOptions);
        const contentType = backendRes.headers.get('content-type') || '';

        // If JSON, return as JSON. Otherwise return as raw buffer with correct content-type.
        if (contentType.includes('application/json')) {
            const data = await backendRes.json();
            return NextResponse.json(data, { status: backendRes.status });
        } else {
            const buffer = await backendRes.arrayBuffer();
            return new NextResponse(buffer, {
                status: backendRes.status,
                headers: {
                    'Content-Type': contentType,
                    'Cache-Control': backendRes.headers.get('cache-control') || 'public, max-age=3600',
                },
            });
        }
    } catch (error: any) {
        console.error(`[Proxy] Critical error:`, error.message);
        return NextResponse.json(
            { message: 'Proxy error', details: error.message },
            { status: 502 }
        );
    }
}
