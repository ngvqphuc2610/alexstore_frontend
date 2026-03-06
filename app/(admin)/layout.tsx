'use client';

import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminTopbar } from '@/components/layout/AdminTopbar';
import { AuthProvider } from '@/providers/AuthProvider';
import { useUIStore } from '@/stores/uiStore';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const sidebarOpen = useUIStore((s) => s.sidebarOpen);

    return (
        <AuthProvider>
            <TooltipProvider>
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                    <AdminSidebar />
                    <div
                        className={cn(
                            'flex min-h-screen flex-col transition-all duration-300',
                            sidebarOpen ? 'ml-64' : 'ml-[68px]'
                        )}
                    >
                        <AdminTopbar />
                        <main className="flex-1 p-6">
                            {children}
                        </main>
                    </div>
                </div>
            </TooltipProvider>
        </AuthProvider>
    );
}
