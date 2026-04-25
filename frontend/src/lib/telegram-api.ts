import { apiJson } from './api'

export type TelegramLinkCodeResponse = {
  code: string
  expires_at: string
}

export async function generateTelegramLinkCode(): Promise<TelegramLinkCodeResponse> {
  return apiJson<TelegramLinkCodeResponse>('/api/v1/telegram/link-code', {
    method: 'POST',
  })
}
