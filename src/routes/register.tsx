import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, Lock, User, Building2, AlertCircle } from "lucide-react";
import { useRef, useState } from "react";
import { NeonBackground } from "@/components/site/NeonBackground";
import { Logo } from "@/components/site/Logo";
import { setAuthSession } from "@/lib/auth";
import { registerAccount, validateRegisterForm } from "@/lib/auth-api";

type RegisterSearch = {
  role?: "student" | "client";
};

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>): RegisterSearch => ({
    role: search.role === "client" ? "client" : "student",
  }),
  head: () => ({
    meta: [
      { title: "Register — HustleBridge" },
      { name: "description", content: "Create your account." },
    ],
  }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const { role: searchRole } = Route.useSearch();
  const submittingRef = useRef(false);
  const errorRef = useRef<HTMLDivElement>(null);

  const [role, setRole] = useState<"student" | "client">(searchRole ?? "student");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const showError = (message: string) => {
    setError(message);
    requestAnimationFrame(() => {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (submittingRef.current || loading) return;

    const validationError = validateRegisterForm({
      role,
      email,
      password,
      confirmPassword,
      fullName,
      companyName,
    });

    if (validationError) {
      showError(validationError);
      return;
    }

    submittingRef.current = true;
    setError("");
    setLoading(true);

    try {
      const response = await registerAccount({
        email,
        password,
        role,
        fullName: role === "student" ? fullName : undefined,
        companyName: role === "client" ? companyName : undefined,
      });

      if (!response.user?.id || !response.tokens?.accessToken) {
        showError("Invalid response from server. Please try again.");
        return;
      }

      setAuthSession(
        {
          id: response.user.id,
          email: response.user.email,
          role: response.user.role,
        },
        {
          accessToken: response.tokens.accessToken,
          refreshToken: response.tokens.refreshToken,
        },
      );

      await navigate({
        to: response.user.role === "client" ? "/client" : "/student",
        replace: true,
      });
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <NeonBackground />
      <div className="mx-auto flex max-w-md flex-col items-center px-6 pt-12 pb-20">
        <Logo />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 text-center"
        >
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
            type="button"
            disabled={loading}
            onClick={() => setRole("student")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
              role === "student"
                ? "bg-[#F5E400] text-black"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Hustler
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => setRole("client")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
              role === "client"
                ? "bg-[#FF0A78] text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Business
          </button>
        </motion.div>

        <motion.form
          noValidate
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="mt-8 w-full space-y-5"
        >
          {error && (
            <div
              ref={errorRef}
              role="alert"
              className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {role === "student" ? (
            <div>
              <label htmlFor="fullName" className="text-xs text-white/50">
                Full Name
              </label>
              <div className="mt-2 flex items-center gap-3 rounded-full bg-white/5 px-5 py-3">
                <User className="h-4 w-4 text-white/40" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
                  disabled={loading}
                  autoComplete="name"
                />
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="companyName" className="text-xs text-white/50">
                Company Name
              </label>
              <div className="mt-2 flex items-center gap-3 rounded-full bg-white/5 px-5 py-3">
                <Building2 className="h-4 w-4 text-white/40" />
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter your company name"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
                  disabled={loading}
                  autoComplete="organization"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="text-xs text-white/50">
              Email
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-full bg-white/5 px-5 py-3">
              <Mail className="h-4 w-4 text-white/40" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="text-xs text-white/50">
              Password
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-full bg-white/5 px-5 py-3">
              <Lock className="h-4 w-4 text-white/40" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
            <p className="mt-1.5 text-xs text-white/40">
              At least 8 characters, one uppercase letter, and one number.
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="text-xs text-white/50">
              Confirm Password
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-full bg-white/5 px-5 py-3">
              <Lock className="h-4 w-4 text-white/40" />
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full rounded-full bg-[#F5E400] px-7 py-4 font-semibold text-black glow-yellow transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </motion.form>

        <p className="mt-8 text-sm text-white/50">
          Already have an account?{" "}
          <Link to="/login" className="text-[#F5E400] hover:underline">
            Sign in
          </Link>
          {" · "}
          <Link to="/login" className="text-[#F5E400] hover:underline">
            Try the demo
          </Link>
        </p>
      </div>
    </div>
  );
}
