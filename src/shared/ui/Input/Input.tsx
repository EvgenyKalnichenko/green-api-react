import type { InputHTMLAttributes } from 'react'
import './Input.css'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...rest }: Props) {
  const inputId = id || rest.name

  return (
    <label className={`ui-field ${className}`.trim()}>
      {label ? <span className="ui-field__label">{label}</span> : null}
      <input id={inputId} className="ui-input" {...rest} />
      {error ? <span className="ui-field__error">{error}</span> : null}
    </label>
  )
}
