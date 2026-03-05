'use client';

import { SellerSidebar } from '@/components/layout/SellerSidebar';
import { SellerTopbar } from '@/components/layout/SellerTopbar';
import { AuthProvider } from '@/providers/AuthProvider';
import { useUIStore } from '@/stores/uiStore';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';

export default function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const sidebarOpen = useUIStore((s) => s.sidebarOpen);

    return (
        <AuthProvider>
            <TooltipProvider>
                <div className="min-h-screen bg-emerald-50/30">
                    <SellerSidebar />
                    <div
                        className={cn(
                            'flex min-h-screen flex-col transition-all duration-300',
                            sidebarOpen ? 'ml-64' : 'ml-[68px]'
                        )}
                    >
                        <SellerTopbar />
                        <main className="flex-1 p-6">
                            {children}
                        </main>
                    </div>
                </div>
                <Toaster position="top-right" richColors />
            </TooltipProvider>
        </AuthProvider>
    );
}
