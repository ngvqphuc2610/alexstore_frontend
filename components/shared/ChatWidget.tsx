'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Send, Loader2, ChevronDown, ArrowUp, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/stores/chatStore';
import { useChatContextStore } from '@/stores/chatContextStore';
import { useChatSocket } from '@/providers/ChatProvider';
import { useAuthStore } from '@/stores/authStore';
import { chatService, type Conversation, type ChatMessage } from '@/services/chat.service';
import { discountService } from '@/services/discount.service';
import { useQuery } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tag, Ticket } from 'lucide-react';

export function ChatWidget() {
  const { user } = useAuthStore();
  const {
    isChatOpen,
    closeChat,
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
  } = useChatStore();

  const { selectedReference, clearReference } = useChatContextStore();
  const { joinRoom, sendMessage, emitTyping, emitStopTyping, markRead, isConnected } =
    useChatSocket();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLocalTyping, setIsLocalTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch private vouchers if user is seller
  const { data: sellerVouchers = [] } = useQuery({
    queryKey: ['seller-vouchers', user?.id],
    queryFn: discountService.getShopVouchers,
    enabled: user?.role === 'SELLER',
  });

  // Load conversations
  useEffect(() => {
    if (isChatOpen) {
      chatService.getConversations().then(setConversations).catch(console.error);
    }
  }, [isChatOpen, setConversations]);

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

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load older messages (scroll up)
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

  // Handle send
  const handleSend = () => {
    if (!input.trim() || !activeConversationId) return;

    const messageData: any = {
      conversationId: activeConversationId,
      content: input.trim(),
      type: 'TEXT',
    };

    // Attach reference if available
    if (selectedReference) {
      if (selectedReference.type === 'product') {
        messageData.referencedProductId = selectedReference.data.id;
        messageData.type = 'PRODUCT_REF';
      } else if (selectedReference.type === 'order') {
        messageData.referencedOrderId = selectedReference.data.id;
        messageData.type = 'ORDER_REF';
      }
      clearReference();
    }

    sendMessage(messageData);
    setInput('');
    if (activeConversationId) {
      emitStopTyping(activeConversationId);
      setIsLocalTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  // Handle typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (activeConversationId) {
      // Only emit typing if we weren't already typing
      if (!isLocalTyping) {
        emitTyping(activeConversationId);
        setIsLocalTyping(true);
      }

      // Debounce stop_typing
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping(activeConversationId);
        setIsLocalTyping(false);
      }, 3000); // 3 seconds per user request
    }
  };

  // Get the other party's info
  const getOtherParty = (conv: Conversation) => {
    if (!user) return { name: 'Unknown', id: '' };
    if (conv.buyerId === user.id) {
      return { name: conv.seller?.shopName || conv.seller?.username || 'Shop', id: conv.sellerId };
    }
    return { name: conv.buyer?.username || 'Buyer', id: conv.buyerId };
  };

  if (!isChatOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[380px] h-[520px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground rounded-t-2xl">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold text-sm">
            {activeConversationId ? 'Đang chat' : 'Tin nhắn'}
          </span>
          {isConnected && (
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-primary-foreground hover:bg-primary/80"
          onClick={closeChat}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Body */}
      {!activeConversationId ? (
        // Conversation list
        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar overscroll-contain">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2">
              <MessageSquare className="w-10 h-10 opacity-30" />
              <p>Chưa có cuộc trò chuyện nào</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const other = getOtherParty(conv);
              const unread =
                user && conv.buyerId === user.id
                  ? conv.unreadCountBuyer
                  : conv.unreadCountSeller;

              return (
                <button
                  key={conv.id}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50"
                  onClick={() => setActiveConversation(conv.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {other.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">{other.name}</span>
                      {unread > 0 && (
                        <span className="bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                          {unread}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      ) : (
        // Active conversation
        <div className="flex-1 flex flex-col min-h-0 overscroll-contain">
          {/* Back button + header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setActiveConversation(null)}
            >
              <ChevronDown className="w-4 h-4 rotate-90" />
            </Button>
            <span className="text-sm font-medium">
              {conversations.find((c) => c.id === activeConversationId)
                ? getOtherParty(
                    conversations.find((c) => c.id === activeConversationId)!,
                  ).name
                : 'Chat'}
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0 scroll-smooth custom-scrollbar touch-pan-y overscroll-contain">
            {hasMore && (
              <div className="flex justify-center py-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="text-xs"
                >
                  {loadingMore ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <ArrowUp className="w-3 h-3 mr-1" />
                  )}
                  Tải tin nhắn cũ
                </Button>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                        isMe
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      }`}
                    >
                      {/* Product/Order reference card */}
                      {msg.type === 'PRODUCT_REF' && (
                        <div className="bg-background/20 rounded-lg overflow-hidden mb-2 border border-border/30">
                          {msg.product ? (
                            <div className="flex gap-2 p-2">
                              {msg.product.imageUrl && (
                                <img
                                  src={msg.product.imageUrl.startsWith('http') ? msg.product.imageUrl : `/api/proxy${msg.product.imageUrl}`}
                                  alt=""
                                  className="w-12 h-12 object-cover rounded-md shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-semibold truncate">
                                  {msg.product.name}
                                </p>
                                <p className="text-[10px] text-primary-foreground/80">
                                  {Number(msg.product.price).toLocaleString('vi-VN')}đ
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="px-2 py-1 text-[11px]">
                              📦 Sản phẩm: {msg.referencedProductId}
                            </div>
                          )}
                        </div>
                      )}
                      {msg.type === 'ORDER_REF' && (
                        <div className="bg-background/20 rounded-lg p-2 mb-2 text-[11px] border border-border/30">
                          {msg.order ? (
                            <div className="space-y-1">
                              <p className="font-semibold text-xs">🧾 Đơn hàng #{msg.order.orderCode}</p>
                              <div className="flex justify-between text-[10px]">
                                <span>{Number(msg.order.totalAmount).toLocaleString('vi-VN')}đ</span>
                                <span className="uppercase opacity-80">{msg.order.status}</span>
                              </div>
                            </div>
                          ) : (
                            <span>🧾 Đơn hàng: {msg.referencedOrderId}</span>
                          )}
                        </div>
                      )}
                      
                      {/* Text / Voucher render */}
                      {msg.content.startsWith('[VOUCHER]') ? (
                        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 p-2 rounded-lg cursor-copy" onClick={() => {
                          navigator.clipboard.writeText(msg.content.split('Mã: ')[1]?.split('\n')[0] || '');
                        }} title="Click để copy mã">
                          <div className="flex items-center gap-1.5 font-bold mb-1 border-b border-amber-200/50 pb-1">
                            <Ticket className="w-4 h-4"/> <span>Voucher Đặc Biệt</span>
                          </div>
                          <p className="whitespace-pre-wrap break-words text-sm mt-1">
                            {msg.content.replace('[VOUCHER]', '').trim()}
                          </p>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      )}
                      
                      <p
                        className={`text-[10px] mt-1 ${
                          isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}

            {isTyping && typingConversationId === activeConversationId && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-3 py-2 text-sm text-muted-foreground">
                  <span className="animate-pulse">Đang gõ...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reference preview */}
          {selectedReference && (
            <div className="mx-3 mb-2 p-2 bg-muted/80 backdrop-blur-sm border border-border/50 rounded-xl flex items-center gap-3 text-xs shadow-sm ring-1 ring-black/5">
              {selectedReference.type === 'product' && (selectedReference.data as any).imageUrl && (
                <img
                  src={(selectedReference.data as any).imageUrl.startsWith('http') ? (selectedReference.data as any).imageUrl : `/api/proxy${(selectedReference.data as any).imageUrl}`}
                  alt=""
                  className="w-10 h-10 object-cover rounded-lg shrink-0 border border-border/20"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[11px] truncate">
                  {selectedReference.type === 'product'
                    ? (selectedReference.data as any).name
                    : `🧾 Đơn hàng #${(selectedReference.data as any).orderCode}`}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {selectedReference.type === 'product'
                    ? `${Number((selectedReference.data as any).price).toLocaleString('vi-VN')}đ`
                    : `Số tiền: ${Number((selectedReference.data as any).totalAmount).toLocaleString('vi-VN')}đ`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 shrink-0"
                onClick={clearReference}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-2 border-t border-border/50 bg-background/95">
            {user?.role === 'SELLER' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40">
                    <Tag className="w-5 h-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" className="w-64 p-2" sideOffset={10}>
                  <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                    <p className="text-xs font-semibold mb-1 text-muted-foreground px-1">Gửi voucher cho khách</p>
                    {sellerVouchers.length === 0 ? (
                      <p className="text-xs px-1 text-muted-foreground">Chưa có mã giảm giá nào.</p>
                    ) : (
                      sellerVouchers.map((v: any) => (
                        <button
                          key={v.id}
                          className="flex flex-col text-left px-2 py-1.5 hover:bg-muted rounded text-sm transition-colors border border-transparent hover:border-border"
                          onClick={() => {
                            const valStr = v.type === 'PERCENTAGE' ? `${v.value}%` : `${Number(v.value).toLocaleString('vi-VN')}đ`;
                            setInput(`[VOUCHER]\n🎉 Tặng bạn mã giảm giá: ${valStr}\nMã: ${v.code}\nÁp dụng cho đơn từ ${Number(v.minOrderValue).toLocaleString('vi-VN')}đ`);
                          }}
                        >
                          <span className="font-bold text-amber-700 dark:text-amber-400">{v.code}</span>
                          <span className="text-xs opacity-80 truncate">{v.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
            
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-muted rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button
              size="icon"
              className="h-9 w-9 rounded-full shrink-0"
              onClick={handleSend}
              disabled={!input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
