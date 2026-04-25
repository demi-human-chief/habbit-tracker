import { useNavigate } from 'react-router-dom'

export function AIInsight() {
  const navigate = useNavigate()
  return (
    <div className="rounded-[22px] border border-white/10 bg-zinc-900/70 p-5 shadow-xl shadow-black/30 backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-2xl motion-reduce:transition-none">
      <h3 className="m-0 text-[0.9rem] font-semibold tracking-tight text-zinc-100">AI Insight</h3>
      <p className="mb-4 mt-2 text-[0.86rem] leading-relaxed text-zinc-500">
        You are more consistent in the morning. Try scheduling your most important habit
        before noon.
      </p>
      <button
        type="button"
        onClick={() => navigate('/app/ai')}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.08] py-2.5 text-[0.82rem] font-semibold text-zinc-100 transition hover:-translate-y-0.5 hover:bg-white/[0.12] motion-reduce:transition-none"
      >
        Ask AI Coach
      </button>
    </div>
  )
}
