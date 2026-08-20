'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    const next = searchParams.get('next');
    router.replace(`/?login=1${next ? `&next=${encodeURIComponent(next)}` : ''}`);
  }, [router, searchParams]);
  return null;
}
