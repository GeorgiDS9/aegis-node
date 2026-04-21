import { useState, memo } from "react";
import { Search, Database, Fingerprint, X, Loader2 } from "lucide-react";
import { useVaultSearch } from "@/hooks/useAegis";
import { AegisCard } from "./ui/AegisCard";
import { CardHeader } from "./ui/CardHeader";
import { AegisButton } from "./ui/AegisButton";
import { SourceLabel } from "./ui/SourceLabel";
import SystemLabel from "./ui/SystemLabel";

function VaultSearch() {
  const { results, loading, search, clear } = useVaultSearch();
  const [input, setInput] = useState<string>("");
  const [searched, setSearched] = useState<boolean>(false);

  const handleSearch = async () => {
    if (!input.trim()) return;
    setSearched(true);
    await search(input);
  };

  const handleClear = () => {
    setInput("");
    setSearched(false);
    clear();
  };

  return (
    <AegisCard>
      <CardHeader title="Vault Intelligence" icon={Database} />

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search CVE drift or threat signatures..."
            className="w-full bg-slate-950/40 border border-slate-800 rounded px-10 py-2.5 text-[12px] font-medium text-slate-200 placeholder:text-slate-600 focus:border-violet-500/30 transition-all outline-none"
          />
          {input && (
            <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-3 w-3 text-slate-600 hover:text-slate-400 transition-colors" />
            </button>
          )}
        </div>
        <AegisButton
          label="Query"
          icon={loading ? Loader2 : Search}
          loading={loading}
          disabled={!input.trim()}
          variant="outline"
          size="sm"
          onClick={handleSearch}
        />
      </div>

      {searched && (
        <div className="mt-4 space-y-3 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
          {results.length === 0 ? (
            <SystemLabel type="empty-header" className="text-center py-5">
              No matching signatures
            </SystemLabel>
          ) : (
            results.map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-violet-500/20 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[9px] text-violet-500/80">
                      {r.id.slice(0, 12)}
                    </span>
                    <SourceLabel source={r.source} />
                  </div>
                  <span className="text-[9px] font-mono text-slate-600">
                    Reliability: {(r.score * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-300 line-clamp-2">{r.action}</p>
              </div>
            ))
          )}
        </div>
      )}
    </AegisCard>
  );
}

export default memo(VaultSearch);
