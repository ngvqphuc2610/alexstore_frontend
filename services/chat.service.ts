import api from './api';

export interface Conversation {
  id: string;
  buyerId: string;
  sellerId: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCountBuyer: number;
  unreadCountSeller: number;
  createdAt: string;
  buyer?: { id: string; username: string };
  seller?: { id: string; username: string; shopName?: string };
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'PRODUCT_REF' | 'ORDER_REF';
  content: string;
  referencedProductId: string | null;
  referencedOrderId: string | null;
  product?: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
  };
  order?: {
    id: string;
    orderCode: string;
    totalAmount: number;
    status: string;
  };
  isRead: boolean;
  createdAt: string;
  sender?: { id: string; username: string };
}

export interface MessagesResponse {
  data: ChatMessage[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const chatService = {
  /**
   * Create or get existing conversation with a seller
   */
  getOrCreateConversation: (sellerId: string): Promise<Conversation> =>
    api.post('/chat/conversations', { sellerId }),

  /**
   * Get all conversations for the current user
   */
  getConversations: (): Promise<Conversation[]> =>
    api.get('/chat/conversations'),

  /**
   * Get messages with cursor-based pagination
   */
  getMessages: (
    conversationId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<MessagesResponse> => {
    const params = new URLSearchParams();
    if (cursor) params.set('cursor', cursor);
    params.set('limit', limit.toString());
    return api.get(`/chat/conversations/${conversationId}/messages?${params.toString()}`);
  },
};
