'use client';

import React from 'react';
import { ProfileLayout } from '@/components/shared/ProfileLayout';
import { NotificationsList } from '@/components/layout/NotificationsList';

export default function NotificationsPage() {
    return (
        <ProfileLayout>
            <div className="bg-white rounded-lg shadow-sm border p-6 min-h-[500px]">
                <NotificationsList />
            </div>
        </ProfileLayout>
    );
}
