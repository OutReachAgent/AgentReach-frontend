'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Mail,
  PhoneCall,
  History,
  Settings,
  Zap,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'Email Campaigns', href: '/email-campaigns', icon: Mail },
    { name: 'AI Calling', href: '/calling-campaigns', icon: PhoneCall },
    { name: 'History', href: '/history', icon: History },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between h-screen sticky top-0">
      <div className="flex flex-col flex-1 py-6">
        {/* Brand logo */}
        <div className="flex items-center gap-3 px-6 pb-6 border-b border-zinc-850">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              ReachConvert
            </h1>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest -mt-0.5">
              AI Outreach Suite
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 space-y-1.5 mt-8">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-inner border border-zinc-800'
                    : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-500 rounded-r-full" />
                )}
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-400'
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Info */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950/50">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-850/60">
          <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-300">
            OA
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-200">Oswin Alex</p>
            <p className="text-[10px] text-zinc-500">Premium Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
