import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { useState } from "react";
import { NeonBackground } from "@/components/site/NeonBackground";
import { Logo } from "@/components/site/Logo";
import { apiClient } from "@/lib/api/client";
import { setAuthSession, getStoredUser } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — HustleBridge" }, { name: "description", content: "Sign in to your account." }] }),
  component: Login,
}) as any;

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiClient.post<any>("/auth/login", {
        email,
        password,
      });

      const { user, tokens } = response;
      setAuthSession(user, tokens);

      // Redirect based on role
      if (user.role === "student") {
        navigate({ to: "/student" });
      } else if (user.role === "client") {
        navigate({ to: "/client" });
      } else {
        navigate({ to: "/" });
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <NeonBackground />
      <div className="mx-auto flex max-w-md flex-col items-center px-6 pt-12 pb-20">
        <Logo />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-16 text-center">
          <div className="text-sm uppercase tracking-[0.3em] text-white/50">Welcome back to</div>
          <h1 className="mt-3 font-display text-6xl font-bold sm:text-7xl">
            HUSTLE<span className="text-[#FF0A78] text-glow-pink">BRIDGE</span>
          </h1>
          <p className="mt-4 text-white/70">Sign in to continue your hustle</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="mt-12 w-full space-y-6"
        >
          {error && (
            <div className="flex items-center gap-3 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs text-white/50">Email</label>
            <div className="mt-2 flex items-center gap-3 rounded-full bg-white/5 px-5 py-3">
              <Mail className="h-4 w-4 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/50">Password</label>
            <div className="mt-2 flex items-center gap-3 rounded-full bg-white/5 px-5 py-3">
              <Lock className="h-4 w-4 text-white/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#F5E400] px-7 py-4 font-semibold text-black glow-yellow hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </motion.form>

        <p className="mt-8 text-sm text-white/50">
          Don't have an account?{" "}
          <Link to="/register" as="/register" className="text-[#F5E400] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
