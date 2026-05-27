"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import styles from "./services.module.css";
import { useAuth } from "@/context/AuthContext";

const API = "http://localhost:5002/api/services";

const MOCK_SERVICES = [
  {
    icon: "🛒", title: "E-commerce Development",
    desc: "Full-stack online stores with payment gateways, inventory management, and admin dashboard.",
    price: "From $499", features: ["Payment Gateway", "Admin Panel", "Inventory Mgmt", "Mobile Responsive"],
    color: "var(--primary)",
  },
  {
    icon: "🎓", title: "Educational Platform",
    desc: "LMS integration, course selling, video streaming, student portals and quiz systems.",
    price: "From $799", features: ["Video Streaming", "Course Builder", "Student Dashboard", "Certificates"],
    color: "var(--accent)",
  },
  {
    icon: "📱", title: "Local Shop App",
    desc: "Mobile app for your local grocery, pharmacy, or retail store. iOS & Android.",
    price: "From $399", features: ["Order Management", "Customer App", "Push Notifications", "Analytics"],
    color: "var(--secondary)",
  },
  {
    icon: "🏥", title: "Healthcare System",
    desc: "Hospital management, appointment booking, patient records and telemedicine features.",
    price: "From $999", features: ["Appointment Booking", "Patient Records", "Doctor Portal", "Reports"],
    color: "#f59e0b",
  },
  {
    icon: "🏨", title: "Hotel & Booking System",
    desc: "Full reservation system with room management, POS, and booking calendar.",
    price: "From $699", features: ["Room Booking", "POS System", "Guest Portal", "Reporting"],
    color: "var(--primary)",
  },
  {
    icon: "🚀", title: "SaaS MVP Build",
    desc: "We build your full SaaS product from idea to launch. Auth, billing, dashboards included.",
    price: "From $1,499", features: ["Auth System", "Stripe Billing", "Dashboard", "API Backend"],
    color: "var(--accent)",
  },
];

export default function ServicesPage() {
  const { user } = useAuth();
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [quoteModal, setQuoteModal] = useState<string | null>(null);
  const [quoteForm, setQuoteForm] = useState({ name: "", email: "", phone: "", company: "", budget: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    axios.get(API)
      .then(res => setDbServices(res.data))
      .catch(err => console.error("Failed to load DB services", err));
  }, []);

  // Pre-fill name/email from auth
  useEffect(() => {
    if (user) {
      setQuoteForm(prev => ({ ...prev, name: user.name || "", email: user.email || "" }));
    }
  }, [user]);

  const formattedDbServices = dbServices.map((s: any) => ({
    icon: "💻", title: s.title, desc: s.description,
    price: `From $${s.price}`,
    features: [`Delivery: ${s.deliveryTime}`, `Rating: ${s.rating}★`, `${s.sales} Sales`, "Custom Build"],
    color: "linear-gradient(135deg, #10b981, #3b82f6)",
  }));

  const services = [...formattedDbServices, ...MOCK_SERVICES];

  const handleQuoteSubmit = async () => {
    if (!quoteForm.name || !quoteForm.email || !quoteForm.message) {
      setToast("Please fill in Name, Email, and Message.");
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post(`${API}/quote`, {
        serviceTitle: quoteModal,
        ...quoteForm,
      });
      setQuoteModal(null);
      setQuoteForm({ name: user?.name || "", email: user?.email || "", phone: "", company: "", budget: "", message: "" });
      setToast("✅ Quote request submitted! We'll contact you within 24 hours.");
      setTimeout(() => setToast(null), 5000);
    } catch (err: any) {
      setToast("❌ Failed to submit: " + (err.response?.data?.error || err.message));
      setTimeout(() => setToast(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 99999,
          background: toast.startsWith("✅") ? "#10b981" : toast.startsWith("❌") ? "#ef4444" : "#0ea5e9",
          color: "#fff", padding: "1rem 1.5rem", borderRadius: "12px",
          fontWeight: 600, fontSize: "0.9rem", boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
          animation: "slideIn 0.3s ease"
        }}>{toast}</div>
      )}

      <div className="container">
        <div className={styles.header}>
          <div style={{
            display: "inline-block", padding: "0.5rem 1.25rem",
            background: "rgba(168, 85, 247, 0.1)", color: "var(--primary)",
            borderRadius: "99px", fontWeight: 700, fontSize: "0.85rem",
            letterSpacing: ".05em", textTransform: "uppercase",
            border: "1px solid rgba(168, 85, 247, 0.2)", marginBottom: "1.5rem"
          }}>💼 Premium Services</div>
          <h1 className={styles.title}>Digital Services</h1>
          <p className={styles.subtitle}>
            Professional development services tailored for businesses of every size.
            Tell us what you need — we will build it.
          </p>
        </div>

        <div className={styles.grid}>
          {services.map((s, i) => (
            <div key={i} className={`glass-panel ${styles.card}`}>
              <div className={styles.iconWrap} style={{ background: `${s.color}18`, color: s.color }}>
                <span>{s.icon}</span>
              </div>
              <h3 className={styles.cardTitle}>{s.title}</h3>
              <p className={styles.cardDesc}>{s.desc}</p>
              <ul className={styles.features}>
                {s.features.map((f: string) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <div className={styles.bottom}>
                <span className={styles.price}>{s.price}</span>
                <button className="btn btn-primary" onClick={() => setQuoteModal(s.title)}>
                  Request Quote
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={`glass-panel ${styles.customBanner}`}>
          <h2>Need Something Custom?</h2>
          <p>Describe your project and we will give you a free estimate within 24 hours.</p>
          <Link href="/contact" className="btn btn-primary">Contact Us</Link>
        </div>
      </div>

      {/* Quote Request Modal */}
      {quoteModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 99999,
          display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)"
        }} onClick={() => setQuoteModal(null)}>
          <div style={{
            background: "rgba(18,18,20,0.98)", borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.08)", padding: "2rem",
            width: "90%", maxWidth: "480px", maxHeight: "85vh", overflowY: "auto",
            backdropFilter: "blur(30px)"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>
                📋 Request Quote
              </h2>
              <button onClick={() => setQuoteModal(null)} style={{
                background: "none", border: "none", color: "#71717a", fontSize: "1.2rem", cursor: "pointer"
              }}>✕</button>
            </div>

            <div style={{
              background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)",
              borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1.5rem",
              color: "#a855f7", fontSize: "0.88rem", fontWeight: 600
            }}>
              Service: {quoteModal}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <input type="text" placeholder="Your Name *" value={quoteForm.name}
                onChange={e => setQuoteForm({ ...quoteForm, name: e.target.value })}
                style={inputStyle} />
              <input type="email" placeholder="Email Address *" value={quoteForm.email}
                onChange={e => setQuoteForm({ ...quoteForm, email: e.target.value })}
                style={inputStyle} />
              <input type="tel" placeholder="Phone Number (optional)" value={quoteForm.phone}
                onChange={e => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                style={inputStyle} />
              <input type="text" placeholder="Company Name (optional)" value={quoteForm.company}
                onChange={e => setQuoteForm({ ...quoteForm, company: e.target.value })}
                style={inputStyle} />
              <select value={quoteForm.budget}
                onChange={e => setQuoteForm({ ...quoteForm, budget: e.target.value })}
                style={inputStyle}>
                <option value="">Select Budget Range</option>
                <option value="$200 - $500">$200 – $500</option>
                <option value="$500 - $1000">$500 – $1,000</option>
                <option value="$1000 - $2500">$1,000 – $2,500</option>
                <option value="$2500 - $5000">$2,500 – $5,000</option>
                <option value="$5000+">$5,000+</option>
              </select>
              <textarea placeholder="Describe your requirements... *" value={quoteForm.message}
                onChange={e => setQuoteForm({ ...quoteForm, message: e.target.value })}
                rows={4}
                style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} />
            </div>

            <button onClick={handleQuoteSubmit} disabled={isSubmitting}
              style={{
                width: "100%", padding: "1rem", marginTop: "1.25rem", border: "none",
                borderRadius: "12px", fontWeight: 700, fontSize: "1rem", cursor: "pointer",
                background: "linear-gradient(135deg, #a855f7, #0ea5e9)", color: "#fff",
                opacity: isSubmitting ? 0.7 : 1, transition: "all 0.2s"
              }}>
              {isSubmitting ? "Submitting..." : "🚀 Submit Quote Request"}
            </button>

            <p style={{ color: "#52525b", fontSize: "0.75rem", textAlign: "center", marginTop: "1rem" }}>
              We typically respond within 24 hours. No spam, ever.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.8rem 1rem",
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px", color: "#fff", fontSize: "0.9rem", outline: "none",
};
