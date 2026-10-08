import { useMutation } from '@tanstack/react-query'
import { useChatStore } from '@/entities/chat'
import { useSessionStore } from '@/entities/session'
import { checkAccount } from '@/shared/api/green-api'
import { formatPhone, normalizePhone } from '@/shared/lib/phone'

export function useCreateChat() {
  const credentials = useSessionStore((state) => state.credentials)
  const addChat = useChatStore((state) => state.addChat)

  return useMutation({
    mutationFn: async (phone: string) => {
      if (!credentials) throw new Error('Нет авторизации')

      const digits = normalizePhone(phone)
      if (digits.length < 11) {
        throw new Error('Введите номер в международном формате, например 79991234567')
      }

      const result = await checkAccount(credentials, Number(digits))
      if (!result.exist || !result.chatId) {
        throw new Error('Аккаунт MAX на этом номере не найден')
      }

      return {
        chatId: result.chatId,
        phone: digits,
        name: formatPhone(digits),
      }
    },
    onSuccess: (chat) => {
      addChat(chat)
    },
  })
}
