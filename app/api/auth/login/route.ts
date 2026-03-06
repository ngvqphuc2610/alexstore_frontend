import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
const COOKIE_NAME = 'alexstore_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const backendRes = await fetch(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await backendRes.json();

        if (!backendRes.ok) {
            return NextResponse.json(data, { status: backendRes.status });
        }

        const result = data.data ?? data;
        const { accessToken, user } = result;

        if (!accessToken) {
            throw new Error('No token provided from backend');
        }

        // Set HttpOnly cookie with the JWT token
        // (role is inside JWT payload — middleware reads it via jose)
        const response = NextResponse.json({ success: true, user });

        response.cookies.set(COOKIE_NAME, accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: COOKIE_MAX_AGE,
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
