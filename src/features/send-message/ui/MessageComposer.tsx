import { useState, type FormEvent } from 'react'
import { Button, Input } from '@/shared/ui'
import { useSendMessage } from '../model/useSendMessage'

export function MessageComposer() {
  const [draft, setDraft] = useState('')
  const send = useSendMessage()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return

    setDraft('')
    send.mutate(text, {
      onError: () => setDraft(text),
    })
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      {send.error ? <p className="error composer-error">{send.error.message}</p> : null}
      <Input
        className="ui-field--inline"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Сообщение"
        maxLength={4000}
      />
      <Button type="submit" loading={send.isPending} disabled={!draft.trim()}>
        Отправить
      </Button>
    </form>
  )
}
