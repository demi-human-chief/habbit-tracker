import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '../components/dashboard/BottomNav'
import type { BottomTab } from '../components/dashboard/types'
import { ApiError } from '../lib/api'
import { sendCoachMessage } from '../lib/coach-api'

type ChatMsg = {
  role: 'user' | 'assistant'
  text: string
}

export function AICoachPage() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      text:
        'Привет! Я локальный AI Coach. Расскажи, с какой привычкой сложнее всего, и я предложу план на сегодня.',
    },
  ])

  const onTab = (tab: BottomTab) => {
    if (tab === 'today') navigate('/app')
    else if (tab === 'coach') navigate('/app/ai')
    else navigate('/app')
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const message = input.trim()
    if (!message || loading) return
    setError(null)
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: message }])
    setLoading(true)
    try {
      const answer = await sendCoachMessage(message)
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось получить ответ коуча')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh overflow-x-hidden bg-[#050506] font-sans text-zinc-100 antialiased selection:bg-emerald-500/30 [background-image:radial-gradient(120%_80%_at_10%_0%,rgba(255,60,100,0.12)_0%,transparent_50%),radial-gradient(100%_60%_at_100%_20%,rgba(30,160,255,0.1)_0%,transparent_45%),radial-gradient(90%_50%_at_50%_100%,rgba(50,210,120,0.08)_0%,transparent_50%)]">
      <div className="mx-auto flex w-full max-w-[430px] flex-col px-3 pt-2 sm:px-4 md:max-w-3xl md:px-6 lg:max-w-5xl lg:flex-row lg:items-start lg:gap-6 lg:px-8 lg:pt-6">
        <BottomNav
          active="coach"
          onChange={onTab}
          variant="rail"
        />
        <main className="flex min-w-0 flex-1 flex-col gap-4 pb-28 sm:pb-24 lg:pb-8">
          <header className="rounded-[22px] border border-white/10 bg-zinc-900/70 p-5 shadow-xl shadow-black/30 backdrop-blur-xl">
            <h1 className="m-0 text-xl font-semibold tracking-tight text-zinc-100">AI Coach</h1>
            <p className="mb-0 mt-2 text-sm leading-relaxed text-zinc-400">
              Локальный Qwen через Ollama. Советы основаны на ваших привычках и выполнениях за
              последние 14 дней.
            </p>
          </header>

          <section className="rounded-[22px] border border-white/10 bg-zinc-900/70 p-4 shadow-xl shadow-black/30 backdrop-blur-xl">
            <div className="max-h-[52svh] space-y-3 overflow-y-auto pr-1">
              {messages.map((m, i) => (
                <div
                  key={`${m.role}-${i}`}
                  className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                >
                  <div
                    className={
                      m.role === 'user'
                        ? 'max-w-[85%] rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100'
                        : 'max-w-[85%] rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-zinc-200'
                    }
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {loading ? (
                <div className="text-xs uppercase tracking-widest text-zinc-500">AI Coach думает…</div>
              ) : null}
            </div>

            {error ? (
              <p className="mb-0 mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {error}
              </p>
            ) : null}

            <form
              onSubmit={onSubmit}
              className="mt-4 flex items-stretch gap-2 rounded-2xl border border-white/10 bg-zinc-950/80 p-2"
            >
              <input
                className="min-w-0 flex-1 border-0 bg-transparent px-2 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 disabled:opacity-50"
                placeholder="Например: я постоянно пропускаю медитацию"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Send
              </button>
            </form>
          </section>
        </main>
      </div>

      <BottomNav
        active="coach"
        onChange={onTab}
        variant="bar"
      />
    </div>
  )
}
