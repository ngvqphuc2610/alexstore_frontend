import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { SocketProvider } from "@/providers/SocketProvider";
import { ChatProvider } from "@/providers/ChatProvider";
import { ChatWidget } from "@/components/shared/ChatWidget";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AlexStore",
  description: "AlexStore - Nền tảng thương mại điện tử",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <AuthProvider>
            <SocketProvider>
              <ChatProvider>
                {children}
                <ChatWidget />
              </ChatProvider>
            </SocketProvider>
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
