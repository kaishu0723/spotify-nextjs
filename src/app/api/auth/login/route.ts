import { NextResponse } from 'next/server';

export async function GET() {
  const scope = 'playlist-modify-public playlist-modify-private';
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

  const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
    response_type: 'code',
    client_id: clientId!,
    scope: scope,
    redirect_uri: redirectUri!,
  })}`;

  return NextResponse.redirect(authUrl);
}