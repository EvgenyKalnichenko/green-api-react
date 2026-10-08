import { useEffect, useRef } from 'react'
import { useChatStore } from '@/entities/chat'
import { MessageComposer } from '@/features/send-message'
import { formatPhone } from '@/shared/lib/phone'
import { Button } from '@/shared/ui'

export function ChatWindow() {
  const chats = useChatStore((state) => state.chats)
  const messagesByChatId = useChatStore((state) => state.messagesByChatId)
  const activeChatId = useChatStore((state) => state.activeChatId)
  const setSidebarOpen = useChatStore((state) => state.setSidebarOpen)
  const bottomRef = useRef<HTMLDivElement>(null)

  const activeChat = chats.find((chat) => chat.chatId === activeChatId)
  const visibleMessages = activeChatId ? messagesByChatId[activeChatId] || [] : []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [visibleMessages.length, activeChatId])

  if (!activeChat) {
    return (
      <section className="main">
        <div className="chat-header chat-header--empty">
          <Button variant="ghost" type="button" className="menu-btn" onClick={() => setSidebarOpen(true)}>
            Чаты
          </Button>
        </div>
        <div className="empty">Создайте чат по номеру телефона</div>
      </section>
    )
  }

  return (
    <section className="main">
      <div className="chat-header">
        <Button variant="ghost" type="button" className="menu-btn" onClick={() => setSidebarOpen(true)}>
          Чаты
        </Button>
        <div className="chat-header__info">
          <strong>{activeChat.name}</strong>
          <span>{formatPhone(activeChat.phone)}</span>
        </div>
      </div>
      <div className="messages">
        {visibleMessages.map((message) => (
          <div
            key={message.id}
            className={`bubble ${message.outgoing ? 'outgoing' : 'incoming'}`}
          >
            {message.text}
            <time>
              {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <MessageComposer />
    </section>
  )
}
