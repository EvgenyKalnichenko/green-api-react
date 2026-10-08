import { useChatStore } from '@/entities/chat'
import { useSessionStore } from '@/entities/session'
import { CreateChatForm } from '@/features/create-chat'
import { formatPhone } from '@/shared/lib/phone'
import { Button } from '@/shared/ui'

export function ChatSidebar() {
  const logout = useSessionStore((state) => state.logout)
  const resetChats = useChatStore((state) => state.reset)
  const chats = useChatStore((state) => state.chats)
  const activeChatId = useChatStore((state) => state.activeChatId)
  const sidebarOpen = useChatStore((state) => state.sidebarOpen)
  const setActiveChatId = useChatStore((state) => state.setActiveChatId)
  const setSidebarOpen = useChatStore((state) => state.setSidebarOpen)

  function handleLogout() {
    resetChats()
    logout()
  }

  return (
    <aside className={`sidebar${sidebarOpen ? ' visible' : ''}`}>
      <div className="sidebar-header">
        <h2>Чаты</h2>
        <div className="sidebar-actions">
          <Button
            variant="ghost"
            type="button"
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            Закрыть
          </Button>
          <Button variant="ghost" type="button" onClick={handleLogout}>
            Выйти
          </Button>
        </div>
      </div>
      <CreateChatForm />
      <div className="chat-list">
        {chats.map((chat) => (
          <button
            key={chat.chatId}
            className={`chat-item${chat.chatId === activeChatId ? ' active' : ''}`}
            type="button"
            onClick={() => setActiveChatId(chat.chatId)}
          >
            <strong>{chat.name}</strong>
            <span>{formatPhone(chat.phone) || chat.chatId}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
