"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./auth.module.css";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { API_BASE } from "@/utils/api";
import { Loader2, Eye, EyeOff } from "lucide-react";

const SOCIAL_PROVIDERS = [
  { id: "google", name: "Google", icon: "G", color: "#EA4335", bg: "rgba(234,67,53,0.1)", border: "rgba(234,67,53,0.25)" },
  { id: "github", name: "GitHub", icon: "🐙", color: "#e4e4e7", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)" },
];

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const router = useRouter();
  const { login, user, isHydrated } = useAuth();

  // Redirect to dashboard if already logged in (after hydration)
  useEffect(() => {
    if (isHydrated && user) {
      router.replace("/dashboard");
    }
  }, [user, isHydrated, router]);

  // Handle OAuth callback — token + user passed back in URL query params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const token   = params.get("token");
    const userStr = params.get("user");
    const errParam = params.get("error");

    if (errParam) {
      setError("OAuth authentication failed. Please try again.");
      return;
    }

    if (token && userStr) {
      try {
        const oauthUser = JSON.parse(decodeURIComponent(userStr));
        login(oauthUser, token);
        router.replace("/dashboard");
      } catch (e) {
        console.error("Failed to parse OAuth user from URL", e);
        setError("Login failed — invalid session data.");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });

      if (res.data?.token && res.data?.user) {
        // login() writes to localStorage first, then updates React state
        login(res.data.user, res.data.token);
        // Small tick lets the context re-render before navigation
        setTimeout(() => router.replace("/dashboard"), 50);
      } else {
        setError("Unexpected server response. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid email or password.";
      setError(msg);
      setLoading(false);
    }
  };

  const handleSocial = (providerId: "google" | "github") => {
    setError("");
    window.location.href = `${API_BASE}/api/auth/${providerId}`;
  };

  // Don't render until hydration is done (avoids flash if already logged in)
  if (!isHydrated) return null;
  if (user) return null;

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Logo */}
        <div className={styles.logoArea}>
          <Link href="/" className={styles.logo}>
            Zil<span>Verse</span>
          </Link>
        </div>

        <h1 className={styles.heading}>Welcome back</h1>
        <p className={styles.subheading}>Sign in to your ZilVerse account</p>

        {/* Social Logins */}
        <div className={styles.socialGrid}>
          {SOCIAL_PROVIDERS.map(p => (
            <button
              type="button"
              key={p.id}
              onClick={() => handleSocial(p.id as "google" | "github")}
              className={styles.socialBtn}
              style={{ background: p.bg, borderColor: p.border, color: p.color }}
              title={`Continue with ${p.name}`}
            >
              <span className={styles.socialIcon}>{p.icon}</span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>

        <div className={styles.divider}>
          <span>or continue with email</span>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="login-password">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="login-password"
                type={showPwd ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: "3rem", width: "100%", boxSizing: "border-box" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                style={{
                  position: "absolute", right: "0.85rem", top: "50%",
                  transform: "translateY(-50%)", background: "none",
                  border: "none", color: "#71717a", cursor: "pointer",
                  display: "flex", alignItems: "center", padding: 0
                }}
                tabIndex={-1}
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className={styles.forgotRow}>
            <Link href="/forgot-password" className={styles.forgot}>Forgot password?</Link>
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={loading}
            style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
          >
            {loading
              ? <><Loader2 className="animate-spin" size={18} /> Signing in...</>
              : "Sign In →"
            }
          </button>
        </form>

        <p className={styles.switch}>
          Don&apos;t have an account? <Link href="/register">Create one →</Link>
        </p>
      </div>
    </div>
  );
}
