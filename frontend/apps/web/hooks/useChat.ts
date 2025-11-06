/**
 * React hook for managing chat
 */

import { useState, useEffect, useCallback } from 'react';
import { ChatApi, type Chat, type Message, type SendMessageInput, type CreateChatInput, type ChatQueryParams, type MessagesQueryParams } from '@/lib/api/chat';
import { useSocket } from './useSocket';
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
  refreshChats: () => Promise<void>;
  socketConnected: boolean;
}

export function useChat(params?: ChatQueryParams): UseChatReturn {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Socket.IO integration
  const { socket, connected: socketConnected } = useSocket({
    autoConnect: true,
    listeners: {
      newMessage: (data) => {
        // Add new message if it's for the current chat
        if (currentChat && data.chatId === currentChat.id) {
          setMessages((prev) => {
            // Check if message already exists
            if (prev.some((m) => m.id === data.id)) {
              return prev;
            }
            return [...prev, data as any];
          });
        }
        // Update chat list to show new message
        // Note: refreshChats would need to be implemented if needed
      },
      messagesRead: (data) => {
        // Update read status for messages
        if (currentChat && data.chatId === currentChat.id) {
          setMessages((prev) =>
            prev.map((msg) =>
              data.messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
            )
          );
        }
      },
    },
  });

  const fetchChats = useCallback(async () => {
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
  }, [params]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Join chat room when chat is selected
  useEffect(() => {
    if (currentChat && socket?.connected) {
      socket.emit('joinChat', currentChat.id);
      return () => {
        socket.emit('leaveChat', currentChat.id);
      };
    }
  }, [currentChat, socket]);

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
      
      // Add message to local state immediately for instant feedback
      if (currentChat && data.chatId === currentChat.id) {
        setMessages((prev) => [...prev, message]);
      }
      
      // Refresh chats to update last message
      await fetchChats();
      
      return message;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to send message';
      throw new Error(errorMessage);
    }
  }, [currentChat, fetchChats]);

  const loadMessages = useCallback(async (chatId: string, messageParams?: MessagesQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ChatApi.getMessages(chatId, messageParams);
      setMessages(response.messages);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to load messages';
      setError(errorMessage);
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectChat = useCallback((chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setCurrentChat(chat);
      loadMessages(chatId);
    }
  }, [chats, loadMessages]);

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
    refreshChats: fetchChats,
    socketConnected,
  };
}

