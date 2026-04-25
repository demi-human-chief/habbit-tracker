import { apiJson } from './api'

export async function sendCoachMessage(message: string): Promise<string> {
  const res = await apiJson<{ answer: string }>('/api/v1/ai/coach', {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
  return res.answer
}
