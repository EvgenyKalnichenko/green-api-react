import { create } from 'zustand'
import type { Message } from '@/entities/message'
import type { Chat } from './types'

type ChatState = {
  chats: Chat[]
  messagesByChatId: Record<string, Message[]>
  activeChatId: string
  sidebarOpen: boolean
  addChat: (chat: Chat) => void
  setActiveChatId: (chatId: string) => void
  setSidebarOpen: (open: boolean) => void
  addOutgoingMessage: (message: Message) => void
  addIncomingMessage: (message: Message, chat?: Chat) => void
  reset: () => void
}

function appendUnique(messages: Message[], message: Message) {
  if (messages.some((item) => item.id === message.id)) return messages
  return [...messages, message]
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  messagesByChatId: {},
  activeChatId: '',
  sidebarOpen: false,

  addChat: (chat) =>
    set((state) => ({
      chats: state.chats.some((item) => item.chatId === chat.chatId)
        ? state.chats
        : [chat, ...state.chats],
      activeChatId: chat.chatId,
      sidebarOpen: false,
    })),

  setActiveChatId: (chatId) => set({ activeChatId: chatId, sidebarOpen: false }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  addOutgoingMessage: (message) =>
    set((state) => ({
      messagesByChatId: {
        ...state.messagesByChatId,
        [message.chatId]: appendUnique(state.messagesByChatId[message.chatId] || [], message),
      },
    })),

  addIncomingMessage: (message, chat) =>
    set((state) => {
      const chats =
        chat && !state.chats.some((item) => item.chatId === chat.chatId)
          ? [...state.chats, chat]
          : state.chats

      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [message.chatId]: appendUnique(state.messagesByChatId[message.chatId] || [], message),
        },
        chats,
        activeChatId: state.activeChatId || message.chatId,
      }
    }),

  reset: () =>
    set({
      chats: [],
      messagesByChatId: {},
      activeChatId: '',
      sidebarOpen: false,
    }),
}))
