import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, Lock, AlertCircle, GraduationCap, Building2 } from "lucide-react";
import { useRef, useState } from "react";
import { NeonBackground } from "@/components/site/NeonBackground";
import { Logo } from "@/components/site/Logo";
import { setAuthSession } from "@/lib/auth";
import { authUserFromResponse, loginAccount, validateEmail } from "@/lib/auth-api";
import { DEMO_CLIENT, DEMO_STUDENT } from "@/lib/demo-accounts";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — HustleBridge" },
      { name: "description", content: "Sign in to your account." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const submittingRef = useRef(false);
  const errorRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<"student" | "client" | null>(null);
  const [error, setError] = useState("");

  const showError = (message: string) => {
    setError(message);
    requestAnimationFrame(() => {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const completeLogin = async (loginEmail: string, loginPassword: string) => {
    const emailError = validateEmail(loginEmail);
    if (emailError) {
      showError(emailError);
      return;
    }
    if (!loginPassword) {
      showError("Password is required.");
      return;
    }

    const response = await loginAccount(loginEmail, loginPassword);

    if (!response.user?.id || !response.tokens?.accessToken) {
      showError("Invalid response from server. Please try again.");
      return;
    }

    setAuthSession(authUserFromResponse(response), {
      accessToken: response.tokens.accessToken,
      refreshToken: response.tokens.refreshToken,
    });

    await navigate({
      to: response.user.role === "client" ? "/client" : "/student",
      replace: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submittingRef.current || loading || demoLoading) return;

    submittingRef.current = true;
    setError("");
    setLoading(true);

    try {
      await completeLogin(email, password);
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const handleDemoLogin = async (type: "student" | "client") => {
    if (submittingRef.current || loading || demoLoading) return;

    const demo = type === "student" ? DEMO_STUDENT : DEMO_CLIENT;
    submittingRef.current = true;
    setError("");
    setDemoLoading(type);

    try {
      await completeLogin(demo.email, demo.password);
    } catch (err: unknown) {
      showError(
        err instanceof Error
          ? err.message
          : "Demo login failed. Ensure the database seed has been run on the backend.",
      );
    } finally {
      setDemoLoading(null);
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
          <div className="text-sm uppercase tracking-[0.3em] text-white/50">Welcome back to</div>
          <h1 className="mt-3 font-display text-6xl font-bold sm:text-7xl">
            HUSTLE<span className="text-[#FF0A78] text-glow-pink">BRIDGE</span>
          </h1>
          <p className="mt-4 text-white/70">Sign in to continue your hustle</p>
        </motion.div>

        <motion.form
          noValidate
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="mt-12 w-full space-y-6"
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
                disabled={loading || !!demoLoading}
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
                placeholder="Enter your password"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
                disabled={loading || !!demoLoading}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !!demoLoading}
            aria-busy={loading}
            className="w-full rounded-full bg-[#F5E400] px-7 py-4 font-semibold text-black glow-yellow transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 w-full rounded-3xl border border-[#F5E400]/20 bg-[#F5E400]/5 p-5"
        >
          <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-[#F5E400]">
            Quick Demo Access
          </h2>
          <p className="mt-2 text-center text-xs text-white/50">
            One-click login for recruiter walkthroughs
          </p>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-black/20 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <GraduationCap className="h-4 w-4 text-[#F5E400]" />
                Student Demo
              </div>
              <p className="mt-2 text-xs text-white/60">Email: {DEMO_STUDENT.email}</p>
              <p className="text-xs text-white/60">Password: {DEMO_STUDENT.password}</p>
              <button
                type="button"
                disabled={loading || !!demoLoading}
                onClick={() => handleDemoLogin("student")}
                className="mt-3 w-full rounded-full bg-[#F5E400] px-4 py-2.5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {demoLoading === "student" ? "Signing in..." : "Login as Student"}
              </button>
            </div>

            <div className="rounded-2xl bg-black/20 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Building2 className="h-4 w-4 text-[#FF0A78]" />
                Client Demo
              </div>
              <p className="mt-2 text-xs text-white/60">Email: {DEMO_CLIENT.email}</p>
              <p className="text-xs text-white/60">Password: {DEMO_CLIENT.password}</p>
              <button
                type="button"
                disabled={loading || !!demoLoading}
                onClick={() => handleDemoLogin("client")}
                className="mt-3 w-full rounded-full bg-[#FF0A78] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {demoLoading === "client" ? "Signing in..." : "Login as Client"}
              </button>
            </div>
          </div>
        </motion.div>

        <p className="mt-8 text-sm text-white/50">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-[#F5E400] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
