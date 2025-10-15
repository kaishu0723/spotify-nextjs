import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { code } = await request.json();

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI!;

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      return NextResponse.json({ access_token: data.access_token });
    } else {
      return NextResponse.json({ error: 'Failed to get access token' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}