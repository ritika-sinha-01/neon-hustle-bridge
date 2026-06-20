import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, Lock, User, Building2, ArrowRight, AlertCircle } from "lucide-react";
import { useState } from "react";
import { NeonBackground } from "@/components/site/NeonBackground";
import { Logo } from "@/components/site/Logo";
import { apiClient } from "@/lib/api/client";
import { setAuthSession } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register — HustleBridge" }, { name: "description", content: "Create your account." }] }),
  component: Register,
}) as any;

function Register() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/register" }) as any;
  const initialRole = (search?.role as string) || "student";

  const [role, setRole] = useState<"student" | "client">(initialRole as "student" | "client");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        email,
        password,
        role,
      };

      if (role === "student") {
        payload.fullName = fullName;
      } else {
        payload.companyName = companyName;
      }

      const response = await apiClient.post<any>("/auth/register", payload);
      console.log("Register response:", response);

      const { user, tokens } = response;
      if (!user || !tokens || !tokens.accessToken) {
        setError("Invalid response from server. Please try again.");
        return;
      }

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
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
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
          <div className="text-sm uppercase tracking-[0.3em] text-white/50">Join</div>
          <h1 className="mt-3 font-display text-6xl font-bold sm:text-7xl">
            HUSTLE<span className="text-[#FF0A78] text-glow-pink">BRIDGE</span>
          </h1>
          <p className="mt-4 text-white/70">Create your account to get started</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 flex w-full gap-4"
        >
          <button
            onClick={() => setRole("student")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              role === "student"
                ? "bg-[#F5E400] text-black"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Hustler
          </button>
          <button
            onClick={() => setRole("client")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              role === "client"
                ? "bg-[#FF0A78] text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Business
          </button>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="mt-8 w-full space-y-5"
        >
          {error && (
            <div className="flex items-center gap-3 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {role === "student" ? (
            <div>
              <label className="text-xs text-white/50">Full Name</label>
              <div className="mt-2 flex items-center gap-3 rounded-full bg-white/5 px-5 py-3">
                <User className="h-4 w-4 text-white/40" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
                  required={role === "student"}
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs text-white/50">Company Name</label>
              <div className="mt-2 flex items-center gap-3 rounded-full bg-white/5 px-5 py-3">
                <Building2 className="h-4 w-4 text-white/40" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter your company name"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
                  required={role === "client"}
                />
              </div>
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
                placeholder="Create a password"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/50">Confirm Password</label>
            <div className="mt-2 flex items-center gap-3 rounded-full bg-white/5 px-5 py-3">
              <Lock className="h-4 w-4 text-white/40" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#F5E400] px-7 py-4 font-semibold text-black glow-yellow hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </motion.form>

        <p className="mt-8 text-sm text-white/50">
          Already have an account?{" "}
          <Link to="/login" className="text-[#F5E400] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
