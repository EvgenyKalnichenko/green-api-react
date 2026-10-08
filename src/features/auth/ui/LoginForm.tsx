import { useState, type FormEvent } from 'react'
import { Button, Input } from '@/shared/ui'
import { useLogin } from '../model/useLogin'

export function LoginForm() {
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const login = useLogin()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    login.mutate({ idInstance, apiTokenInstance })
  }

  return (
    <form className="login-card" onSubmit={handleSubmit}>
      <div className="logo" aria-hidden>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3c5 0 9 3.6 9 8s-4 8-9 8c-1.1 0-2.1-.2-3-.5L4 20l1.2-3.4C4.5 15.3 3 13.3 3 11c0-4.4 4-8 9-8Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <h1>Веб-версия MAX</h1>
      <p>Введите данные инстанса GREEN-API</p>
      <Input
        label="idInstance"
        value={idInstance}
        onChange={(e) => setIdInstance(e.target.value)}
        autoComplete="off"
        required
      />
      <Input
        label="apiTokenInstance"
        value={apiTokenInstance}
        onChange={(e) => setApiTokenInstance(e.target.value)}
        autoComplete="off"
        required
      />
      {login.error ? <p className="error">{login.error.message}</p> : null}
      <Button type="submit" fullWidth loading={login.isPending}>
        {login.isPending ? 'Вход…' : 'Войти'}
      </Button>
    </form>
  )
}
