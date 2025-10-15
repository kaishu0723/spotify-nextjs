'use client';

import { useEffect, useState } from 'react';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
}

export default function Home() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    // ローカルストレージからトークンを取得
    const token = localStorage.getItem('spotify_access_token');
    if (token) {
      setAccessToken(token);
    }
  }, []);

  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  const handleLogout = () => {
    localStorage.removeItem('spotify_access_token');
    setAccessToken(null);
    setMessage('');
    setSearchResults([]);
    setSearchQuery('');
  };

  const searchTracks = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessToken || !searchQuery.trim()) {
      return;
    }

    setSearching(true);
    setMessage('');

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('検索に失敗しました');
      }

      const data = await response.json();
      setSearchResults(data.tracks.items);
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setSearching(false);
    }
  };

  const addTrackToPlaylist = async (trackId: string, trackName: string) => {
    if (!accessToken) {
      setMessage('ログインが必要です');
      return;
    }

    const playlistId = process.env.NEXT_PUBLIC_PLAYLIST_ID;
    if (!playlistId) {
      setMessage('プレイリストIDが設定されていません');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uris: [`spotify:track:${trackId}`],
          }),
        }
      );

      if (!response.ok) {
        throw new Error('曲の追加に失敗しました');
      }

      setMessage(`「${trackName}」をプレイリストに追加しました！`);
      // inputを空にして検索結果をクリア
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Spotify プレイリスト管理</h1>
      
      {!accessToken ? (
        <button 
          onClick={handleLogin} 
          style={{ 
            padding: '0.75rem 1.5rem', 
            cursor: 'pointer',
            fontSize: '1rem',
            backgroundColor: '#1DB954',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
          }}
        >
          Spotifyでログイン
        </button>
      ) : (
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ color: '#1DB954' }}>✓ ログイン済み</p>
            <button 
              onClick={handleLogout}
              style={{ 
                padding: '0.5rem 1rem', 
                cursor: 'pointer',
                fontSize: '0.9rem',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
            >
              ログアウト
            </button>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2>曲を検索して追加</h2>
            <form onSubmit={searchTracks} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="曲名を入力..."
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  fontSize: '1rem',
                  border: '2px solid #ddd',
                  borderRadius: '5px',
                }}
              />
              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  cursor: searching ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  backgroundColor: '#1DB954',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  opacity: searching || !searchQuery.trim() ? 0.5 : 1,
                }}
              >
                {searching ? '検索中...' : '検索'}
              </button>
            </form>
          </div>

          {searchResults.length > 0 && (
            <div>
              <h3>検索結果</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {searchResults.map((track) => (
                  <div
                    key={track.id}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      padding: '1rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      alignItems: 'center',
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    {track.album.images[0] && (
                      <img
                        src={track.album.images[0].url}
                        alt={track.album.name}
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '4px',
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.5rem 0' }}>{track.name}</h4>
                      <p style={{ margin: '0.25rem 0', color: '#666' }}>
                        アーティスト: {track.artists.map(a => a.name).join(', ')}
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#666' }}>
                        アルバム: {track.album.name}
                      </p>
                    </div>
                    <button
                      onClick={() => addTrackToPlaylist(track.id, track.name)}
                      disabled={loading}
                      style={{
                        padding: '0.75rem 1.5rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        backgroundColor: '#1DB954',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        opacity: loading ? 0.5 : 1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {message && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: message.includes('エラー') ? '#ffebee' : '#e8f5e9',
                border: `1px solid ${message.includes('エラー') ? '#ffcdd2' : '#c8e6c9'}`,
                borderRadius: '5px',
                color: message.includes('エラー') ? '#c62828' : '#2e7d32',
              }}
            >
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}