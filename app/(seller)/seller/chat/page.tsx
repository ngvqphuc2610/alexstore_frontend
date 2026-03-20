'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Send, Loader2, MessageSquare, ChevronRight, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useChatStore } from '@/stores/chatStore';
import { useChatSocket } from '@/providers/ChatProvider';
import { useAuthStore } from '@/stores/authStore';
import { chatService, type Conversation } from '@/services/chat.service';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function SellerChatPage() {
  const { user } = useAuthStore();
  const {
    activeConversationId,
    messages,
    setMessages,
    addMessage,
    setActiveConversation,
    conversations,
    setConversations,
    isTyping,
    typingConversationId,
    prependMessages,
    updateConversationLastMessage,
  } = useChatStore();

  const { joinRoom, sendMessage, emitTyping, emitStopTyping, markRead, isConnected } =
    useChatSocket();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLocalTyping, setIsLocalTyping] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load conversations on mount
  useEffect(() => {
    chatService.getConversations().then(setConversations).catch(console.error);
  }, [setConversations]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;

    setLoading(true);
    joinRoom(activeConversationId);
    markRead(activeConversationId);

    chatService
      .getMessages(activeConversationId)
      .then((res) => {
        setMessages(res.data);
        setNextCursor(res.nextCursor);
        setHasMore(res.hasMore);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeConversationId, joinRoom, markRead, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMore = useCallback(async () => {
    if (!activeConversationId || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await chatService.getMessages(activeConversationId, nextCursor);
      prependMessages(res.data);
      setNextCursor(res.nextCursor);
      setHasMore(res.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }, [activeConversationId, nextCursor, loadingMore, prependMessages]);

  const handleSend = () => {
    if (!input.trim() || !activeConversationId) return;

    const messageData = {
      conversationId: activeConversationId,
      content: input.trim(),
      type: 'TEXT',
    };

    sendMessage(messageData);
    setInput('');
    if (activeConversationId) {
      emitStopTyping(activeConversationId);
      setIsLocalTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  // Handle typing debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (activeConversationId) {
      if (!isLocalTyping) {
        emitTyping(activeConversationId);
        setIsLocalTyping(true);
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping(activeConversationId);
        setIsLocalTyping(false);
      }, 3000);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const name = c.buyer?.username?.toLowerCase() || '';
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6">
      {/* Sidebar: Conversation List */}
      <Card className="w-80 flex flex-col overflow-hidden border-slate-200">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            Tin nhắn khách hàng
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm khách hàng..."
              className="pl-9 bg-slate-50 border-none h-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground opacity-50 h-full">
              <MessageSquare className="w-12 h-12 mb-2" />
              <p className="text-sm">Không có hội thoại nào</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = activeConversationId === conv.id;
              const unread = conv.unreadCountSeller;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-all border-b border-slate-50 text-left relative",
                    isActive && "bg-emerald-50/50 border-l-4 border-l-primary"
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 font-bold border border-slate-200">
                    {conv.buyer?.username?.charAt(0).toUpperCase() || <User className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-slate-900 truncate">
                        {conv.buyer?.username || 'Khách hàng'}
                      </span>
                      {conv.lastMessageAt && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(conv.lastMessageAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate italic">
                      {conv.lastMessage || 'Bắt đầu cuộc trò chuyện...'}
                    </p>
                  </div>
                  {unread > 0 && !isActive && (
                    <Badge className="absolute right-4 bottom-4 h-5 px-1.5 min-w-[20px] justify-center bg-destructive">
                      {unread}
                    </Badge>
                  )}
                </button>
              );
            })
          )}
        </div>
      </Card>

      {/* Main: Chat Window */}
      <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 relative bg-slate-50/20">
        {!activeConversationId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-60">
            <div className="size-24 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <MessageSquare className="size-12 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold">Chọn một cuộc trò chuyện</h3>
            <p className="text-sm mt-2">Phản hồi khách hàng nhanh hơn để tăng tỷ lệ chốt đơn!</p>
          </div>
        ) : (
          <>
            {/* Active Header */}
            <div className="p-4 border-b bg-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {conversations.find(c => c.id === activeConversationId)?.buyer?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    {conversations.find(c => c.id === activeConversationId)?.buyer?.username || 'Khách hàng'}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className={cn("w-2 h-2 rounded-full", isConnected ? "bg-green-500" : "bg-slate-300")} />
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                      {isConnected ? "Trực tuyến" : "Ngoại tuyến"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-slate-500">
                  Phân tích khách
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 scroll-smooth custom-scrollbar touch-pan-y overscroll-contain">
              {hasMore && (
                <div className="flex justify-center mb-4">
                  <Button variant="outline" size="sm" onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : "Xem thêm tin nhắn cũ"}
                  </Button>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[70%] p-4 rounded-2xl shadow-sm text-sm",
                        isMe ? "bg-primary text-primary-foreground rounded-br-none" : "bg-white border rounded-bl-none"
                      )}>
                        {/* Rich Product/Order Reference */}
                        {msg.type === 'PRODUCT_REF' && (
                          <div className="bg-black/5 rounded-lg overflow-hidden mb-2 border border-black/5">
                            {msg.product ? (
                              <div className="flex gap-2 p-2">
                                {msg.product.imageUrl && (
                                  <img
                                    src={msg.product.imageUrl.startsWith('http') ? msg.product.imageUrl : `/api/proxy${msg.product.imageUrl}`}
                                    alt=""
                                    className="w-12 h-12 object-cover rounded-md shrink-0 ring-1 ring-black/5"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-bold text-slate-800 truncate">
                                    {msg.product.name}
                                  </p>
                                  <p className="text-[10px] text-slate-600">
                                    {Number(msg.product.price).toLocaleString('vi-VN')}đ
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="px-2 py-1 text-[10px] opacity-70">
                                📦 Sản phẩm: {msg.referencedProductId}
                              </div>
                            )}
                          </div>
                        )}
                        {msg.type === 'ORDER_REF' && (
                          <div className="bg-black/5 rounded-lg p-2 mb-2 text-[11px] border border-black/5">
                            {msg.order ? (
                              <div className="space-y-1">
                                <p className="font-bold text-xs text-slate-800">🧾 Đơn hàng #{msg.order.orderCode}</p>
                                <div className="flex justify-between text-[10px] text-slate-600">
                                  <span>{Number(msg.order.totalAmount).toLocaleString('vi-VN')}đ</span>
                                  <span className="uppercase font-bold">{msg.order.status}</span>
                                </div>
                              </div>
                            ) : (
                              <span className="opacity-70">🧾 Đơn hàng: {msg.referencedOrderId}</span>
                            )}
                          </div>
                        )}
                        {msg.type === 'IMAGE' ? (
                          <img
                            src={msg.content.startsWith('http') ? msg.content : `/api/proxy${msg.content}`}
                            alt=""
                            className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(msg.content.startsWith('http') ? msg.content : `/api/proxy${msg.content}`, '_blank')}
                          />
                        ) : (
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        )}
                        <time className={cn("block text-[10px] mt-2 opacity-60 text-right font-medium", !isMe && "text-slate-400")}>
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </time>
                      </div>
                    </div>
                  );
                })
              )}
              {isTyping && typingConversationId === activeConversationId && (
                <div className="flex justify-start">
                  <div className="bg-white border p-3 rounded-2xl animate-pulse flex gap-1 items-center">
                    <span className="size-1 bg-slate-400 rounded-full" />
                    <span className="size-1 bg-slate-400 rounded-full" />
                    <span className="size-1 bg-slate-400 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t">
              <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-full border border-slate-100">
                <Input
                  className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 placeholder:text-slate-400"
                  placeholder="Viết phản hồi cho khách hàng..."
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                />
                <Button 
                  size="icon" 
                  className={cn("rounded-full shrink-0 shadow-lg transition-all", input.trim() ? "translate-x-0 opacity-100" : "translate-x-2 opacity-50")}
                  onClick={handleSend}
                  disabled={!input.trim()}
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
