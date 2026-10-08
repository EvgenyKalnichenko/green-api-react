import { useNotificationPolling } from '@/features/receive-messages'
import { ChatSidebar } from '@/widgets/chat-sidebar'
import { ChatWindow } from '@/widgets/chat-window'

export function ChatPage() {
  useNotificationPolling()

  return (
    <div className="app">
      <ChatSidebar />
      <ChatWindow />
    </div>
  )
}
