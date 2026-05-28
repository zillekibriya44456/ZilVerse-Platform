"use client";
import { API_BASE } from "@/utils/api";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "../login/auth.module.css";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("BUYER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_BASE}/api/auth/register`, { name, email, password, role });
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoArea}>
          <Link href="/" className={styles.logo}>
            Technical Ilahi <span>Hub</span>
          </Link>
        </div>
        <h1 className={styles.heading}>Create Account</h1>
        <p className={styles.subheading}>Join thousands of users on ZilVerse</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Full Name</label>
            <input type="text" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div className={styles.field}>
            <label>I am a...</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="BUYER">Buyer — I want to hire or buy</option>
              <option value="SELLER">Seller — I want to sell projects</option>
              <option value="FREELANCER">Freelancer — I want to offer services</option>
            </select>
          </div>
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className={styles.switch}>
          Already have an account? <Link href="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
