"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/Button";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const joinTripId = searchParams.get("joinTrip");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    if (password !== confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setErrors({});
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: undefined }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        const errs: Record<string, string> = {};
        if (data.error?.email) errs.email = data.error.email[0];
        if (data.error?.password) errs.password = data.error.password[0];
        setErrors(Object.keys(errs).length ? errs : { email: "Registration failed" });
        return;
      }
      if (joinTripId && redirect) {
        router.push(`/onboarding?redirect=${encodeURIComponent(redirect)}&joinTrip=${joinTripId}`);
      } else if (joinTripId) {
        router.push(`/onboarding?joinTrip=${joinTripId}`);
      } else {
        router.push("/onboarding");
      }
      router.refresh();
    } catch {
      setErrors({ email: "Could not reach server. Check your connection and try again." });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
          <Link href="/" className="text-2xl font-bold tracking-tight text-[#FF6B35]">Triply</Link>
          <h1 className="mt-10 text-3xl font-bold text-gray-900 tracking-tight">Welcome to Triply</h1>
          <p className="mt-2 text-gray-600">Create your account to find travel companions and plan trips together</p>
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  className={`block w-full pl-10 pr-4 py-3 rounded-xl border bg-white/80 ${errors.email ? "border-red-500" : "border-gray-200"} focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all`} />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters"
                  className={`block w-full pl-10 pr-4 py-3 rounded-xl border bg-white/80 ${errors.password ? "border-red-500" : "border-gray-200"} focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all`} />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••"
                  className={`block w-full pl-10 pr-4 py-3 rounded-xl border bg-white/80 ${errors.confirm ? "border-red-500" : "border-gray-200"} focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all`} />
              </div>
              {errors.confirm && <p className="mt-1 text-sm text-red-500">{errors.confirm}</p>}
            </div>
            <Button type="submit" className="w-full flex items-center justify-center gap-2">Continue with Email <ArrowRight className="w-4 h-4" /></Button>
            <Button type="button" variant="secondary" className="w-full flex items-center justify-center gap-2 !border-gray-200">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </Button>
          </form>
          <p className="mt-6 text-center text-gray-600 text-sm">Already have an account? <Link href="/login" className="text-primary-600 font-semibold hover:underline">Log in</Link></p>
        </motion.div>
      </div>
      <div className="hidden lg:block lg:w-1/2 bg-gradient-hero relative">
        <Image src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=1000&fit=crop" alt="Travel" fill className="object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/70 via-primary-800/30 to-transparent" />
      </div>
    </div>
  );
}
