import { lazy, Suspense } from 'react'
import { useSessionStore } from '@/entities/session'
import { LoginPage } from '@/pages/login'

const ChatPage = lazy(() =>
  import('@/pages/chat').then((m) => ({ default: m.ChatPage })),
)

export function App() {
  const credentials = useSessionStore((state) => state.credentials)

  if (!credentials) {
    return <LoginPage />
  }

  return (
    <Suspense fallback={<div className="empty">Загрузка…</div>}>
      <ChatPage />
    </Suspense>
  )
}
