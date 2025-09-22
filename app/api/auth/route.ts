import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.UPLOAD_PASSWORD;

    if (!correctPassword) {
      return NextResponse.json({ error: 'Authentication not configured' }, { status: 500 });
    }

    if (password === correctPassword) {
      // Set a secure HTTP-only cookie for authentication
      const response = NextResponse.json({ success: true });
      response.cookies.set('upload-auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
      });
      return response;
    } else {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
