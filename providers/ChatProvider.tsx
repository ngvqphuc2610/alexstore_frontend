'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { toast } from 'sonner';

interface ChatSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (conversationId: string) => void;
  leaveRoom: (conversationId: string) => void;
  sendMessage: (data: {
    conversationId: string;
    content: string;
    type?: string;
    referencedProductId?: string;
    referencedOrderId?: string;
  }) => void;
  emitTyping: (conversationId: string) => void;
  emitStopTyping: (conversationId: string) => void;
  markRead: (conversationId: string) => void;
}

const ChatSocketContext = createContext<ChatSocketContextType>({
  socket: null,
  isConnected: false,
  joinRoom: () => {},
  leaveRoom: () => {},
  sendMessage: () => {},
  emitTyping: () => {},
  emitStopTyping: () => {},
  markRead: () => {},
});

export const useChatSocket = () => useContext(ChatSocketContext);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { addMessage, setTyping, updateConversationLastMessage } = useChatStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_WS_URL
      ? process.env.NEXT_PUBLIC_WS_URL.replace('/notifications', '/chat')
      : 'http://localhost:8080/chat';

    const socketInstance = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('[Chat] Socket connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('[Chat] Socket disconnected');
      setIsConnected(false);
    });

    // Receive real-time messages
    socketInstance.on('receive_message', (message) => {
      addMessage(message);
      updateConversationLastMessage(
        message.conversationId,
        message.content,
        message.createdAt,
      );
    });

    // New chat message notification (when user is NOT in the room but online)
    socketInstance.on('new_chat_message', (data) => {
      const senderName = data.message?.sender?.username || 'Someone';
      toast(`💬 ${senderName}`, {
        description: data.message?.content?.substring(0, 100),
      });
    });

    // Typing indicator
    socketInstance.on('typing', (data) => {
      setTyping(true, data.conversationId, data.userId);
    });

    socketInstance.on('stop_typing', (data) => {
      setTyping(false, data.conversationId);
    });

    // Messages read by the other party
    socketInstance.on('messages_read', () => {
      // Could update message read status in the UI here
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const joinRoom = useCallback(
    (conversationId: string) => {
      socket?.emit('join_room', { conversationId });
    },
    [socket],
  );

  const leaveRoom = useCallback(
    (conversationId: string) => {
      // Socket.io rooms are left automatically on disconnect,
      // but we can manually leave if switching conversations
      socket?.emit('leave_room', { conversationId });
    },
    [socket],
  );

  const sendMessage = useCallback(
    (data: {
      conversationId: string;
      content: string;
      type?: string;
      referencedProductId?: string;
      referencedOrderId?: string;
    }) => {
      socket?.emit('send_message', data);
    },
    [socket],
  );

  const emitTyping = useCallback(
    (conversationId: string) => {
      socket?.emit('typing', { conversationId });
    },
    [socket],
  );

  const emitStopTyping = useCallback(
    (conversationId: string) => {
      socket?.emit('stop_typing', { conversationId });
    },
    [socket],
  );

  const markRead = useCallback(
    (conversationId: string) => {
      socket?.emit('mark_read', { conversationId });
    },
    [socket],
  );

  return (
    <ChatSocketContext.Provider
      value={{
        socket,
        isConnected,
        joinRoom,
        leaveRoom,
        sendMessage,
        emitTyping,
        emitStopTyping,
        markRead,
      }}
    >
      {children}
    </ChatSocketContext.Provider>
  );
}
