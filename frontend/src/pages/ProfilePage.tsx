import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { BottomNav } from '../components/dashboard/BottomNav'
import type { BottomTab } from '../components/dashboard/types'
import { ApiError } from '../lib/api'
import { useAuth } from '../lib/auth-context'
import { generateTelegramLinkCode, type TelegramLinkCodeResponse } from '../lib/telegram-api'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const canSeeAdmin = Boolean(user?.is_admin)
  const [tgLink, setTgLink] = useState<TelegramLinkCodeResponse | null>(null)
  const [tgBusy, setTgBusy] = useState(false)
  const [tgError, setTgError] = useState<string | null>(null)
  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string | undefined
  const botUrl = botUsername?.trim() ? `https://t.me/${botUsername.trim()}` : null

  const onTab = (tab: BottomTab) => {
    if (tab === 'today') navigate('/app')
    else if (tab === 'stats') navigate('/app/stats')
    else if (tab === 'coach') navigate('/app/ai')
    else if (tab === 'profile') navigate('/app/profile')
    else if (tab === 'admin' && canSeeAdmin) navigate('/app/admin/analytics')
    else navigate('/app')
  }

  const onGenerateTelegramCode = async () => {
    setTgBusy(true)
    setTgError(null)
    try {
      const data = await generateTelegramLinkCode()
      setTgLink(data)
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to generate Telegram code'
      setTgError(msg)
    } finally {
      setTgBusy(false)
    }
  }

  return (
    <div className="min-h-svh overflow-x-hidden bg-[#050506] font-sans text-zinc-100 antialiased selection:bg-emerald-500/30 [background-image:radial-gradient(120%_80%_at_10%_0%,rgba(255,60,100,0.12)_0%,transparent_50%),radial-gradient(100%_60%_at_100%_20%,rgba(30,160,255,0.1)_0%,transparent_45%),radial-gradient(90%_50%_at_50%_100%,rgba(50,210,120,0.08)_0%,transparent_50%)]">
      <div className="mx-auto flex w-full max-w-[430px] flex-col px-3 pt-2 sm:px-4 md:max-w-3xl md:px-6 lg:max-w-7xl lg:flex-row lg:items-start lg:gap-6 lg:px-8 lg:pt-6">
        <BottomNav
          active="profile"
          onChange={onTab}
          variant="rail"
          showAdmin={canSeeAdmin}
        />
        <main className="flex min-w-0 flex-1 flex-col gap-4 pb-28 sm:pb-24 lg:pb-8">
          <header className="rounded-[22px] border border-white/10 bg-zinc-900/70 p-5 shadow-xl shadow-black/30 backdrop-blur-xl">
            <h1 className="m-0 text-2xl font-semibold tracking-tight text-zinc-100">Profile</h1>
          </header>

          <section className="rounded-[22px] border border-white/10 bg-zinc-900/70 p-4 shadow-lg shadow-black/30 backdrop-blur-xl">
            <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              Account
            </p>
            <p className="m-0 mt-2 text-sm text-zinc-300">{user?.email}</p>
          </section>

          <section className="rounded-[22px] border border-white/10 bg-zinc-900/70 p-4 shadow-lg shadow-black/30 backdrop-blur-xl">
            <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              Telegram Integration
            </p>
            <p className="mt-2 text-sm text-zinc-300">{user?.telegram_id ? 'Connected ✅' : 'Not connected'}</p>
            <button
              type="button"
              onClick={() => void onGenerateTelegramCode()}
              disabled={tgBusy}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Generate Telegram link code
            </button>
            {tgError ? <p className="mt-2 text-xs text-rose-300">{tgError}</p> : null}
            {tgLink ? (
              <div className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-3">
                <p className="m-0 text-xs uppercase tracking-[0.12em] text-emerald-300">
                  Send this code to the bot
                </p>
                <p className="m-0 mt-1 text-xl font-bold tracking-[0.2em] text-emerald-200">
                  {tgLink.code}
                </p>
              </div>
            ) : null}
            <ol className="mb-0 mt-3 list-decimal space-y-1 pl-5 text-xs text-zinc-400">
              <li>Open Telegram bot</li>
              <li>Press /start</li>
              <li>Send the code</li>
            </ol>
            {botUrl ? (
              <a
                href={botUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2 text-sm font-semibold text-zinc-100 no-underline transition hover:bg-white/[0.12]"
              >
                Open bot
              </a>
            ) : null}
          </section>

          <section className="rounded-[22px] border border-white/10 bg-zinc-900/70 p-4 shadow-lg shadow-black/30 backdrop-blur-xl">
            <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              App Settings
            </p>
            <p className="m-0 mt-2 text-sm text-zinc-400">Preferences will appear here later.</p>
          </section>

          <div className="grid grid-cols-1 gap-3 sm:max-w-[320px]">
            <Link
              to="/"
              className="block rounded-2xl border border-white/10 bg-zinc-900/70 px-4 py-3 text-center text-sm font-medium text-zinc-100 no-underline transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              About / Home
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-2xl border border-rose-400/35 bg-zinc-900/70 px-4 py-3 text-sm font-medium text-rose-300 transition hover:-translate-y-0.5 hover:bg-rose-500/10"
            >
              Log out
            </button>
          </div>
        </main>
      </div>
      <BottomNav
        active="profile"
        onChange={onTab}
        variant="bar"
        showAdmin={canSeeAdmin}
      />
    </div>
  )
}
