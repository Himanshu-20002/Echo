'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getNotificationsCount } from '@/lib/firestore-service';
import Image from 'next/image';

export function Sidebar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (user && !['/profile', '/'].includes(pathname)) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [user, pathname]);

  const loadNotifications = async () => {
    if (user) {
      const count = await getNotificationsCount(user.uid);
      setNotificationCount(count);
    }
  };

  if (!user || ['/profile', '/'].includes(pathname)) {
    return null;
  }

  if (!isMounted) {
    return null;
  }

  const isActive = (href: string) => pathname === href;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    {
      href: '/home',
      label: 'Home',
      icon: '🏠',
      badge: null,
    },
    {
      href: '/discover',
      label: 'Discover',
      icon: '💭',
      badge: null,
    },
    {
      href: '/requests',
      label: 'Requests',
      icon: '❤️',
      badge: notificationCount > 0 ? (notificationCount > 9 ? '9+' : notificationCount) : null,
    },
    {
      href: '/messages',
      label: 'Messages',
      icon: '💬',
      badge: null,
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: '👤',
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-surface-dark border-b border-white/10 z-50 lg:hidden flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Image
            alt="Echo Logo"
            src="/echo_logo.png"
            width={32}
            height={32}
          />
          <span className="text-sm font-bold text-white">Echo</span>
        </div>
        
        {/* Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-surface-dark border-r border-white/10 transition-all duration-300 z-40 flex flex-col
          lg:translate-x-0 lg:w-64
          ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:translate-x-0'}`}
      >
        {/* Logo Section - Desktop Only */}
        <div className="hidden lg:flex items-center justify-between px-4 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Image
              alt="Echo Logo"
              src="/echo_logo.png"
              width={40}
              height={40}
              className="flex-shrink-0"
            />
            <span className="text-lg font-bold text-white">Echo</span>
          </div>
        </div>

        {/* Mobile Header in Sidebar */}
        <div className="flex lg:hidden items-center justify-between px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Image
              alt="Echo Logo"
              src="/echo_logo.png"
              width={40}
              height={40}
              className="flex-shrink-0"
            />
            <span className="text-lg font-bold text-white">Echo</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors relative group
                ${
                  isActive(item.href)
                    ? 'bg-accent-pink/20 text-accent-pink'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
            >
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <span className="font-medium whitespace-nowrap">
                {item.label}
              </span>
              
              {/* Badge */}
              {item.badge && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {item.badge}
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer Section - Logout */}
        <div className="px-4 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-xl flex-shrink-0">logout</span>
            <span className="font-medium text-sm whitespace-nowrap">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
