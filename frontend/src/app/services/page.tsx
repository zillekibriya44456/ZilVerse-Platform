"use client";
import { API_BASE } from "@/utils/api";

import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import axios from "axios";
import styles from "./services.module.css";
import { useAuth } from "@/context/AuthContext";

const API = `${API_BASE}/api/services`;

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

const parsePrice = (priceStr: string): number => {
  const clean = priceStr.replace(/[^0-9]/g, "");
  const num = parseInt(clean, 10);
  return isNaN(num) ? 499 : num;
};

const RATES: Record<string, { rate: number; symbol: string }> = {
  USD: { rate: 1.0, symbol: "$" },
  INR: { rate: 83.5, symbol: "₹" },
  EUR: { rate: 0.92, symbol: "€" },
  GBP: { rate: 0.79, symbol: "£" }
};

export default function ServicesPage() {
  const { user, token } = useAuth();
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [quoteModal, setQuoteModal] = useState<string | null>(null);
  const [quoteForm, setQuoteForm] = useState({ name: "", email: "", phone: "", company: "", budget: "", message: "" });
  
  // Checkout Modal State
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [purchaseForm, setPurchaseForm] = useState({ name: "", email: "", phone: "", company: "", requirements: "" });
  const [currency, setCurrency] = useState<"USD" | "INR" | "EUR" | "GBP">("INR");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    // Fetch DB services
    axios.get(API)
      .then(res => setDbServices(res.data))
      .catch(err => console.error("Failed to load DB services", err));
  }, []);

  // Pre-fill name/email from auth
  useEffect(() => {
    if (user) {
      setQuoteForm(prev => ({ ...prev, name: user.name || "", email: user.email || "" }));
      setPurchaseForm(prev => ({ ...prev, name: user.name || "", email: user.email || "" }));
    }
  }, [user]);

  const formattedDbServices = dbServices.map((s: any) => ({
    icon: "💻", title: s.title, desc: s.description,
    price: `From $${s.price}`,
    features: [`Delivery: ${s.deliveryTime}`, `Rating: ${s.rating}★`, `${s.sales} Sales`, "Custom Build"],
    color: "linear-gradient(135deg, #10b981, #3b82f6)",
  }));

  const services = [...formattedDbServices, ...MOCK_SERVICES];

  const handleQuoteClick = (title: string) => {
    setQuoteModal(title);
  };

  const handleOrderClick = (service: any) => {
    const activeToken = token || localStorage.getItem("zilverse_token") || "";
    if (!activeToken) {
      alert("Please log in to purchase services.");
      window.location.href = "/login?redirect=/services";
      return;
    }
    setSelectedService(service);
    setPurchaseForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
      company: "",
      requirements: ""
    });
  };

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

  const handleServiceCheckout = async () => {
    console.log("Initiating service checkout payment...");
    if (!purchaseForm.name || !purchaseForm.email || !purchaseForm.requirements) {
      alert("⚠️ Validation Failed: Please fill in Name, Email, and Requirements.");
      setToast("⚠️ Please fill in Name, Email, and Requirements.");
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const activeToken = token || localStorage.getItem("zilverse_token") || "";
    if (!activeToken) {
      alert("⚠️ Auth Context Lost: Please log in to proceed.");
      setToast("❌ Authentication context lost. Please log in.");
      setTimeout(() => setToast(null), 3500);
      return;
    }

    setIsSubmitting(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${activeToken}`
        }
      };

      const basePriceUsd = parsePrice(selectedService.price);
      const inrRate = RATES.INR.rate;
      const baseInrPrice = basePriceUsd * inrRate;
      
      // Calculate final total (base price + 2% service fee)
      const baseTotalInr = baseInrPrice + (baseInrPrice * 0.02);
      const paiseAmount = Math.max(100, Math.round(baseTotalInr * 100));

      console.log(`Creating Razorpay order on backend. baseUSD: ${basePriceUsd}, baseTotalINR: ${baseTotalInr}, paiseAmount: ${paiseAmount}`);

      // 1. Create order on the backend
      const orderRes = await axios.post(
        `${API_BASE}/api/payments/razorpay/create-order`,
        {
          amount: paiseAmount,
          currency: "INR",
          receipt: `service_${Date.now()}`
        },
        config
      );

      const { order_id, amount: orderAmount, currency: orderCurrency } = orderRes.data;
      console.log(`Backend order created successfully. order_id: ${order_id}`);

      // 2. Configure Razorpay checkout options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_Sxuhmk2KLWNZx5",
        amount: orderAmount,
        currency: orderCurrency,
        name: "ZilVerse Digital Services",
        description: `Order: ${selectedService.title}`,
        order_id: order_id,
        handler: async function (response: any) {
          setIsSubmitting(true);
          console.log("Razorpay payment authorized by user. Verifying signature on backend...", response);
          try {
            // 3. Verify Payment on Backend
            await axios.post(
              `${API_BASE}/api/payments/razorpay/verify-payment`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: basePriceUsd,
                currency: "USD",
                type: "PURCHASE",
                description: `Service Purchase: ${selectedService.title}`
              },
              config
            );

            console.log("Payment verification successful. Registering quote entry...");

            // 4. Create Service Quote with status PAID
            await axios.post(`${API_BASE}/api/services/quote`, {
              serviceTitle: selectedService.title,
              name: purchaseForm.name,
              email: purchaseForm.email,
              phone: purchaseForm.phone || null,
              company: purchaseForm.company || null,
              budget: `$${basePriceUsd} USD`,
              message: `[DIRECT PURCHASE PAID VIA RAZORPAY] Requirements: ${purchaseForm.requirements}`,
              status: "PAID"
            }, config);

            setSelectedService(null);
            alert("✅ Payment successful! Your service order has been initiated.");
            setToast("✅ Payment successful! Service order has been initiated.");
            setTimeout(() => setToast(null), 5000);
          } catch (err: any) {
            console.error("Verification error:", err);
            const errMsg = err.response?.data?.error || err.message;
            alert("❌ Payment verification failed: " + errMsg);
            setToast("❌ Verification failed: " + errMsg);
            setTimeout(() => setToast(null), 4000);
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: purchaseForm.name,
          email: purchaseForm.email,
          contact: purchaseForm.phone || ""
        },
        theme: {
          color: "#7c3aed"
        },
        modal: {
          ondismiss: function () {
            console.log("Checkout modal dismissed by user.");
            setIsSubmitting(false);
          }
        }
      };

      if ((window as any).Razorpay) {
        console.log("Opening Razorpay checkout frame...");
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          console.error("Razorpay Payment failed event:", resp.error);
          alert(`❌ Payment failed: ${resp.error.description}`);
          setIsSubmitting(false);
        });
        rzp.open();
      } else {
        console.error("window.Razorpay SDK is not loaded.");
        alert("❌ Razorpay SDK is not loaded. Please wait a moment for the page script to load and try again.");
        setToast("❌ Razorpay SDK not loaded.");
        setTimeout(() => setToast(null), 3000);
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error("Order creation failed on backend:", err);
      const errMsg = err.response?.data?.error || err.message;
      alert("❌ Order initiation failed: " + errMsg);
      setToast("❌ Order initiation failed: " + errMsg);
      setTimeout(() => setToast(null), 4000);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 999999,
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
              <div className={styles.bottom} style={{ display: "flex", gap: "0.5rem", width: "100%", marginTop: "1rem" }}>
                <button className="btn btn-secondary" style={{ flex: 1, padding: "0.6rem" }} onClick={() => handleQuoteClick(s.title)}>
                  Quote
                </button>
                <button className="btn btn-primary" style={{ flex: 1, padding: "0.6rem" }} onClick={() => handleOrderClick(s)}>
                  Buy Now
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

      {/* Direct Purchase Modal */}
      {selectedService && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 99999,
          display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)"
        }} onClick={() => setSelectedService(null)}>
          <div style={{
            background: "rgba(18,18,20,0.98)", borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.08)", padding: "2rem",
            width: "90%", maxWidth: "480px", maxHeight: "85vh", overflowY: "auto",
            backdropFilter: "blur(30px)"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>
                🛍️ Buy Service Package
              </h2>
              <button onClick={() => setSelectedService(null)} style={{
                background: "none", border: "none", color: "#71717a", fontSize: "1.2rem", cursor: "pointer"
              }}>✕</button>
            </div>

            <div style={{
              background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)",
              borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1.5rem",
              color: "#a855f7", fontSize: "0.88rem", fontWeight: 600
            }}>
              Service: {selectedService.title} ({selectedService.price})
            </div>

            {/* Currency Selector */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.75rem", color: "#a1a1aa", display: "block", marginBottom: "0.4rem" }}>Select Currency</label>
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value as any)}
                style={inputStyle}
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>

            {/* Display Converted Amount */}
            <div style={{ 
              background: "rgba(255,255,255,0.02)", 
              border: "1px solid rgba(255,255,255,0.05)", 
              borderRadius: "10px", 
              padding: "1rem", 
              marginBottom: "1.5rem",
              textAlign: "center"
            }}>
              <span style={{ fontSize: "0.8rem", color: "#a1a1aa", display: "block" }}>Final Amount</span>
              <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>
                {RATES[currency].symbol}{(parsePrice(selectedService.price) * RATES[currency].rate).toFixed(2)}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <input type="text" placeholder="Your Name *" value={purchaseForm.name}
                onChange={e => setPurchaseForm({ ...purchaseForm, name: e.target.value })}
                style={inputStyle} />
              <input type="email" placeholder="Email Address *" value={purchaseForm.email}
                onChange={e => setPurchaseForm({ ...purchaseForm, email: e.target.value })}
                style={inputStyle} />
              <input type="tel" placeholder="Phone Number" value={purchaseForm.phone}
                onChange={e => setPurchaseForm({ ...purchaseForm, phone: e.target.value })}
                style={inputStyle} />
              <input type="text" placeholder="Company Name" value={purchaseForm.company}
                onChange={e => setPurchaseForm({ ...purchaseForm, company: e.target.value })}
                style={inputStyle} />
              <textarea placeholder="Describe your requirements details... *" value={purchaseForm.requirements}
                onChange={e => setPurchaseForm({ ...purchaseForm, requirements: e.target.value })}
                rows={3}
                style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} />
            </div>

            <button onClick={handleServiceCheckout} disabled={isSubmitting}
              style={{
                width: "100%", padding: "1rem", marginTop: "1.25rem", border: "none",
                borderRadius: "12px", fontWeight: 700, fontSize: "1rem", cursor: "pointer",
                background: "linear-gradient(135deg, #a855f7, #0ea5e9)", color: "#fff",
                opacity: isSubmitting ? 0.7 : 1, transition: "all 0.2s"
              }}>
              {isSubmitting ? "Processing Checkout..." : `💳 Pay ${RATES[currency].symbol}{(parsePrice(selectedService.price) * RATES[currency].rate).toFixed(2)} Now`}
            </button>
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
