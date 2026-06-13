import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "ReachConvert - AI Outreach Platform",
  description: "Personalized bulk email, automated Calling Campaigns, and AI Templates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
