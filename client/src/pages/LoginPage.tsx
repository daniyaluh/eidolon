import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { loginFormSchema } from "../lib/validation/auth";
import type { LoginFormValues } from "../lib/validation/auth";
import { ApiError } from "../lib/apiClient";
import { Spinner } from "../components/ui/Spinner";
import { GlassCard } from "../components/ui/GlassCard";

function AtIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="4" />
      <path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1" strokeLinecap="round" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="8" cy="15" r="4" />
      <path d="M10.8 12.2 20 3m-3 3 2 2m-5 1 2 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      await login(values.email, values.password);
      const redirectTo = (location.state as { from?: string } | null)?.from ?? "/games";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to log in. Please try again.");
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10">
      {/* Black ↔ grey ↔ white gradient field */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 78% 20%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 55%)," +
            "radial-gradient(60% 60% at 10% 100%, rgba(160,160,170,0.18) 0%, rgba(160,160,170,0) 60%)," +
            "linear-gradient(145deg, #000000 0%, #17171a 45%, #34343a 70%, #6a6a72 100%)",
        }}
      />
      {/* Floating frosted orbs that the card's blur bends */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-10 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-md">
        <GlassCard className="rounded-[2rem] p-7 sm:p-9">
          {/* Brand row */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <img src="/logo.png" alt="" className="h-5 w-5 object-contain" />
              <img src="/wordmark.png" alt="Eidolon" className="h-3 w-auto object-contain brightness-0 invert" />
            </span>
            <Link
              to="/register"
              className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
            >
              Sign up
            </Link>
          </div>

          {/* Heading + social */}
          <div className="mt-7 flex items-center justify-between">
            <h1 className="text-display text-3xl font-bold tracking-tight text-white">Log in</h1>
            <button
              type="button"
              onClick={() => setFormError("Social sign-in is coming soon — use your email for now.")}
              className="glass-soft flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-200/15"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-black">
                G
              </span>
              Google
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3">
            {/* Email */}
            <div>
              <div className="glass-soft flex items-center gap-3 rounded-full px-5 py-3.5 transition focus-within:ring-1 focus-within:ring-white/40">
                <span className="text-zinc-400">
                  <AtIcon />
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="e-mail address"
                  aria-invalid={Boolean(errors.email)}
                  className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                  {...register("email")}
                />
              </div>
              {errors.email?.message && (
                <p className="mt-1.5 pl-5 text-xs text-zinc-300">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="glass-soft flex items-center gap-3 rounded-full py-1.5 pl-5 pr-1.5 transition focus-within:ring-1 focus-within:ring-white/40">
                <span className="text-zinc-400">
                  <KeyIcon />
                </span>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="password"
                  aria-invalid={Boolean(errors.password)}
                  className="w-full bg-transparent py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setFormError("Password reset is coming soon.")}
                  className="shrink-0 rounded-full bg-white/15 px-3.5 py-2 text-xs font-medium text-zinc-200 transition hover:bg-zinc-200/25 hover:text-white"
                >
                  I forgot
                </button>
              </div>
              {errors.password?.message && (
                <p className="mt-1.5 pl-5 text-xs text-zinc-300">{errors.password.message}</p>
              )}
            </div>

            {formError && <p className="pl-5 text-xs text-zinc-300">{formError}</p>}

            {/* Fine print + submit */}
            <div className="flex items-end justify-between gap-4 pt-3">
              <p className="max-w-[16rem] text-[11px] leading-relaxed text-zinc-400">
                By continuing you agree to our{" "}
                <span className="font-medium text-zinc-200 underline decoration-zinc-500 underline-offset-2">
                  Terms
                </span>{" "}
                and{" "}
                <span className="font-medium text-zinc-200 underline decoration-zinc-500 underline-offset-2">
                  Privacy Policy
                </span>
                .
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                aria-label="Log in"
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-lg shadow-white/20 transition hover:bg-zinc-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <Spinner /> : <ArrowIcon />}
              </button>
            </div>

            <p className="pt-2 text-center text-xs font-medium tracking-wide text-zinc-400">
              Welcome back — let&apos;s get you playing.
            </p>
          </form>
        </GlassCard>

        {/* Bottom accent card */}
        <Link
          to="/games"
          className="glass glass-spot group mt-4 flex items-center justify-between rounded-[1.6rem] px-7 py-5 transition hover:bg-zinc-200/[0.1]"
        >
          <div>
            <p className="text-display text-lg font-semibold text-white">New releases</p>
            <p className="text-sm text-zinc-400">Fresh drops in the store</p>
          </div>
          <span className="flex items-center gap-2 text-sm font-medium text-white">
            Discover
            <span className="transition-transform group-hover:translate-x-1">
              <ArrowIcon />
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
}
