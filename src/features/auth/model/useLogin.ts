import { useMutation } from '@tanstack/react-query'
import { useChatStore } from '@/entities/chat'
import { useSessionStore, type Credentials } from '@/entities/session'
import { defaultApiUrl, getStateInstance, setSettings } from '@/shared/api/green-api'

type LoginInput = {
  idInstance: string
  apiTokenInstance: string
}

export function useLogin() {
  const setCredentials = useSessionStore((state) => state.setCredentials)
  const resetChats = useChatStore((state) => state.reset)

  return useMutation({
    mutationFn: async ({ idInstance, apiTokenInstance }: LoginInput) => {
      const creds: Credentials = {
        apiUrl: defaultApiUrl(idInstance.trim()),
        idInstance: idInstance.trim(),
        apiTokenInstance: apiTokenInstance.trim(),
      }

      const state = await getStateInstance(creds)
      if (state.stateInstance !== 'authorized') {
        throw new Error(
          `Инстанс в статусе ${state.stateInstance || 'unknown'}. Авторизуйте его в GREEN-API.`,
        )
      }

      await setSettings(creds)
      return creds
    },
    onSuccess: (creds) => {
      resetChats()
      setCredentials(creds)
    },
  })
}
