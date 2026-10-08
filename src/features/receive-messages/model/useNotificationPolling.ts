import { useEffect } from 'react'
import { useChatStore } from '@/entities/chat'
import { useSessionStore, type Credentials } from '@/entities/session'
import {
  deleteNotification,
  extractText,
  isIncomingMessage,
  receiveNotification,
} from '@/shared/api/green-api'
import { formatPhone } from '@/shared/lib/phone'

async function deleteWithRetry(creds: Credentials, receiptId: number, signal: AbortSignal) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (signal.aborted) return
    try {
      await deleteNotification(creds, receiptId)
      return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
    }
  }
}

export function useNotificationPolling() {
  const credentials = useSessionStore((state) => state.credentials)
  const addIncomingMessage = useChatStore((state) => state.addIncomingMessage)

  useEffect(() => {
    if (!credentials) return

    const controller = new AbortController()

    async function poll() {
      while (!controller.signal.aborted) {
        try {
          const notification = await receiveNotification(credentials!, controller.signal)
          if (!notification || controller.signal.aborted) continue

          const { body, receiptId } = notification
          if (isIncomingMessage(body.typeWebhook)) {
            const chatId = body.senderData?.chatId || ''
            const text = extractText(body)

            if (chatId && text) {
              const rawPhone = String(body.senderData?.senderPhoneNumber || '')
              addIncomingMessage(
                {
                  id: body.idMessage || `${receiptId}`,
                  chatId,
                  text,
                  timestamp: (body.timestamp || Date.now() / 1000) * 1000,
                  outgoing: false,
                },
                {
                  chatId,
                  phone: rawPhone,
                  name:
                    body.senderData?.senderName ||
                    body.senderData?.chatName ||
                    formatPhone(rawPhone) ||
                    chatId,
                },
              )
            }
          }

          await deleteWithRetry(credentials!, receiptId, controller.signal)
        } catch (err) {
          if (controller.signal.aborted) return
          if (err instanceof Error && err.name === 'CanceledError') return
          if (err instanceof DOMException && err.name === 'AbortError') return
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }
    }

    void poll()
    return () => controller.abort()
  }, [credentials, addIncomingMessage])
}
