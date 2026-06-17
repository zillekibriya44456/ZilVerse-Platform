"use client";
import { API_BASE } from "@/utils/api";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";

import axios from "axios";
import styles from "./freelancers.module.css";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { DollarSign, CheckCircle2, AlertTriangle, X, ShieldAlert, Award } from "lucide-react";

interface FreelancerItem {
  id?: string;
  userId?: string;
  initials: string;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  rate: string;
  hourlyRateNum: number;
  skills: string[];
  color: string;
  verified: boolean;
}



export default function FreelancersPage() {
  const { user, token } = useAuth();
  const { formatPrice, currency } = useCurrency();
  const [dbFreelancers, setDbFreelancers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Wallet / Hire modal states
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerItem | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [milestoneName, setMilestoneName] = useState("Initial Project Setup");
  const [budget, setBudget] = useState<number>(500);
  const [isHiring, setIsHiring] = useState(false);
  const [hiredSuccess, setHiredSuccess] = useState(false);
  const [hireError, setHireError] = useState<string | null>(null);

  useEffect(() => {
    // Dynamically load the Razorpay checkout script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {}
    };
  }, []);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [freelancersLoading, setFreelancersLoading] = useState(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchFreelancers = useCallback((q: string, pg: number) => {
    setFreelancersLoading(true);
    const params: any = { page: pg, limit: 24 };
    if (q.trim()) params.q = q.trim();
    axios.get(`${API_BASE}/api/freelancers`, { params })
      .then(res => {
        // Handle both new paginated {data,...} and legacy flat array
        if (res.data?.data) {
          setDbFreelancers(res.data.data);
          setTotal(res.data.total || 0);
          setTotalPages(res.data.totalPages || 1);
        } else {
          const arr = Array.isArray(res.data) ? res.data : [];
          setDbFreelancers(arr);
          setTotal(arr.length);
          setTotalPages(1);
        }
      })
      .catch(err => console.error("Failed to load freelancers", err))
      .finally(() => setFreelancersLoading(false));
  }, []);

  useEffect(() => { fetchFreelancers("", 1); }, [fetchFreelancers]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchFreelancers(searchTerm, 1);
    }, 450);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchTerm, fetchFreelancers]);

  const goToPage = (pg: number) => {
    setPage(pg);
    fetchFreelancers(searchTerm, pg);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    // Load client wallet details if logged in
    const activeToken = token || localStorage.getItem("zilverse_token") || "";
    if (!activeToken || !user?.id) return;
    
    axios.get(`${API_BASE}/api/payments/wallet?userId=${user.id}`, {
      headers: {
        Authorization: `Bearer ${activeToken}`
      }
    })
      .then(res => setWalletBalance(res.data.availableBalance))
      .catch(err => console.error("Failed to load wallet data", err));
  }, [user, token]);

  // Safe skills parser: handles both string[] (Postgres array) and comma-string
  const parseSkills = (skills: any): string[] => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills.map(String).filter(Boolean);
    if (typeof skills === 'string') return skills.split(',').map((s: string) => s.trim()).filter(Boolean);
    return [];
  };

  const formattedDbFreelancers: FreelancerItem[] = dbFreelancers.map((f, idx) => ({
    id: f.id,
    userId: f.userId,
    initials: f.user?.name ? f.user.name.substring(0, 2).toUpperCase() : "ZV",
    name: f.user?.name || "Global Freelancer",
    role: f.title || "Freelancer",
    rating: 5.0,
    reviews: ((f.id?.charCodeAt(0) || 65) % 40) + 10, // deterministic based on ID
    rate: formatPrice(f.hourlyRate || 30) + "/hr",
    hourlyRateNum: f.hourlyRate || 30,
    skills: parseSkills(f.skills),
    color: "linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)",
    verified: f.user?.verified ?? true,
  }));


  // Server-side search is active — formattedDbFreelancers IS the filtered result
  const filteredFreelancers = formattedDbFreelancers;


  const handleHireClick = (freelancer: FreelancerItem) => {
    const activeToken = token || localStorage.getItem("zilverse_token") || "";
    if (!activeToken) {
      alert("Please log in to hire freelancers.");
      window.location.href = "/login?redirect=/freelancers";
      return;
    }
    setSelectedFreelancer(freelancer);
    setMilestoneName(`Hire ${freelancer.name} - Milestone 1`);
    setBudget(freelancer.hourlyRateNum * 10); // Default to 10 hours of work
    setHireError(null);
    setHiredSuccess(false);
  };

  const handleConfirmHire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFreelancer) return;
    setIsHiring(true);
    setHireError(null);

    const activeToken = token || localStorage.getItem("zilverse_token") || "";
    const config = {
      headers: {
        Authorization: `Bearer ${activeToken}`
      }
    };

    // Fallback ID if hiring a local mock freelancer who isn't saved in the DB yet
    const targetFreelancerId = selectedFreelancer.userId || "fallback-freelancer-id";

    // Scenario A: Client has enough wallet balance
    if (walletBalance !== null && walletBalance >= budget) {
      try {
        const response = await axios.post(`${API_BASE}/api/payments/escrow/create`, {
          userId: user?.id,
          freelancerId: targetFreelancerId,
          amount: budget,
          currency: "USD",
          milestoneName: milestoneName,
          projectTitle: `${selectedFreelancer.role} Services`
        }, config);

        if (response.data.success) {
          setHiredSuccess(true);
          setWalletBalance(prev => (prev !== null ? prev - budget : null));
        }
      } catch (err: any) {
        console.error(err);
        setHireError(err.response?.data?.error || "Transaction failed. Please ensure you have sufficient available balance.");
      } finally {
        setIsHiring(false);
      }
      return;
    }

    // Scenario B: Client needs to pay/deposit via Razorpay first
    try {
      // 1. Create order on the backend
      // Convert budget (USD) to INR (exchange rate 83.5), then to paise
      const inrAmount = budget * 83.5;
      const paiseAmount = Math.max(100, Math.round(inrAmount * 100));

      const orderRes = await axios.post(
        `${API_BASE}/api/payments/razorpay/create-order`,
        {
          amount: paiseAmount,
          currency: "INR",
          receipt: `escrow_${Date.now()}`
        },
        config
      );

      const { order_id, amount: orderAmount, currency: orderCurrency } = orderRes.data;

      // 2. Configure Razorpay checkout options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_Sxuhmk2KLWNZx5",
        amount: orderAmount,
        currency: orderCurrency,
        name: "ZilVerse Freelancers",
        description: `Escrow Deposit: ${selectedFreelancer.name}`,
        order_id: order_id,
        handler: async function (response: any) {
          setIsHiring(true);
          try {
            // 3. Verify Payment (Automatically credits user's wallet with the USD amount)
            await axios.post(
              `${API_BASE}/api/payments/razorpay/verify-payment`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: budget, // USD amount to credit
                currency: "USD"
              },
              config
            );

            // 4. Create Escrow transaction using newly credited balance
            const escrowResponse = await axios.post(`${API_BASE}/api/payments/escrow/create`, {
              userId: user?.id,
              freelancerId: targetFreelancerId,
              amount: budget,
              currency: "USD",
              milestoneName: milestoneName,
              projectTitle: `${selectedFreelancer.role} Services`
            }, config);

            if (escrowResponse.data.success) {
              setHiredSuccess(true);
              // Refresh wallet balance state
              const wRes = await axios.get(`${API_BASE}/api/payments/wallet?userId=${user?.id}`, config);
              setWalletBalance(wRes.data.availableBalance);
            } else {
              setHireError("Escrow contract setup failed after payment.");
            }
          } catch (err: any) {
            console.error("Payment flow verification error:", err);
            setHireError(err.response?.data?.error || "Payment verification failed.");
          } finally {
            setIsHiring(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#7c3aed",
        },
        modal: {
          ondismiss: function () {
            alert("Payment checkout cancelled.");
            setIsHiring(false);
          }
        }
      };

      if ((window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          console.error("Payment failed:", resp.error);
          alert(`Payment failed: ${resp.error.description}`);
          setIsHiring(false);
        });
        rzp.open();
      } else {
        setHireError("Razorpay SDK not loaded. Please try again.");
        setIsHiring(false);
      }
    } catch (err: any) {
      console.error("Razorpay order creation error:", err);
      setHireError(err.response?.data?.error || "Failed to initiate Razorpay checkout.");
      setIsHiring(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className="container">
        
        {/* Header Hero */}
        <div className={styles.header}>
          <h1 className={styles.title}>Freelancer Marketplace</h1>
          <p className={styles.subtitle}>
            {freelancersLoading ? 'Loading talent...' : `${total.toLocaleString()} verified professionals worldwide`}
          </p>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search by name, role, or skill (e.g. Next.js, Figma)..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-primary">Search</button>
          </div>
        </div>

        {/* Grid Listings */}
        <div className={styles.grid}>
          {freelancersLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="skeleton" style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-text" style={{ width: '60%', marginBottom: '0.4rem' }} />
                    <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
                  {[1,2,3].map(j => <div key={j} className="skeleton" style={{ width: 56, height: 20, borderRadius: 99 }} />)}
                </div>
                <div className="skeleton" style={{ width: '100%', height: 38, borderRadius: 10 }} />
              </div>
            ))
          ) : filteredFreelancers.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 0', color: '#71717a' }}>
              <p style={{ marginBottom: '1rem' }}>No freelancers found{searchTerm ? ` for "${searchTerm}"` : ''}.</p>
              {searchTerm && <button className="btn btn-secondary" onClick={() => setSearchTerm('')}>Clear Search</button>}
            </div>
          ) : (
            filteredFreelancers.map((f, i) => (
              <div key={f.id || i} className={`glass-panel ${styles.card}`}>
                <div className={styles.profileRow}>
                  <div className={styles.avatar} style={{ background: f.color }}>{f.initials}</div>
                  <div>
                    <div className={styles.nameRow}>
                      <h3 className={styles.name}>{f.name}</h3>
                      {f.verified && <span className={styles.verified}>✓ Verified</span>}
                    </div>
                    <p className={styles.role}>{f.role}</p>
                  </div>
                </div>
                <p className={styles.rating}>⭐ {f.rating} ({f.reviews} reviews) • <strong>{f.rate}</strong></p>
                <div className={styles.skills}>
                  {f.skills.slice(0, 4).map(s => <span key={s} className={styles.skill}>{s}</span>)}
                </div>
                <div className={styles.actions}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleHireClick(f)}>Hire Now</button>
                  <button className="btn btn-secondary">Profile</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!freelancersLoading && totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '2rem 0' }}>
            <button onClick={() => goToPage(page - 1)} disabled={page <= 1}
              style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: page <= 1 ? '#52525b' : '#e4e4e7', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}>
              ← Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => goToPage(p)}
                style={{ width: 36, height: 36, borderRadius: 8, background: page === p ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${page === p ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.08)'}`, color: page === p ? '#c084fc' : '#a1a1aa', cursor: 'pointer', fontWeight: page === p ? 700 : 400 }}>
                {p}
              </button>
            ))}
            <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages}
              style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: page >= totalPages ? '#52525b' : '#e4e4e7', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}>
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Hire Modal Overlay */}
      {selectedFreelancer && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            
            <button className={styles.closeBtn} onClick={() => setSelectedFreelancer(null)}>
              <X size={18} />
            </button>

            <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.5rem" }}>
              <div className={styles.avatar} style={{ background: selectedFreelancer.color, width: "50px", height: "50px", fontSize: "1.1rem" }}>
                {selectedFreelancer.initials}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700" }}>Hire {selectedFreelancer.name}</h3>
                <p style={{ margin: 0, color: "#a1a1aa", fontSize: "0.85rem" }}>{selectedFreelancer.role} • {selectedFreelancer.rate}</p>
              </div>
            </div>

            {hiredSuccess ? (
              <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                <CheckCircle2 size={48} color="#10b981" style={{ margin: "0 auto 1rem" }} />
                <h4 style={{ color: "#10b981", fontSize: "1.2rem", fontWeight: "700", marginBottom: "0.5rem" }}>Hiring Completed!</h4>
                <p style={{ color: "#a1a1aa", fontSize: "0.88rem", lineHeight: "1.5" }}>
                  Milestone fund of <strong>{formatPrice(budget)}</strong> is locked under platform Escrow. Work contract has been created.
                </p>
                <button
                  className="btn btn-secondary"
                  style={{ marginTop: "1.5rem", width: "100%" }}
                  onClick={() => setSelectedFreelancer(null)}
                >
                  Return to Marketplace
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmHire} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                
                <div>
                  <label style={{ fontSize: "0.78rem", color: "#a1a1aa", display: "block", marginBottom: "0.3rem" }}>Milestone Purpose</label>
                  <input
                    type="text"
                    required
                    value={milestoneName}
                    onChange={e => setMilestoneName(e.target.value)}
                    style={{ width: "100%", padding: "0.75rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#fff", outline: "none" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ fontSize: "0.78rem", color: "#a1a1aa", display: "block", marginBottom: "0.3rem" }}>Budget Deposit (USD)</label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={budget}
                      onChange={e => setBudget(Number(e.target.value))}
                      style={{ width: "100%", padding: "0.75rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#fff", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.78rem", color: "#a1a1aa", display: "block", marginBottom: "0.3rem" }}>Available Wallet Balance</label>
                    <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "8px", color: "#34d399", fontWeight: "700" }}>
                      ${walletBalance !== null ? walletBalance.toFixed(2) : "0.00"} USD
                    </div>
                  </div>
                </div>

                {hireError && (
                  <div style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#f87171", borderRadius: "8px", padding: "0.6rem 0.8rem", fontSize: "0.82rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                    <span>{hireError}</span>
                  </div>
                )}

                <div style={{ background: "rgba(168, 85, 247, 0.05)", border: "1px solid rgba(168, 85, 247, 0.15)", borderRadius: "10px", padding: "0.75rem 1rem", fontSize: "0.78rem", color: "#c084fc", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <Award size={14} style={{ flexShrink: 0 }} />
                  <span>Your deposit is held in a secure milestone Escrow. Released only on approved deliverables.</span>
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isHiring}
                    style={{ flex: 2 }}
                  >
                    {isHiring 
                      ? "Authorizing..." 
                      : (walletBalance !== null && walletBalance >= budget)
                        ? "Confirm & Deposit"
                        : "Pay & Hire via Razorpay"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSelectedFreelancer(null)}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
