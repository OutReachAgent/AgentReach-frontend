'use client';

import { api } from '@/lib/api';
import { applyTheme, isAuthenticated, saveStoredUser, signOut } from '@/lib/localAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    api.auth.me()
      .then((user) => {
        saveStoredUser(user);
        applyTheme(user.theme);
        setAllowed(true);
      })
      .catch(() => {
        signOut();
        router.replace('/login');
      });
  }, [router]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm font-semibold text-zinc-500">
        Checking session...
      </div>
    );
  }

  return children;
}
