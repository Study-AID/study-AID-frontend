import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    // Extract authorization code from the URL
    const code = request.nextUrl.searchParams.get('code');

    if (!code) {
      return new NextResponse('Authorization code is missing', { status: 400 });
    }

    // Exchange code for tokens from Google
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${request.nextUrl.origin}/login/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Failed to exchange code for tokens:', tokenData);
      return NextResponse.redirect(
        `${FRONTEND_URL}/login?error=token_exchange_failed`,
      );
    }

    // Get user info from Google (optional, if you need the user data)
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );

    const userData = await userInfoResponse.json();

    if (!userInfoResponse.ok) {
      console.error('Failed to fetch user data:', userData);
      return NextResponse.redirect(
        `${FRONTEND_URL}/login?error=user_info_failed`,
      );
    }

    // In a real application, you would:
    // 1. Check if the user exists in your database
    // 2. Create the user if they don't exist
    // 3. Generate your own JWT tokens for your application

    // For demo purposes, we'll use Google's tokens directly
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    // Set refresh token as HttpOnly cookie
    cookies().set({
      name: 'refreshToken',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 14 * 24 * 60 * 60, // 14 days
      path: '/',
    });

    // Redirect to frontend with access token as URL parameter
    // The page.tsx component will read this and store it in localStorage
    return NextResponse.redirect(
      `${FRONTEND_URL}/login/google/callback?access_token=${accessToken}`,
    );
  } catch (error) {
    console.error('Error handling Google callback:', error);
    return NextResponse.redirect(`${FRONTEND_URL}/login?error=server_error`);
  }
}
