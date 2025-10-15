'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code) {
      // トークンを取得
      fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.access_token) {
            // トークンをローカルストレージに保存してホームへ
            localStorage.setItem('spotify_access_token', data.access_token);
            router.push('/');
          } else {
            setError('トークンの取得に失敗しました');
          }
        })
        .catch(() => {
          setError('エラーが発生しました');
        });
    } else {
      setError('認証コードがありません');
    }
  }, [searchParams, router]);

  return (
    <div style={{ padding: '2rem' }}>
      {error ? <p>エラー: {error}</p> : <p>認証中...</p>}
    </div>
  );
}

export default function Callback() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem' }}>読み込み中...</div>}>
      <CallbackContent />
    </Suspense>
  );
}

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';