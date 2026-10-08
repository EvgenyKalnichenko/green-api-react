import { useMutation } from '@tanstack/react-query'
import { useChatStore } from '@/entities/chat'
import { useSessionStore } from '@/entities/session'
import { sendMessage } from '@/shared/api/green-api'

export function useSendMessage() {
  const credentials = useSessionStore((state) => state.credentials)
  const activeChatId = useChatStore((state) => state.activeChatId)
  const addOutgoingMessage = useChatStore((state) => state.addOutgoingMessage)

  return useMutation({
    mutationFn: async (text: string) => {
      if (!credentials) throw new Error('Нет авторизации')
      if (!activeChatId) throw new Error('Чат не выбран')

      const trimmed = text.trim()
      if (!trimmed) throw new Error('Пустое сообщение')

      const result = await sendMessage(credentials, activeChatId, trimmed)
      return {
        id: result.idMessage,
        chatId: activeChatId,
        text: trimmed,
        timestamp: Date.now(),
        outgoing: true as const,
      }
    },
    onSuccess: (message) => {
      addOutgoingMessage(message)
    },
  })
}
