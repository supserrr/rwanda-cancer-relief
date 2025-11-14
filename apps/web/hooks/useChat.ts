/**
 * React hook for managing chat
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChatApi, type Chat, type Message, type SendMessageInput, type CreateChatInput, type ChatQueryParams, type MessagesQueryParams } from '@/lib/api/chat';
import { useChatMessages } from './useRealtime';
import { ApiError } from '@/lib/api/client';

export interface UseChatReturn {
  chats: Chat[];
  messages: Message[];
  currentChat: Chat | null;
  loading: boolean;
  error: string | null;
  total: number;
  createChat: (data: CreateChatInput) => Promise<Chat>;
  sendMessage: (data: SendMessageInput) => Promise<Message>;
  loadMessages: (chatId: string, params?: MessagesQueryParams) => Promise<void>;
  selectChat: (chatId: string) => void;
  deleteChat: (chatId: string) => Promise<void>;
  reactToMessage: (messageId: string, emoji: string) => Promise<Message>;
  editMessage: (messageId: string, content: string) => Promise<Message>;
  deleteMessage: (messageId: string) => Promise<void>;
  refreshChats: () => Promise<void>;
  realtimeConnected: boolean;
}

interface UseChatOptions {
  enabled?: boolean;
}

export function useChat(
  params?: ChatQueryParams,
  options?: UseChatOptions
): UseChatReturn {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const isEnabled = options?.enabled ?? true;
  const [loading, setLoading] = useState(isEnabled);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Helper function to deduplicate and sort messages by createdAt (ascending - oldest first)
  const deduplicateAndSortMessages = useCallback((msgs: Message[]): Message[] => {
    // Use Map to deduplicate by ID (keeps last occurrence, but we'll sort anyway)
    const messageMap = new Map<string, Message>();
    for (const msg of msgs) {
      messageMap.set(msg.id, msg);
    }
    // Convert back to array and sort
    return Array.from(messageMap.values()).sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB; // Ascending order (oldest first)
    });
  }, []);

  // Supabase Realtime integration for messages
  useChatMessages(
    isEnabled ? currentChat?.id || null : null,
    (message) => {
        // Add or update message if it's for the current chat
      if (currentChat && message.chat_id === currentChat.id) {
          setMessages((prev) => {
            // Check if this is an update to an existing message (reaction, edit, delete)
            const existingIndex = prev.findIndex((m) => m.id === message.id);
            
            if (existingIndex !== -1) {
              // Update existing message
              const updated = [...prev];
              const existingMessage = updated[existingIndex];
              if (existingMessage) {
                updated[existingIndex] = {
                  ...existingMessage,
                  content: message.content,
                  reactions: message.reactions || existingMessage.reactions,
                  replyToId: message.reply_to_id || existingMessage.replyToId,
                  editedAt: message.edited_at || existingMessage.editedAt,
                  deletedAt: message.deleted_at || existingMessage.deletedAt,
                  isRead: message.is_read,
                };
                return deduplicateAndSortMessages(updated);
              }
            }
            
            // Transform Realtime message to Message type (new message)
            const transformedMessage: Message = {
              id: message.id,
              chatId: message.chat_id,
              senderId: message.sender_id,
              content: message.content,
              type: message.type as any,
              fileUrl: message.file_url,
              isRead: message.is_read,
              createdAt: message.created_at,
              updatedAt: message.created_at,
              reactions: message.reactions,
              replyToId: message.reply_to_id,
              editedAt: message.edited_at,
              deletedAt: message.deleted_at,
            };
            // Add message, deduplicate, and sort to maintain chronological order
            return deduplicateAndSortMessages([...prev, transformedMessage]);
          });
        // Refresh chats to update last message
        if (isEnabled) {
        fetchChats();
        }
      }
    },
    (error) => {
      console.error('Realtime subscription error:', error);
      setRealtimeConnected(false);
    }
  );

  // Set connected state (Realtime is connected when subscribed)
  useEffect(() => {
    if (isEnabled && currentChat) {
      setRealtimeConnected(true);
    } else {
      setRealtimeConnected(false);
    }
  }, [currentChat, isEnabled]);

  const fetchChats = useCallback(async () => {
    if (!isEnabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await ChatApi.listChats(params);
      setChats(response.chats);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to load chats';
      setError(errorMessage);
      console.error('Error fetching chats:', err);
    } finally {
      setLoading(false);
    }
  }, [params, isEnabled]);

  useEffect(() => {
    if (isEnabled) {
    fetchChats();
    } else {
      setLoading(false);
    }
  }, [fetchChats, isEnabled]);

  // Realtime subscription is handled by useChatMessages hook
  // No need to manually join/leave rooms

  const createChat = useCallback(async (data: CreateChatInput): Promise<Chat> => {
    try {
      const chat = await ChatApi.createChat(data);
      await fetchChats(); // Refresh list
      return chat;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to create chat';
      throw new Error(errorMessage);
    }
  }, [fetchChats]);

  const sendMessage = useCallback(async (data: SendMessageInput): Promise<Message> => {
    try {
      const message = await ChatApi.sendMessage(data);
      
      // Don't add message here - let realtime subscription handle it
      // This prevents duplicates from race conditions between sendMessage and realtime
      // Realtime will add it almost instantly anyway
      
      // Refresh chats to update last message
      await fetchChats();
      
      return message;
    } catch (err) {
      console.error('[useChat.sendMessage] Error sending message:', {
        error: err,
        errorMessage: err instanceof Error ? err.message : String(err),
        chatId: data.chatId,
        content: data.content,
      });
      const errorMessage = err instanceof Error ? err.message : err instanceof ApiError ? err.message : 'Failed to send message';
      throw new Error(errorMessage);
    }
  }, [fetchChats]);

  const loadMessages = useCallback(async (chatId: string, messageParams?: MessagesQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ChatApi.getMessages(chatId, messageParams);
      // Merge with existing messages and deduplicate
      // This ensures we don't lose messages that came via realtime
      setMessages((prev) => {
        // Combine existing messages with newly loaded ones
        const allMessages = [...prev, ...response.messages];
        // Deduplicate and sort
        return deduplicateAndSortMessages(allMessages);
      });
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to load messages';
      setError(errorMessage);
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }, [deduplicateAndSortMessages]);

  const selectChat = useCallback((chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setCurrentChat(chat);
      loadMessages(chatId);
    }
  }, [chats, loadMessages]);

  const deleteChat = useCallback(async (chatId: string): Promise<void> => {
    try {
      await ChatApi.deleteChat(chatId);
      
      // Remove chat from local state
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      
      // Clear messages if it was the current chat
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        setMessages([]);
      }
      
      // Refresh chat list to ensure consistency
      await fetchChats();
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Failed to delete chat';
      throw new Error(errorMessage);
    }
  }, [currentChat, fetchChats]);

  const reactToMessage = useCallback(async (messageId: string, emoji: string): Promise<Message> => {
    try {
      const updatedMessage = await ChatApi.reactToMessage(messageId, emoji);
      
      // Update message in local state
      setMessages((prev) => {
        const index = prev.findIndex((m) => m.id === messageId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = updatedMessage;
          return deduplicateAndSortMessages(updated);
        }
        return prev;
      });
      
      return updatedMessage;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Failed to react to message';
      throw new Error(errorMessage);
    }
  }, [deduplicateAndSortMessages]);

  const editMessage = useCallback(async (messageId: string, content: string): Promise<Message> => {
    try {
      const updatedMessage = await ChatApi.editMessage(messageId, content);
      
      // Update message in local state
      setMessages((prev) => {
        const index = prev.findIndex((m) => m.id === messageId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = updatedMessage;
          return deduplicateAndSortMessages(updated);
        }
        return prev;
      });
      
      // Refresh chats to update last message if needed
      await fetchChats();
      
      return updatedMessage;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Failed to edit message';
      throw new Error(errorMessage);
    }
  }, [deduplicateAndSortMessages, fetchChats]);

  const deleteMessage = useCallback(async (messageId: string): Promise<void> => {
    try {
      await ChatApi.deleteMessage(messageId);
      
      // Update message in local state (soft delete - mark as deleted)
      setMessages((prev) => {
        const index = prev.findIndex((m) => m.id === messageId);
        if (index !== -1) {
          const updated = [...prev];
          const message = updated[index];
          updated[index] = {
            ...message,
            deletedAt: new Date().toISOString(),
            content: 'This message was deleted',
          } as Message;
          return deduplicateAndSortMessages(updated);
        }
        return prev;
      });
      
      // Refresh chats to update last message if needed
      await fetchChats();
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Failed to delete message';
      throw new Error(errorMessage);
    }
  }, [deduplicateAndSortMessages, fetchChats]);

  return {
    chats,
    messages,
    currentChat,
    loading,
    error,
    total,
    createChat,
    sendMessage,
    loadMessages,
    selectChat,
    deleteChat,
    reactToMessage,
    editMessage,
    deleteMessage,
    refreshChats: fetchChats,
    realtimeConnected,
  };
}

