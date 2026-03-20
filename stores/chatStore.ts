import { create } from 'zustand';
import { ChatMessage, Conversation } from '@/services/chat.service';

interface ChatState {
  // Conversations list
  conversations: Conversation[];
  activeConversationId: string | null;

  // Messages for the active conversation
  messages: ChatMessage[];
  isTyping: boolean;
  typingUserId: string | null;
  typingConversationId: string | null;

  // Chat widget visibility (for buyer floating widget)
  isChatOpen: boolean;
  
  // Actions
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (conversationId: string | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  prependMessages: (messages: ChatMessage[]) => void;
  setTyping: (isTyping: boolean, conversationId?: string, userId?: string) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;

  // Update conversation in list when new message arrives
  updateConversationLastMessage: (
    conversationId: string,
    message: string,
    timestamp: string,
  ) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isTyping: false,
  typingUserId: null,
  typingConversationId: null,
  isChatOpen: false,

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (conversationId) =>
    set({ activeConversationId: conversationId, messages: [] }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  prependMessages: (messages) =>
    set((state) => ({ messages: [...messages, ...state.messages] })),

  setTyping: (isTyping, conversationId, userId) =>
    set({ 
      isTyping, 
      typingConversationId: isTyping ? (conversationId || null) : null,
      typingUserId: isTyping ? (userId || null) : null 
    }),

  openChat: () => set({ isChatOpen: true }),
  closeChat: () => set({ isChatOpen: false, activeConversationId: null }),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

  updateConversationLastMessage: (conversationId, message, timestamp) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, lastMessage: message, lastMessageAt: timestamp }
          : c,
      ),
    })),
}));
