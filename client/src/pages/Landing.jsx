import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

function AppPreview() {
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-[#242831] bg-[#13151b] shadow-2xl shadow-black/50">
      <div className="flex items-center gap-1.5 border-b border-[#242831] bg-[#0d0e12] px-4 py-2.5">
        <div className="h-2.5 w-2.5 rounded-full bg-[#242831]" />
        <div className="h-2.5 w-2.5 rounded-full bg-[#242831]" />
        <div className="h-2.5 w-2.5 rounded-full bg-[#242831]" />
      </div>

      <div className="flex">
        <div className="w-36 shrink-0 border-r border-[#242831] bg-[#13151b] p-3">
          <div className="mb-4 flex items-center gap-2 px-1 py-0.5">
            <div className="h-5 w-5 rounded bg-[#4e7cf6]" />
            <div className="h-2.5 w-14 rounded bg-[#242831]" />
          </div>
          {['Dashboard', 'Transactions', 'Budgets', 'Net Worth'].map((item, i) => (
            <div
              key={item}
              className={`mb-0.5 flex items-center gap-2 rounded px-2 py-1.5 ${
                i === 0 ? 'bg-[#4e7cf6]/15' : ''
              }`}
            >
              <div className={`h-1.5 w-1.5 rounded-sm ${i === 0 ? 'bg-[#4e7cf6]' : 'bg-[#242831]'}`} />
              <div className={`h-2 w-16 rounded ${i === 0 ? 'bg-[#4e7cf6]/40' : 'bg-[#242831]'}`} />
            </div>
          ))}
        </div>

        <div className="flex-1 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="h-3 w-32 rounded bg-[#c9d1e0]/20" />
            <div className="h-6 w-24 rounded bg-[#4e7cf6]/30" />
          </div>

          <div className="mb-3 grid grid-cols-4 gap-2">
            {[
              { val: '$6,050', label: 'Income', color: 'text-[#18c997]' },
              { val: '$2,333', label: 'Expenses', color: 'text-[#e84057]' },
              { val: '$3,717', label: 'Savings', color: 'text-[#c9d1e0]' },
              { val: '$46,810', label: 'Net Worth', color: 'text-[#4e7cf6]' },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-[#242831] bg-[#0d0e12] p-2.5">
                <div className="mb-1 text-[9px] text-[#606880]">{s.label}</div>
                <div className={`text-sm font-bold ${s.color}`}>{s.val}</div>
              </div>
            ))}
          </div>

          <div className="mb-3 grid grid-cols-5 gap-2">
            <div className="col-span-3 rounded-lg border border-[#242831] bg-[#0d0e12] p-3">
              <div className="mb-2 text-[9px] text-[#606880]">Cash Flow — Last 8 months</div>
              <div className="flex items-end gap-1" style={{ height: 52 }}>
                {[0.7, 0.9, 0.6, 0.85, 0.75, 0.95, 0.65, 1].map((h, i) => (
                  <div key={i} className="flex flex-1 flex-col-reverse gap-0.5">
                    <div className="w-full rounded-sm bg-[#e84057]/50" style={{ height: `${h * 22}px` }} />
                    <div className="w-full rounded-sm bg-[#18c997]/60" style={{ height: `${h * 36}px` }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-2 rounded-lg border border-[#242831] bg-[#0d0e12] p-3">
              <div className="mb-2 text-[9px] text-[#606880]">Spending by category</div>
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 44 44" className="h-12 w-12 shrink-0">
                  <circle cx="22" cy="22" r="16" fill="none" stroke="#242831" strokeWidth="6" />
                  <circle cx="22" cy="22" r="16" fill="none" stroke="#4e7cf6" strokeWidth="6" strokeDasharray="42 59" strokeDashoffset="-7" />
                  <circle cx="22" cy="22" r="16" fill="none" stroke="#18c997" strokeWidth="6" strokeDasharray="22 79" strokeDashoffset="-49" />
                  <circle cx="22" cy="22" r="16" fill="none" stroke="#e8a020" strokeWidth="6" strokeDasharray="15 86" strokeDashoffset="-71" />
                  <circle cx="22" cy="22" r="16" fill="none" stroke="#e84057" strokeWidth="6" strokeDasharray="22 79" strokeDashoffset="-86" />
                </svg>
                <div className="space-y-1.5">
                  {[['#4e7cf6','Housing'],['#18c997','Shopping'],['#e8a020','Food']].map(([c,l])=>(
                    <div key={l} className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{background:c}} />
                      <div className="text-[9px] text-[#606880]">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#242831] bg-[#0d0e12] p-3">
            <div className="mb-2 text-[9px] text-[#606880]">Recent transactions</div>
            {[
              { name: 'Monthly Salary', cat: 'Salary', amt: '+$5,200', pos: true },
              { name: 'Rent – June', cat: 'Housing', amt: '-$1,400', pos: false },
              { name: 'Groceries', cat: 'Food', amt: '-$210', pos: false },
            ].map((t) => (
              <div key={t.name} className="flex items-center justify-between border-b border-[#242831] py-1.5 last:border-0">
                <div>
                  <div className="text-[10px] font-medium text-[#c9d1e0]">{t.name}</div>
                  <div className="text-[9px] text-[#606880]">{t.cat}</div>
                </div>
                <div className={`text-[10px] font-semibold ${t.pos ? 'text-[#18c997]' : 'text-[#e84057]'}`}>{t.amt}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0d0e12] text-[#c9d1e0]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#4e7cf6]">
            <TrendingUp className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-semibold text-[#c9d1e0]">FinTrack</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-[#606880] transition-colors hover:text-[#c9d1e0]">
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-[#4e7cf6] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 pt-16 pb-24">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-medium text-[#4e7cf6]">Open source · Self-hosted</p>
            <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              Know where your<br />money actually goes.
            </h1>
            <p className="mb-4 text-base leading-relaxed text-[#606880]">
              Manual transaction tracking with categories, monthly budgets, and net worth — no bank connections, no subscriptions.
            </p>
            <p className="mb-8 text-sm text-[#606880]">
              Add income and expenses yourself. That's it. The charts do the rest.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="rounded-lg bg-[#4e7cf6] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Create free account
              </Link>
              <Link
                to="/login"
                className="rounded-lg border border-[#242831] px-6 py-2.5 text-sm font-medium text-[#606880] transition-colors hover:border-[#4e7cf6]/40 hover:text-[#c9d1e0]"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
              {[
                'Income & expense tracking',
                'Monthly budgets per category',
                'Net worth calculator',
                'Cash flow charts',
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-[#606880]">
                  <div className="h-1 w-1 rounded-full bg-[#4e7cf6]" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <AppPreview />
          </div>
        </div>
      </div>

      <div className="border-t border-[#242831]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 sm:grid-cols-3">
            <div>
              <div className="mb-3 text-3xl font-bold text-white">Manual-first</div>
              <p className="text-sm leading-relaxed text-[#606880]">
                You enter your own transactions. That means you actually see what you spend — instead of watching a number update automatically and not thinking about it.
              </p>
            </div>
            <div>
              <div className="mb-3 text-3xl font-bold text-white">No accounts linked</div>
              <p className="text-sm leading-relaxed text-[#606880]">
                Your financial data stays in your own database. No third-party bank integrations, no Plaid, no data being sold. JWT-authenticated, password-hashed, that's it.
              </p>
            </div>
            <div>
              <div className="mb-3 text-3xl font-bold text-white">Built to deploy</div>
              <p className="text-sm leading-relaxed text-[#606880]">
                React frontend, Node/Express backend, PostgreSQL. Deploy it on any VPS, Railway, Render — wherever you want. You own the stack.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#242831] py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-[#4e7cf6]">
              <TrendingUp className="h-2.5 w-2.5 text-white" />
            </div>
            <span className="text-sm text-[#606880]">FinTrack</span>
          </div>
          <p className="text-xs text-[#606880]">© {new Date().getFullYear()}</p>
          <div className="flex gap-4 text-xs text-[#606880]">
            <Link to="/login" className="hover:text-[#c9d1e0]">Sign in</Link>
            <Link to="/register" className="hover:text-[#c9d1e0]">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
