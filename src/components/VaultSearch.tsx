'use client'

import { useState } from 'react'
import { Search, Database, X, Loader2 } from 'lucide-react'
import { searchRemediations } from '@/actions/vault'
import type { VaultSearchResult } from '@/types/aegis'

export default function VaultSearch() {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<VaultSearchResult[] | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await searchRemediations(query)
      setResults(res)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setQuery('')
    setResults(null)
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/20 backdrop-blur-xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <Database className="h-4 w-4 text-violet-400" />
        <span className="text-[11px] font-black tracking-widest uppercase text-white">
          Vault Search
        </span>
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
          — Remediation Signature History
        </span>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Query past remediations..."
            className="w-full bg-slate-950/60 border border-slate-800 rounded-lg pl-9 pr-9 py-2.5 text-xs text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-violet-500/50 transition-colors font-mono"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-3 w-3 text-slate-600 hover:text-slate-400 transition-colors" />
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 text-[10px] font-black uppercase tracking-widest text-white hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
          Query
        </button>
      </div>

      {results !== null && (
        <div className="mt-4 space-y-2">
          {results.length === 0 ? (
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center py-5">
              No signatures found in vault
            </p>
          ) : (
            results.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-slate-800/40 bg-slate-950/40 px-4 py-2.5 gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-[9px] text-violet-500 flex-shrink-0">
                    {r.id}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 truncate">
                    {r.action}
                  </span>
                  <span
                    className={`flex-shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded ${
                      r.source === 'EDGE'
                        ? 'text-violet-400 bg-violet-500/10'
                        : 'text-slate-500 bg-slate-700/30'
                    }`}
                  >
                    [{r.source}]
                  </span>
                </div>
                <span className="flex-shrink-0 text-[9px] font-mono text-slate-600">
                  {(r.score * 100).toFixed(0)}% match
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
