'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LandingPage from '@/components/landing-page';
import { Sidebar } from '@/components/layout/sidebar';
import { HomeDashboard } from '@/components/dashboard/home-dashboard';
export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user && !loading) {
      router.push('/home');
    }
  }, [user, loading, router, mounted]);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!user) {
    return <LandingPage />;
  }



  // If user exists, redirect will happen in useEffect above
  return null;
}
