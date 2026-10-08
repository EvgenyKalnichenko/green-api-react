import { useState, type FormEvent } from 'react'
import { Button, Input } from '@/shared/ui'
import { useCreateChat } from '../model/useCreateChat'

export function CreateChatForm() {
  const [phone, setPhone] = useState('')
  const createChat = useCreateChat()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    createChat.mutate(phone, {
      onSuccess: () => setPhone(''),
    })
  }

  return (
    <form className="new-chat" onSubmit={handleSubmit}>
      <div className="new-chat-row">
        <Input
          className="ui-field--inline"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Номер получателя"
        />
        <Button type="submit" loading={createChat.isPending}>
          {createChat.isPending ? '…' : 'Чат'}
        </Button>
      </div>
      {createChat.error ? <p className="error">{createChat.error.message}</p> : null}
    </form>
  )
}
