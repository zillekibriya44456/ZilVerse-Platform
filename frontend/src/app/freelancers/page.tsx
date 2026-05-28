"use client";
import { API_BASE } from "@/utils/api";

import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./freelancers.module.css";
import { useAuth } from "@/context/AuthContext";
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

const MOCK_FREELANCERS = [
  { initials: "AK", name: "Arjun Kumar", role: "Full-Stack Developer", rating: 4.9, reviews: 120, rate: "$35/hr", hourlyRateNum: 35, skills: ["React", "Node.js", "Next.js", "PostgreSQL"], color: "var(--primary)", verified: true },
  { initials: "SD", name: "Sara Design", role: "UI/UX Designer", rating: 5.0, reviews: 89, rate: "$45/hr", hourlyRateNum: 45, skills: ["Figma", "Adobe XD", "Animation", "Branding"], color: "var(--secondary)", verified: true },
  { initials: "MZ", name: "M. Zaid", role: "Mobile Developer", rating: 4.8, reviews: 64, rate: "$30/hr", hourlyRateNum: 30, skills: ["Flutter", "React Native", "Firebase", "Dart"], color: "var(--accent)", verified: false },
  { initials: "FA", name: "Fatima Ali", role: "Backend Engineer", rating: 4.7, reviews: 48, rate: "$40/hr", hourlyRateNum: 40, skills: ["Python", "Django", "AWS", "PostgreSQL"], color: "#f59e0b", verified: true },
  { initials: "RK", name: "Rahul Khan", role: "DevOps Engineer", rating: 4.9, reviews: 33, rate: "$55/hr", hourlyRateNum: 55, skills: ["Docker", "Kubernetes", "CI/CD", "Terraform"], color: "var(--primary)", verified: true },
  { initials: "ZB", name: "Zara Butt", role: "Content Writer", rating: 4.6, reviews: 97, rate: "$20/hr", hourlyRateNum: 20, skills: ["SEO Writing", "Copywriting", "Blog Posts", "Research"], color: "var(--secondary)", verified: false },
];

export default function FreelancersPage() {
  const { user } = useAuth();
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
    // Load freelancers from backend
    axios.get(`${API_BASE}/api/freelancers`)
      .then(res => setDbFreelancers(res.data))
      .catch(err => console.error("Failed to load DB freelancers", err));
  }, []);

  useEffect(() => {
    // Load client wallet details if logged in
    const url = user?.id 
      ? `${API_BASE}/api/payments/wallet?userId=${user.id}`
      : `${API_BASE}/api/payments/wallet`;

    axios.get(url)
      .then(res => setWalletBalance(res.data.availableBalance))
      .catch(err => console.error("Failed to load wallet data", err));
  }, [user]);

  const formattedDbFreelancers: FreelancerItem[] = dbFreelancers.map(f => ({
    id: f.id,
    userId: f.userId,
    initials: f.user?.name ? f.user.name.substring(0, 2).toUpperCase() : "DB",
    name: f.user?.name || "Global Freelancer",
    role: f.title,
    rating: 5.0,
    reviews: Math.floor(Math.random() * 40) + 10,
    rate: `$${f.hourlyRate}/hr`,
    hourlyRateNum: f.hourlyRate || 30,
    skills: f.skills ? f.skills.split(',').map((s: string) => s.trim()) : [],
    color: "linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)",
    verified: true
  }));

  const freelancers = [...formattedDbFreelancers, ...MOCK_FREELANCERS];

  // Filter listings by search criteria
  const filteredFreelancers = freelancers.filter(f => {
    const term = searchTerm.toLowerCase();
    return f.name.toLowerCase().includes(term) || f.role.toLowerCase().includes(term) || f.skills.some(s => s.toLowerCase().includes(term));
  });

  const handleHireClick = (freelancer: FreelancerItem) => {
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

    // Fallback ID if hiring a local mock freelancer who isn't saved in the DB yet
    const targetFreelancerId = selectedFreelancer.userId || "fallback-freelancer-id";

    try {
      const response = await axios.post(`${API_BASE}/api/payments/escrow/create`, {
        userId: user?.id,
        freelancerId: targetFreelancerId,
        amount: budget,
        currency: "USD",
        milestoneName: milestoneName,
        projectTitle: `${selectedFreelancer.role} Services`
      });

      if (response.data.success) {
        setHiredSuccess(true);
        // Refresh wallet balance state
        if (walletBalance !== null) {
          setWalletBalance(prev => (prev !== null ? prev - budget : null));
        }
      }
    } catch (err: any) {
      console.error(err);
      setHireError(err.response?.data?.error || "Transaction failed. Please ensure you have sufficient available balance.");
    } finally {
      setIsHiring(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className="container">
        
        {/* Header Hero */}
        <div className={styles.header}>
          <h1 className={styles.title}>Freelancer Marketplace</h1>
          <p className={styles.subtitle}>Discover top talent perfectly matched for your next big project.</p>
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
          {filteredFreelancers.map((f, i) => (
            <div key={i} className={`glass-panel ${styles.card}`}>
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
                {f.skills.map(s => <span key={s} className={styles.skill}>{s}</span>)}
              </div>
              <div className={styles.actions}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => handleHireClick(f)}
                >
                  Hire Now
                </button>
                <button className="btn btn-secondary">Profile</button>
              </div>
            </div>
          ))}
        </div>
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
                  Milestone fund of <strong>${budget} USD</strong> is locked under platform Escrow. Work contract has been created.
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
                    disabled={isHiring || (walletBalance !== null && walletBalance < budget)}
                    style={{ flex: 2 }}
                  >
                    {isHiring ? "Authorizing Escrow..." : "Confirm & Deposit"}
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
