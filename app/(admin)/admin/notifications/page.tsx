'use client';

import React from 'react';
import { NotificationsList } from '@/components/layout/NotificationsList';

export default function AdminNotificationsPage() {
    return (
        <div className="p-6 max-w-5xl mx-auto">
            <NotificationsList />
        </div>
    );
}
