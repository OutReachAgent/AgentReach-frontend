"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Mail,
  PhoneCall,
  Bot,
  MessageSquareText,
  History,
  Settings,
  Zap,
  UserRound,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import {
  applyTheme,
  getStoredUser,
  getThemeFamily,
  LocalUserProfile,
  saveStoredUser,
  signOut,
} from "@/lib/localAuth";
import { api } from "@/lib/api";
import { LoaderOverlay } from "@/components/Loader";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<LocalUserProfile | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const refreshUser = () => setUser(getStoredUser());
    refreshUser();
    window.addEventListener("reachconvert:user-updated", refreshUser);
    return () =>
      window.removeEventListener("reachconvert:user-updated", refreshUser);
  }, []);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Contacts", href: "/contacts", icon: Users },
    { name: "Email Campaigns", href: "/email-campaigns", icon: Mail },
    { name: "AI Calling", href: "/calling-campaigns", icon: PhoneCall },
    { name: "AI Bots", href: "/ai-calling-bots", icon: Bot },
    { name: "AI Chat", href: "/bot-chat", icon: MessageSquareText },
    { name: "History", href: "/history", icon: History },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Profile", href: "/profile", icon: UserRound },
  ];

  const toggleTheme = () => {
    const currentUser = getStoredUser();
    const isLight = getThemeFamily(currentUser.theme) === "light";
    const nextUser: LocalUserProfile = {
      ...currentUser,
      theme: isLight ? "dark-midnight" : "light-cloud",
    };

    saveStoredUser(nextUser);
    applyTheme(nextUser.theme, nextUser.accentColor);
    setUser(nextUser);
    api.auth.updateProfile({ theme: nextUser.theme }).catch(() => {
      // Keep the local preference responsive even if the API call fails.
    });
  };

  const handleLogout = () => {
    setLoggingOut(true);
    api.auth.logout().finally(() => {
      signOut();
      router.replace("/login");
    });
  };

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between h-screen sticky top-0">
      <LoaderOverlay
        show={loggingOut}
        label="Signing out"
        sublabel="Ending your session securely…"
      />
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
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-inner border border-zinc-800"
                    : "text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-500 rounded-r-full" />
                )}
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive
                      ? "text-indigo-400"
                      : "text-zinc-500 group-hover:text-zinc-400"
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
        <div className="rounded-xl bg-zinc-900/60 border border-zinc-850/60 p-3">
          <Link href="/profile" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-300">
              {user?.initials || "OA"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-zinc-200">
                {user?.name || "Oswin Alex"}
              </p>
              <p className="truncate text-[10px] text-zinc-500">
                {user?.email || "oswinalex1@gmail.com"}
              </p>
            </div>
          </Link>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-2 text-[10px] font-bold text-zinc-400 hover:text-zinc-200"
            >
              {user && getThemeFamily(user.theme) === "light" ? (
                <Moon className="h-3.5 w-3.5" />
              ) : (
                <Sun className="h-3.5 w-3.5" />
              )}
              {user && getThemeFamily(user.theme) === "light"
                ? "Dark"
                : "Light"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-2 text-[10px] font-bold text-zinc-400 hover:text-rose-300"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
