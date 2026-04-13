"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock } from "lucide-react";
import { AegisButton } from "@/components/ui/AegisButton";
import SystemLabel from "@/components/ui/SystemLabel";

export default function LoginPage() {
  const [pin, setPin]         = useState<string>("");
  const [error, setError]     = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router   = useRouter();

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin.trim() || loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ pin }),
      });

      if (res.ok) {
        router.replace("/console");
      } else {
        setError("Access Denied — Invalid PIN");
        setPin("");
        inputRef.current?.focus();
      }
    } catch {
      setError("Node Unreachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">

        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-950/20 shadow-[0_0_30px_-5px_rgba(139,92,246,0.4)]">
            <Shield className="h-8 w-8 text-violet-400" />
          </div>
          <div className="text-center">
            <h1 className="text-[13px] font-black tracking-[0.25em] uppercase text-white leading-tight">
              Aegis Node
            </h1>
            <div className="mt-1">
              <SystemLabel>
                Operator Authentication Required
              </SystemLabel>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
            <input
              ref={inputRef}
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter operator PIN"
              autoFocus
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-3.5 text-sm text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-violet-500/50 transition-colors font-mono tracking-widest"
            />
          </div>

          {error && (
            <p className="text-[9px] font-black text-red-400 uppercase tracking-widest text-center">
              {error}
            </p>
          )}

          <AegisButton
            label="Authenticate"
            icon={Shield}
            loading={loading}
            disabled={!pin.trim()}
            size="md"
            className="w-full py-4 text-[11px] rounded-xl"
            onClick={handleSubmit}
          />
        </form>

        <p className="text-center text-[8px] font-bold text-slate-700 uppercase tracking-widest">
          Local Node // Vanguard Protocol
        </p>
      </div>
    </main>
  );
}
