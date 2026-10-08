export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('8')) {
    return `7${digits.slice(1)}`
  }
  return digits
}

export function formatPhone(value: string) {
  const digits = normalizePhone(value)
  if (digits.startsWith('7') && digits.length === 11) {
    return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`
  }
  if (digits.startsWith('375') && digits.length === 12) {
    return `+${digits}`
  }
  return digits ? `+${digits}` : ''
}
