'use client';

import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatContextStore } from '@/stores/chatContextStore';
import { useChatStore } from '@/stores/chatStore';
import { chatService } from '@/services/chat.service';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

interface ChatButtonProps {
  sellerId: string;
  shopName?: string;
  // Optional: pre-attach a product reference
  product?: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
  };
  // Optional: pre-attach an order reference
  order?: {
    id: string;
    orderCode: string;
    totalAmount: number;
    status: string;
  };
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ChatButton({
  sellerId,
  shopName,
  product,
  order,
  variant = 'outline',
  size = 'default',
  className,
}: ChatButtonProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { setProductReference, setOrderReference } = useChatContextStore();
  const { openChat, setActiveConversation } = useChatStore();

  const handleClick = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để nhắn tin');
      return;
    }

    // Don't allow messaging yourself
    if (user.id === sellerId) {
      toast.info('Bạn không thể nhắn tin cho chính mình');
      return;
    }

    try {
      // Set the context if provided
      if (product) {
        setProductReference(product, sellerId);
      } else if (order) {
        setOrderReference(order, sellerId);
      }

      // Create or get existing conversation
      const conversation = await chatService.getOrCreateConversation(sellerId);
      setActiveConversation(conversation.id);
      openChat();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể mở cuộc trò chuyện');
      console.error('Chat error:', error);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
    >
      <MessageSquare className="w-4 h-4 mr-2" />
      {shopName ? `Nhắn tin ${shopName}` : 'Nhắn tin'}
    </Button>
  );
}
