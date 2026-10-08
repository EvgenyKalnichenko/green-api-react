import { create } from 'zustand'
import type { Credentials } from './types'

type SessionState = {
  credentials: Credentials | null
  setCredentials: (credentials: Credentials) => void
  logout: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  credentials: null,
  setCredentials: (credentials) => set({ credentials }),
  logout: () => set({ credentials: null }),
}))
