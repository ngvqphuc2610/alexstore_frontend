'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user, isAuthenticated } = useAuthStore();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isAuthenticated || !user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        // We assume backend handles authentication via cookies or we pass a token if available.
        // Since backend check auth.token or Authorization header, and frontend stores JWT in HttpOnly cookie,
        // we might need a workaround or adjust backend.
        // For now, let's connect and assume cookies might work if correctly configured.
        
        const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/notifications';
        
        const socketInstance = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket'],
        });

        socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        socketInstance.on('notification', (data: { title: string; message: string; type: string }) => {
            toast(data.title, {
                description: data.message,
            });
            // Invalidate notifications query to update dropdown in real-time
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [isAuthenticated, user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}
