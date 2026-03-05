'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-muted/30">
            <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background shadow-sm">
                <Link className="flex items-center justify-center gap-2" href="/">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold tracking-tight">AlexStore</span>
                </Link>
            </header>
            <main className="flex-1 flex items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
                    {children}
                </div>
            </main>
            <footer className="py-6 border-t bg-background">
                <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <p className="text-xs text-muted-foreground">
                        © 2026 AlexStore Inc. Bảo lưu mọi quyền.
                    </p>
                    <nav className="flex gap-4 sm:gap-6">
                        <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="#">
                            Điều khoản dịch vụ
                        </Link>
                        <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="#">
                            Quyền riêng tư
                        </Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
