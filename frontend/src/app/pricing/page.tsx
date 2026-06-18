"use client";
import React, { useState, useEffect } from "react";
import { Check, Zap, Crown, Star, Shield, Rocket, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/utils/api";
import Link from "next/link";

const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    priceINR: 0,
    period: "forever",
    icon: Shield,
    color: "#71717a",
    gradient: "linear-gradient(135deg, rgba(113,113,122,0.1), rgba(63,63,70,0.05))",
    features: [
      "Browse all opportunities",
      "Apply to 5 jobs/month",
      "Basic profile & portfolio",
      "Community discussions",
      "1 active service listing",
      "Public project listings",
    ],
    cta: "Current Plan",
    popular: false,
  },
  {
    id: "PRO",
    name: "Pro",
    price: 9.99,
    priceINR: 829,
    period: "/month",
    icon: Zap,
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.08))",
    features: [
      "Everything in Free",
      "Unlimited job applications",
      "AI Opportunity Agent",
      "Priority profile visibility",
      "10 active service listings",
      "Analytics dashboard",
      "Remove all ads",
      "5GB file storage",
      "Advanced search filters",
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    id: "ELITE",
    name: "Elite",
    price: 29.99,
    priceINR: 2499,
    period: "/month",
    icon: Crown,
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(249,115,22,0.08))",
    features: [
      "Everything in Pro",
      "Verified badge on profile",
      "Boost listings (top of search)",
      "Unlimited service listings",
      "Pitch to investors (Grants)",
      "Group chat creation",
      "Priority support (24hr)",
      "50GB file storage",
      "Custom profile URL",
      "Featured on homepage",
    ],
    cta: "Upgrade to Elite",
    popular: false,
  },
];

const FAQ = [
  { q: "Can I cancel anytime?", a: "Yes — cancel from your dashboard at any time. Your benefits continue until the end of the billing period." },
  { q: "Is my payment secure?", a: "All payments are processed through Razorpay with bank-grade security. We never store your card details." },
  { q: "Do you offer refunds?", a: "We offer a 7-day money-back guarantee on all paid plans, no questions asked." },
  { q: "Can I upgrade or downgrade?", a: "Absolutely. You can switch plans at any time from your account settings." },
  { q: "What counts as a service listing?", a: "Any active gig or service you publish on the ZilVerse marketplace counts as one listing." },
];

declare global { interface Window { Razorpay: any } }

export default function PricingPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [billing,      setBilling]      = useState<"monthly" | "annual">("monthly");
  const [currentTier,  setCurrentTier]  = useState("FREE");
  const [loading,      setLoading]      = useState<string | null>(null);
  const [toast,        setToast]        = useState("");
  const [openFaq,      setOpenFaq]      = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/membership/status`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setCurrentTier(d.tier || "FREE")).catch(() => {});
  }, [token]);

  const getPrice = (plan: typeof PLANS[0]) => {
    if (plan.price === 0) return 0;
    return billing === "annual" ? Math.round(plan.priceINR * 10) : plan.priceINR;
  };

  const handleUpgrade = async (planId: string) => {
    if (!user) return router.push("/login?redirect=/pricing");
    if (planId === "FREE" || planId === currentTier) return;

    setLoading(planId);
    try {
      // Load Razorpay SDK
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = () => resolve();
          s.onerror = reject;
          document.body.appendChild(s);
        });
      }

      const res  = await fetch(`${API_BASE}/api/membership/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tier: planId }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to create order");

      const plan = PLANS.find(p => p.id === planId)!;

      const options = {
        key:         data.keyId,
        amount:      data.amount,
        currency:    data.currency,
        name:        "ZilVerse",
        description: `${plan.name} Membership`,
        order_id:    data.orderId,
        prefill:     { name: user.name, email: user.email },
        theme:       { color: plan.color },
        handler: async (response: any) => {
          const verifyRes = await fetch(`${API_BASE}/api/membership/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ...response, tier: planId }),
          });
          if (verifyRes.ok) {
            setCurrentTier(planId);
            setToast(`🎉 Welcome to ${plan.name}! Your benefits are now active.`);
            setTimeout(() => setToast(""), 5000);
          }
        },
      };

      const rz = new window.Razorpay(options);
      rz.open();
    } catch (e: any) {
      setToast(`❌ ${e.message || "Payment failed. Try again."}`);
      setTimeout(() => setToast(""), 4000);
    } finally { setLoading(null); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", paddingTop: "7rem" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "0.85rem 1.5rem", color: "#e4e4e7", fontWeight: 600, fontSize: "0.88rem", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem 4rem" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", padding: "0.4rem 1rem", borderRadius: 999, fontSize: "0.78rem", color: "#a855f7", fontWeight: 700, marginBottom: "1.25rem" }}>
            <Sparkles size={13} /> Transparent Pricing
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, color: "#f4f4f5", lineHeight: 1.15, marginBottom: "1rem" }}>
            Choose Your Growth Plan
          </h1>
          <p style={{ color: "#71717a", fontSize: "1.05rem", maxWidth: 520, margin: "0 auto 1.75rem" }}>
            Unlock the full power of ZilVerse. Upgrade when you&apos;re ready, cancel anytime.
          </p>

          {/* Billing toggle */}
          <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 4 }}>
            {(["monthly", "annual"] as const).map(b => (
              <button key={b} onClick={() => setBilling(b)} style={{
                padding: "0.5rem 1.25rem", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: "0.82rem",
                background: billing === b ? "rgba(139,92,246,0.2)" : "transparent",
                color: billing === b ? "#a855f7" : "#71717a",
                transition: "all 0.15s",
              }}>
                {b === "monthly" ? "Monthly" : "Annual (2 months free)"}
              </button>
            ))}
          </div>
        </div>

        {/* Plans grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", marginBottom: "4rem", alignItems: "start" }}>
          {PLANS.map(plan => {
            const isCurrent = currentTier === plan.id;
            const price     = getPrice(plan);
            const Icon      = plan.icon;

            return (
              <div key={plan.id} style={{
                background: plan.gradient,
                border: `1px solid ${plan.popular ? plan.color + "40" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 20,
                padding: "2rem",
                position: "relative",
                transform: plan.popular ? "scale(1.03)" : "scale(1)",
                boxShadow: plan.popular ? `0 0 40px ${plan.color}18` : "none",
              }}>
                {plan.popular && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: plan.color, color: "#fff", padding: "4px 16px", borderRadius: 999, fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.05em" }}>
                    MOST POPULAR
                  </div>
                )}

                {/* Plan header */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${plan.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={20} style={{ color: plan.color }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#f4f4f5" }}>{plan.name}</div>
                    {isCurrent && <div style={{ fontSize: "0.65rem", color: plan.color, fontWeight: 700 }}>CURRENT PLAN</div>}
                  </div>
                </div>

                {/* Price */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                    <span style={{ fontSize: plan.price === 0 ? "1.8rem" : "0.9rem", color: "#71717a", fontWeight: 500 }}>{plan.price === 0 ? "" : "₹"}</span>
                    <span style={{ fontSize: "2.75rem", fontWeight: 900, color: "#f4f4f5", lineHeight: 1 }}>
                      {plan.price === 0 ? "Free" : price.toLocaleString("en-IN")}
                    </span>
                    {plan.price > 0 && <span style={{ fontSize: "0.85rem", color: "#52525b" }}>{billing === "annual" ? "/year" : "/month"}</span>}
                  </div>
                  {billing === "annual" && plan.price > 0 && (
                    <div style={{ fontSize: "0.73rem", color: "#22c55e", marginTop: 4, fontWeight: 600 }}>
                      Save ₹{Math.round(plan.priceINR * 2).toLocaleString("en-IN")} vs monthly
                    </div>
                  )}
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={!!loading || isCurrent || plan.id === "FREE"}
                  style={{
                    width: "100%", padding: "0.85rem", borderRadius: 12,
                    border: plan.id === "FREE" ? "1px solid rgba(255,255,255,0.08)" : "none",
                    background: isCurrent ? "rgba(255,255,255,0.05)" : plan.id === "FREE" ? "transparent" : plan.color,
                    color: isCurrent ? "#52525b" : plan.id === "FREE" ? "#71717a" : "#fff",
                    fontFamily: "inherit", fontWeight: 800, fontSize: "0.9rem", cursor: isCurrent || plan.id === "FREE" ? "default" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                    transition: "opacity 0.15s", opacity: loading === plan.id ? 0.6 : 1,
                    marginBottom: "1.5rem",
                  } as React.CSSProperties}
                >
                  {loading === plan.id ? "Processing…" : isCurrent ? "✓ Active" : plan.cta}
                  {!isCurrent && plan.id !== "FREE" && loading !== plan.id && <ArrowRight size={15} />}
                </button>

                {/* Features */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", fontSize: "0.82rem", color: "#a1a1aa" }}>
                      <Check size={13} style={{ color: plan.color, flexShrink: 0, marginTop: 2 }} />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature comparison table */}
        <div style={{ marginBottom: "4rem" }}>
          <h2 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 800, color: "#f4f4f5", marginBottom: "1.5rem" }}>Full Feature Comparison</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" }}>
              <thead>
                <tr>
                  {["Feature", "Free", "Pro", "Elite"].map((h, i) => (
                    <th key={h} style={{ padding: "0.85rem 1rem", textAlign: i === 0 ? "left" : "center", color: ["#71717a", "#71717a", "#8B5CF6", "#F59E0B"][i], fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Job Applications",         "5/month",    "Unlimited",  "Unlimited"],
                  ["Service Listings",          "1",          "10",         "Unlimited"],
                  ["AI Opportunity Agent",      "—",          "✓",          "✓"],
                  ["Analytics Dashboard",       "—",          "✓",          "✓"],
                  ["File Storage",              "500MB",      "5GB",        "50GB"],
                  ["Boost Listings",            "—",          "—",          "✓"],
                  ["Verified Badge",            "—",          "—",          "✓"],
                  ["Investor Pitching",         "—",          "—",          "✓"],
                  ["Group Chat Creation",       "—",          "—",          "✓"],
                  ["Priority Support",          "—",          "—",          "24hr"],
                ].map(([feat, free, pro, elite]) => (
                  <tr key={feat} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.75rem 1rem", color: "#a1a1aa" }}>{feat}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "center", color: free === "—" ? "#27272a" : "#e4e4e7" }}>{free}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "center", color: pro === "—" ? "#27272a" : pro === "✓" ? "#8B5CF6" : "#e4e4e7" }}>{pro}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "center", color: elite === "—" ? "#27272a" : elite === "✓" ? "#F59E0B" : "#e4e4e7" }}>{elite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 800, color: "#f4f4f5", marginBottom: "1.5rem" }}>Frequently Asked Questions</h2>
          {FAQ.map((faq, i) => (
            <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "0.5rem" }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: "100%", textAlign: "left", padding: "1rem 0", background: "none", border: "none", color: "#e4e4e7", fontFamily: "inherit", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                {faq.q}
                <span style={{ color: "#52525b", fontSize: "1.2rem", transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
              </button>
              {openFaq === i && <div style={{ paddingBottom: "1rem", color: "#71717a", fontSize: "0.83rem", lineHeight: 1.6 }}>{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
