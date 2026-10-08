import type { AxiosRequestConfig } from 'axios'
import { api } from './axios'
import type { GreenApiCredentials } from './types'

export type NotificationBody = {
  typeWebhook?: string
  timestamp?: number
  idMessage?: string
  senderData?: {
    chatId?: string
    chatName?: string
    sender?: string
    senderName?: string
    senderPhoneNumber?: number | string
  }
  messageData?: {
    typeMessage?: string
    textMessageData?: { textMessage?: string }
    extendedTextMessageData?: { text?: string }
  }
}

export type IncomingNotification = {
  receiptId: number
  body: NotificationBody
}

const RECEIVE_TIMEOUT_MS = 40_000

function apiOrigin(creds: GreenApiCredentials) {
  return creds.apiUrl.replace(/\/$/, '')
}

function instancePath(creds: GreenApiCredentials, method: string, extra = '') {
  return `/waInstance${creds.idInstance}/${method}/${creds.apiTokenInstance}${extra}`
}

function requestConfig(
  creds: GreenApiCredentials,
  method: string,
  extra = '',
  config: AxiosRequestConfig = {},
): AxiosRequestConfig {
  const path = instancePath(creds, method, extra)
  // Всегда через same-origin proxy — иначе в браузере CORS
  const url = `/green-api${path}`
  const headers: Record<string, string> = {
    ...(config.headers as Record<string, string> | undefined),
    'X-Green-Api-Host': apiOrigin(creds),
  }

  return {
    ...config,
    url,
    headers,
  }
}

export function defaultApiUrl(idInstance: string) {
  const cluster = idInstance.replace(/\D/g, '').slice(0, 4)
  if (cluster.length === 4) {
    return `https://${cluster}.api.green-api.com`
  }
  return 'https://api.green-api.com'
}

export async function getStateInstance(creds: GreenApiCredentials) {
  const { data } = await api.request<{ stateInstance?: string }>(
    requestConfig(creds, 'getStateInstance', '', { method: 'GET' }),
  )
  return data
}

export async function setSettings(creds: GreenApiCredentials) {
  await api.request(
    requestConfig(creds, 'setSettings', '', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: {
        webhookUrl: '',
        incomingWebhook: 'yes',
        outgoingWebhook: 'yes',
        outgoingAPIMessageWebhook: 'no',
      },
    }),
  )
}

export async function checkAccount(creds: GreenApiCredentials, phoneNumber: number) {
  const { data } = await api.request<{
    exist: boolean
    chatId: string
    status?: boolean
    reason?: string
  }>(
    requestConfig(creds, 'checkAccount', '', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: { phoneNumber },
    }),
  )

  if (data?.status === false) {
    throw new Error(data.reason || 'Инстанс не авторизован')
  }

  return data
}

export async function sendMessage(creds: GreenApiCredentials, chatId: string, message: string) {
  const { data } = await api.request<{ idMessage: string }>(
    requestConfig(creds, 'sendMessage', '', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: { chatId, message },
    }),
  )
  return data
}

export async function receiveNotification(
  creds: GreenApiCredentials,
  signal?: AbortSignal,
): Promise<IncomingNotification | null> {
  const { data, status } = await api.request<IncomingNotification | null>(
    requestConfig(creds, 'receiveNotification', '', {
      method: 'GET',
      params: { receiveTimeout: 20 },
      timeout: RECEIVE_TIMEOUT_MS,
      signal,
      validateStatus: (code) => (code >= 200 && code < 300) || code === 204,
    }),
  )

  if (status === 204 || !data?.receiptId) return null
  return data
}

export async function deleteNotification(creds: GreenApiCredentials, receiptId: number) {
  await api.request(
    requestConfig(creds, 'deleteNotification', `/${receiptId}`, {
      method: 'DELETE',
    }),
  )
}

export function extractText(body: NotificationBody) {
  return (
    body.messageData?.textMessageData?.textMessage ||
    body.messageData?.extendedTextMessageData?.text ||
    ''
  )
}

export function isIncomingMessage(typeWebhook?: string) {
  return typeWebhook === 'incomingMessageReceived'
}
