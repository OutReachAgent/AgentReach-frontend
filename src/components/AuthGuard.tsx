'use client';

import { api } from '@/lib/api';
import { applyTheme, isAuthenticated, saveStoredUser, signOut } from '@/lib/localAuth';
import { PageLoader } from '@/components/Loader';
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
        applyTheme(user.theme, user.accentColor);
        setAllowed(true);
      })
      .catch(() => {
        signOut();
        router.replace('/login');
      });
  }, [router]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <PageLoader label="Checking session" sublabel="Verifying your workspace access" />
      </div>
    );
  }

  return children;
}
