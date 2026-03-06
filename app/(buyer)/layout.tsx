'use client';

import React from 'react';
import BuyerNavbar from '@/components/layout/BuyerNavbar';
import BuyerFooter from '@/components/layout/BuyerFooter';

export default function BuyerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
            <BuyerNavbar />
            <main className="flex-1">
                {children}
            </main>
            <BuyerFooter />
        </div>
    );
}
