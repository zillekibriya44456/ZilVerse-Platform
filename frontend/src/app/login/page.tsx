"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import styles from "./auth.module.css";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/utils/api";
import { Loader2 } from "lucide-react";

const SOCIAL_PROVIDERS = [
  { id: "google", name: "Google", icon: "G", color: "#EA4335", bg: "rgba(234,67,53,0.1)", border: "rgba(234,67,53,0.25)" },
  { id: "github", name: "GitHub", icon: "🐙", color: "#e4e4e7", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  // Check if we just returned from Render's Social Login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userStr = params.get("user");
    const errorParam = params.get("error");

    if (errorParam) {
      setError("OAuth authentication failed. Please try again.");
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        login(user, token);
        router.push("/dashboard");
      } catch (err) {
        console.error("Failed to parse user from URL", err);
      }
    }
  }, [login, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const { data, error } = await signIn.email({
        email,
        password,
      });
      
      if (error) {
        setError(error.message || "Invalid credentials.");
        setLoading(false);
        return;
      }
      
      // Better auth securely sets httpOnly cookies.
      router.push("/dashboard");
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleSocial = (providerId: "google" | "github") => {
    setError("");
    // Redirect directly to the Render backend for passport.js OAuth
    window.location.href = `${API_BASE}/api/auth/${providerId}`;
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
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
            {loading ? <><Loader2 className="animate-spin" size={18} /> Signing in...</> : "Sign In →"}
          </button>
        </form>

        <p className={styles.switch}>
          Don't have an account? <Link href="/register">Create one →</Link>
        </p>
      </div>
    </div>
  );
}
