"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "./auth.module.css";

const SOCIAL_PROVIDERS = [
  { name: "Google", icon: "G", color: "#EA4335", bg: "rgba(234,67,53,0.1)", border: "rgba(234,67,53,0.25)" },
  { name: "GitHub", icon: "🐙", color: "#e4e4e7", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)" },
  { name: "Facebook", icon: "f", color: "#1877F2", bg: "rgba(24,119,242,0.1)", border: "rgba(24,119,242,0.25)" },
  { name: "LinkedIn", icon: "in", color: "#0A66C2", bg: "rgba(10,102,194,0.1)", border: "rgba(10,102,194,0.25)" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    // Handle OAuth Callback from backend redirect
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userStr = params.get('user');
    const err = params.get('error');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        login(user, token);
        router.push('/dashboard');
      } catch(e) {}
    } else if (err) {
      setError("OAuth login failed or is missing Client ID keys.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:5002/api/auth/login", { email, password });
      login(res.data.user, res.data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = (provider: string) => {
    window.location.href = `http://localhost:5002/api/auth/${provider.toLowerCase()}`;
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoArea}>
          <Link href="/" className={styles.logo}>
            Technical Ilahi <span>Hub</span>
          </Link>
        </div>
        <h1 className={styles.heading}>Welcome back</h1>
        <p className={styles.subheading}>Sign in to your ZilVerse account</p>

        {/* Social Logins */}
        <div className={styles.socialGrid}>
          {SOCIAL_PROVIDERS.map(p => (
            <button
              type="button"
              key={p.name}
              onClick={() => handleSocial(p.name)}
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
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className={styles.forgotRow}>
            <a href="#" className={styles.forgot}>Forgot password?</a>
          </div>
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p className={styles.switch}>
          Don't have an account? <Link href="/register">Create one →</Link>
        </p>
      </div>
    </div>
  );
}
