import { KeyRound, Settings } from "lucide-react";
import Link from "next/link";

interface MissingCredentialsProps {
  title: string;
  description: string;
}

export function MissingCredentials({ title, description }: MissingCredentialsProps) {
  return (
    <div className="flex h-[calc(100vh-80px)] w-full flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-900/50 shadow-inner ring-1 ring-zinc-800">
        <KeyRound className="h-10 w-10 text-indigo-400" />
      </div>
      <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-white">
        {title}
      </h2>
      <p className="mb-8 max-w-md text-sm leading-relaxed text-zinc-400">
        {description}
      </p>
      <Link
        href="/settings"
        className="flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/30"
      >
        <Settings className="h-4 w-4" />
        Go to Settings
      </Link>
    </div>
  );
}
