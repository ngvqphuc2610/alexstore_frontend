import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
const COOKIE_NAME = 'alexstore_token';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get(COOKIE_NAME)?.value;

        if (!token) {
            return NextResponse.json(
                { message: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Verify token by calling backend profile endpoint
        const backendRes = await fetch(`${BACKEND_URL}/auth/profile`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!backendRes.ok) {
            // Token invalid, clear cookie
            const response = NextResponse.json(
                { message: 'Invalid token' },
                { status: 401 }
            );
            response.cookies.set(COOKIE_NAME, '', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 0,
            });
            return response;
        }

        const data = await backendRes.json();
        const user = data.data ?? data;

        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
