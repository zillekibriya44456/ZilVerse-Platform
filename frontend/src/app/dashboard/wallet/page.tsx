"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { socket } from "@/utils/socket";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
  SGD: "S$"
};

const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  SGD: 1.35
};

export default function WalletPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [escrows, setEscrows] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  // Modals state
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showEscrowModal, setShowEscrowModal] = useState(false);

  // Form states
  const [depositData, setDepositData] = useState({ amount: "", gateway: "STRIPE", description: "Wallet Deposit" });
  const [withdrawData, setWithdrawData] = useState({ amount: "", method: "BANK", details: "" });
  const [escrowData, setEscrowData] = useState({ amount: "", freelancerId: "", projectTitle: "", milestoneName: "Milestone 1" });

  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const loadData = async () => {
    if (!user) return;
    try {
      const wRes = await axios.get(`http://localhost:5002/api/payments/wallet?userId=${user.id}`);
      setWallet(wRes.data);

      const tRes = await axios.get(`http://localhost:5002/api/payments/transactions?userId=${user.id}`);
      setTransactions(tRes.data);

      const eRes = await axios.get(`http://localhost:5002/api/payments/escrows?userId=${user.id}`);
      setEscrows(eRes.data);

      const wrRes = await axios.get(`http://localhost:5002/api/payments/withdrawals?userId=${user.id}`);
      setWithdrawals(wrRes.data);

      const invRes = await axios.get(`http://localhost:5002/api/payments/invoices?userId=${user.id}`);
      setInvoices(invRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    // Detect country/currency
    const region = navigator.language;
    if (region.includes("IN") || region.includes("in")) {
      setSelectedCurrency("INR");
    } else if (region.includes("GB") || region.includes("gb")) {
      setSelectedCurrency("GBP");
    } else if (region.includes("EU") || region.includes("de") || region.includes("fr")) {
      setSelectedCurrency("EUR");
    } else if (region.includes("AE") || region.includes("ae")) {
      setSelectedCurrency("AED");
    } else if (region.includes("SG") || region.includes("sg")) {
      setSelectedCurrency("SGD");
    }

    // Connect socket listener for real-time wallet updates
    const handleWalletUpdate = () => {
      console.log("Real-time wallet update received! Refreshing data...");
      loadData();
    };

    socket.on('wallet_update', handleWalletUpdate);

    return () => {
      socket.off('wallet_update', handleWalletUpdate);
    };
  }, [user]);

  const convertAmount = (usdAmount: number) => {
    const rate = EXCHANGE_RATES[selectedCurrency] || 1.0;
    return (usdAmount * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleDeposit = async () => {
    if (!depositData.amount || parseFloat(depositData.amount) <= 0) {
      return showToast("Please enter a valid amount.");
    }
    setLoading(true);
    try {
      // Calculate USD base for backend
      const rate = EXCHANGE_RATES[selectedCurrency] || 1.0;
      const usdAmount = parseFloat(depositData.amount) / rate;

      await axios.post("http://localhost:5002/api/payments/deposit", {
        userId: user?.id,
        amount: usdAmount,
        currency: "USD",
        gateway: depositData.gateway,
        description: depositData.description
      });

      showToast(`Successfully deposited ${CURRENCY_SYMBOLS[selectedCurrency]}${depositData.amount} via ${depositData.gateway}!`);
      setShowDepositModal(false);
      setDepositData({ amount: "", gateway: "STRIPE", description: "Wallet Deposit" });
      loadData();
    } catch {
      showToast("Deposit failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawData.amount || parseFloat(withdrawData.amount) <= 0) {
      return showToast("Please enter a valid amount.");
    }
    if (!withdrawData.details) {
      return showToast("Please specify withdrawal destination/account details.");
    }
    setLoading(true);
    try {
      const rate = EXCHANGE_RATES[selectedCurrency] || 1.0;
      const usdAmount = parseFloat(withdrawData.amount) / rate;

      await axios.post("http://localhost:5002/api/payments/withdraw", {
        userId: user?.id,
        amount: usdAmount,
        currency: "USD",
        method: withdrawData.method,
        details: withdrawData.details
      });

      showToast(`Withdrawal of ${CURRENCY_SYMBOLS[selectedCurrency]}${withdrawData.amount} requested! Pending admin approval.`);
      setShowWithdrawModal(false);
      setWithdrawData({ amount: "", method: "BANK", details: "" });
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || "Withdrawal failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEscrow = async () => {
    if (!escrowData.amount || parseFloat(escrowData.amount) <= 0) {
      return showToast("Please enter a valid amount.");
    }
    if (!escrowData.freelancerId) {
      return showToast("Freelancer ID is required.");
    }
    setLoading(true);
    try {
      const rate = EXCHANGE_RATES[selectedCurrency] || 1.0;
      const usdAmount = parseFloat(escrowData.amount) / rate;

      await axios.post("http://localhost:5002/api/payments/escrow/create", {
        userId: user?.id,
        freelancerId: escrowData.freelancerId,
        amount: usdAmount,
        currency: "USD",
        milestoneName: escrowData.milestoneName,
        projectTitle: escrowData.projectTitle || "New Project Escrow"
      });

      showToast(`Escrow of ${CURRENCY_SYMBOLS[selectedCurrency]}${escrowData.amount} funded successfully!`);
      setShowEscrowModal(false);
      setEscrowData({ amount: "", freelancerId: "", projectTitle: "", milestoneName: "Milestone 1" });
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed to create escrow.");
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseEscrow = async (escrowId: string) => {
    if (!confirm("Are you sure you want to release these escrow funds to the freelancer?")) return;
    try {
      await axios.post("http://localhost:5002/api/payments/escrow/release", { escrowId });
      showToast("Escrow funds released successfully to the freelancer!");
      loadData();
    } catch {
      showToast("Failed to release escrow.");
    }
  };

  const handleDisputeEscrow = async (escrowId: string) => {
    const reason = prompt("Describe the reason for filing this dispute:");
    if (!reason) return;
    try {
      await axios.post("http://localhost:5002/api/payments/escrow/dispute", {
        escrowId,
        reason,
        raisedBy: user?.id
      });
      showToast("Dispute logged successfully. Super Admin has been notified.");
      loadData();
    } catch {
      showToast("Failed to file dispute.");
    }
  };

  const downloadReceipt = (inv: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
      <head>
        <title>ZilVerse Payment Receipt - ${inv.invoiceNumber}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 40px; }
          .receipt-box { max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 8px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #7c3aed; padding-bottom: 20px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #7c3aed; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .label { font-size: 12px; color: #777; text-transform: uppercase; }
          .val { font-size: 14px; font-weight: bold; }
          .amount-row { background: #f9f9f9; padding: 15px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: bold; }
          .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #aaa; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="header">
            <div>
              <div class="title">ZilVerse Payment Receipt</div>
              <div style="font-size: 12px; color: #666; margin-top: 4px;">Global Marketplace Ecosystem</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 14px; font-weight: bold;">${inv.invoiceNumber}</div>
              <div style="font-size: 12px; color: #888;">${new Date(inv.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
          <div class="info-grid">
            <div>
              <div class="label">Billed From</div>
              <div class="val">${inv.senderName}</div>
            </div>
            <div>
              <div class="label">Billed To</div>
              <div class="val">${inv.receiverName}</div>
            </div>
          </div>
          <div class="amount-row">
            <span>Total Paid (USD Base)</span>
            <span style="color: #7c3aed;">$${inv.amount.toFixed(2)}</span>
          </div>
          <div class="footer">
            Thank you for using ZilVerse platform.<br/>
            Contact Support: billing@zilverse.com
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{ color: "#fff", padding: "2rem" }}>
      {toast && (
        <div style={{
          position: "fixed", top: "24px", right: "24px", background: "rgba(124, 58, 237, 0.95)",
          border: "1px solid #a78bfa", color: "#fff", padding: "1rem 1.5rem", borderRadius: "14px",
          zIndex: 999999, backdropFilter: "blur(10px)", boxShadow: "0 10px 30px rgba(0,0,0,.5)",
          fontWeight: 600, fontSize: ".9rem"
        }}>
          {toast}
        </div>
      )}

      {/* Header & Region Currency */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, background: "linear-gradient(90deg, #c4b5fd, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ZilVerse Fintech Wallet
          </h1>
          <p style={{ color: "#a1a1aa", marginTop: ".25rem" }}>Safe Global Escrow, Milestones & Easy Multi-Currency Withdrawals</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: ".75rem", background: "rgba(255,255,255,.05)", padding: ".5rem 1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,.08)" }}>
          <span style={{ fontSize: ".8rem", color: "#71717a", fontWeight: 600 }}>Active Currency:</span>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            style={{ background: "none", border: "none", color: "#fff", fontWeight: 700, fontSize: ".9rem", outline: "none", cursor: "pointer" }}
          >
            <option value="USD" style={{ color: "#000" }}>USD ($)</option>
            <option value="INR" style={{ color: "#000" }}>INR (₹)</option>
            <option value="EUR" style={{ color: "#000" }}>EUR (€)</option>
            <option value="GBP" style={{ color: "#000" }}>GBP (£)</option>
            <option value="AED" style={{ color: "#000" }}>AED (د.إ)</option>
            <option value="SGD" style={{ color: "#000" }}>SGD (S$)</option>
          </select>
        </div>
      </div>

      {/* Balances Card */}
      <div style={{
        background: "linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)",
        border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "24px", padding: "2.5rem",
        display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "2rem", alignItems: "center",
        boxShadow: "0 20px 50px rgba(0,0,0,0.3)", backdropFilter: "blur(20px)",
        marginBottom: "2.5rem"
      }}>
        <div>
          <span style={{ fontSize: ".85rem", color: "#a78bfa", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 700 }}>Available Wallet Balance</span>
          <div style={{ fontSize: "3.5rem", fontWeight: 900, color: "#fff", margin: ".5rem 0" }}>
            {CURRENCY_SYMBOLS[selectedCurrency]}
            {wallet ? convertAmount(wallet.availableBalance) : "0.00"}
          </div>
          <span style={{ color: "#a1a1aa", fontSize: ".85rem" }}>Instant payout, transfers & project milestones ready</span>
        </div>

        <div style={{ borderLeft: "1px solid rgba(255,255,255,.1)", paddingLeft: "2rem" }}>
          <span style={{ fontSize: ".85rem", color: "#22d3ee", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 700 }}>Escrowed / Pending Balance</span>
          <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#e4e4e7", margin: ".5rem 0" }}>
            {CURRENCY_SYMBOLS[selectedCurrency]}
            {wallet ? convertAmount(wallet.pendingBalance) : "0.00"}
          </div>
          <span style={{ color: "#71717a", fontSize: ".85rem" }}>Secure escrow held until project milestone is approved</span>
        </div>

        <div style={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
          <button
            onClick={() => setShowDepositModal(true)}
            style={{
              background: "linear-gradient(90deg, #7c3aed, #a78bfa)", border: "none", color: "#fff",
              padding: "1rem 2rem", borderRadius: "14px", fontWeight: 700, cursor: "pointer",
              transition: "transform .2s", boxShadow: "0 8px 24px rgba(124,58,237,.3)"
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            ➕ Deposit Funds
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            style={{
              background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.15)", color: "#fff",
              padding: "1rem 2rem", borderRadius: "14px", fontWeight: 700, cursor: "pointer",
              transition: "background .2s"
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,.12)")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,.07)")}
          >
            📤 Withdraw Earnings
          </button>
          <button
            onClick={() => setShowEscrowModal(true)}
            style={{
              background: "rgba(6, 182, 212, 0.1)", border: "1px solid rgba(6, 182, 212, 0.3)", color: "#22d3ee",
              padding: "1rem 2rem", borderRadius: "14px", fontWeight: 700, cursor: "pointer"
            }}
          >
            🔒 Fund Escrow Milestone
          </button>
        </div>
      </div>

      {/* Main content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "2rem" }}>
        {/* Left Side: Escrows and Transactions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Escrow Agreements */}
          <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)", borderRadius: "20px", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.2rem", color: "#a78bfa" }}>
              🔒 Escrow Agreements & Milestones
            </h3>
            {escrows.length === 0 ? (
              <div style={{ padding: "2rem 0", textAlign: "center", color: "#52525b" }}>No active escrow contracts found.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {escrows.map((esc) => {
                  const isClient = esc.clientId === user?.id;
                  return (
                    <div key={esc.id} style={{
                      background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)",
                      borderRadius: "14px", padding: "1.2rem", display: "flex", justifyContent: "space-between",
                      alignItems: "center", flexWrap: "wrap", gap: "1rem"
                    }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".3rem" }}>
                          <span style={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}>{esc.projectTitle}</span>
                          <span style={{
                            fontSize: ".7rem", fontWeight: 700, padding: "2px 8px", borderRadius: "99px",
                            background: esc.status === "RELEASED" ? "rgba(16,185,129,.15)" : esc.status === "DISPUTED" ? "rgba(239,68,68,.15)" : "rgba(245,158,11,.15)",
                            color: esc.status === "RELEASED" ? "#34d399" : esc.status === "DISPUTED" ? "#f87171" : "#fbbf24"
                          }}>{esc.status}</span>
                        </div>
                        <p style={{ color: "#a1a1aa", fontSize: ".82rem", marginBottom: ".2rem" }}>
                          Milestone: <strong>{esc.milestoneName}</strong>
                        </p>
                        <p style={{ color: "#71717a", fontSize: ".78rem" }}>
                          {isClient ? `Freelancer: ${esc.freelancer?.name || 'Partner'}` : `Client: ${esc.client?.name || 'Client'}`}
                        </p>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                        <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "#22d3ee" }}>
                          {CURRENCY_SYMBOLS[selectedCurrency]}{convertAmount(esc.amount)}
                        </span>
                        {isClient && esc.status === "HELD" && (
                          <div style={{ display: "flex", gap: ".5rem" }}>
                            <button
                              onClick={() => handleReleaseEscrow(esc.id)}
                              style={{ background: "rgba(16,185,129,.15)", border: "1px solid rgba(16,185,129,.3)", color: "#34d399", padding: ".4rem .8rem", borderRadius: "8px", fontSize: ".8rem", cursor: "pointer", fontWeight: 600 }}
                            >
                              Release
                            </button>
                            <button
                              onClick={() => handleDisputeEscrow(esc.id)}
                              style={{ background: "rgba(239,68,68,.15)", border: "1px solid rgba(239,68,68,.3)", color: "#f87171", padding: ".4rem .8rem", borderRadius: "8px", fontSize: ".8rem", cursor: "pointer", fontWeight: 600 }}
                            >
                              Dispute
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Transactions Log */}
          <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)", borderRadius: "20px", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.2rem", color: "#a78bfa" }}>
              📊 Transaction Ledger
            </h3>
            {transactions.length === 0 ? (
              <div style={{ padding: "2rem 0", textAlign: "center", color: "#52525b" }}>No ledger records found.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,.08)", color: "#71717a", fontSize: ".8rem" }}>
                      <th style={{ padding: "1rem 0" }}>Ledger Type</th>
                      <th>Gateway/Method</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th style={{ textAlign: "right" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: "1px solid rgba(255,255,255,.04)", fontSize: ".85rem" }}>
                        <td style={{ padding: "1rem 0", fontWeight: 600 }}>{tx.type}</td>
                        <td style={{ color: "#a1a1aa" }}>{tx.gateway}</td>
                        <td>
                          <span style={{
                            padding: "2px 8px", borderRadius: "4px", fontSize: ".7rem", fontWeight: 700,
                            background: tx.status === "COMPLETED" ? "rgba(16,185,129,.1)" : tx.status === "PENDING" ? "rgba(245,158,11,.1)" : "rgba(239,68,68,.1)",
                            color: tx.status === "COMPLETED" ? "#34d399" : tx.status === "PENDING" ? "#fbbf24" : "#f87171"
                          }}>{tx.status}</span>
                        </td>
                        <td style={{ color: "#71717a" }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: tx.type === "DEPOSIT" || tx.type === "ESCROW_RELEASE" ? "#34d399" : "#f87171" }}>
                          {tx.type === "DEPOSIT" || tx.type === "ESCROW_RELEASE" ? "+" : "-"}
                          {CURRENCY_SYMBOLS[selectedCurrency]}{convertAmount(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Withdrawals & Invoices */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Withdrawal Requests list */}
          <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)", borderRadius: "20px", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.2rem", color: "#a78bfa" }}>
              💸 Withdrawal Approvals
            </h3>
            {withdrawals.length === 0 ? (
              <div style={{ padding: "2rem 0", textAlign: "center", color: "#52525b" }}>No withdrawals submitted.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: ".8rem" }}>
                {withdrawals.map((wr) => (
                  <div key={wr.id} style={{
                    background: "rgba(0,0,0,.2)", border: "1px solid rgba(255,255,255,.04)",
                    borderRadius: "12px", padding: "1rem", display: "flex", justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <div style={{ color: "#fff", fontWeight: 700, fontSize: ".85rem" }}>{wr.method} Withdrawal</div>
                      <div style={{ color: "#71717a", fontSize: ".75rem", marginTop: ".1rem" }}>{new Date(wr.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#fff", fontWeight: 700 }}>
                        {CURRENCY_SYMBOLS[selectedCurrency]}{convertAmount(wr.amount)}
                      </div>
                      <span style={{
                        fontSize: ".7rem", fontWeight: 700,
                        color: wr.status === "APPROVED" ? "#34d399" : wr.status === "PENDING" ? "#fbbf24" : "#f87171"
                      }}>{wr.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoices List */}
          <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)", borderRadius: "20px", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.2rem", color: "#a78bfa" }}>
              🧾 Invoices & Receipts
            </h3>
            {invoices.length === 0 ? (
              <div style={{ padding: "2rem 0", textAlign: "center", color: "#52525b" }}>No invoices generated.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: ".8rem" }}>
                {invoices.map((inv) => (
                  <div key={inv.id} style={{
                    background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.04)",
                    borderRadius: "12px", padding: "1rem", display: "flex", justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <div style={{ color: "#fff", fontWeight: 600, fontSize: ".82rem" }}>{inv.invoiceNumber}</div>
                      <div style={{ color: "#71717a", fontSize: ".75rem" }}>To: {inv.receiverName}</div>
                    </div>
                    <button
                      onClick={() => downloadReceipt(inv)}
                      style={{ background: "none", border: "1px solid rgba(139,92,246,.4)", color: "#a78bfa", padding: ".3rem .6rem", borderRadius: "6px", fontSize: ".75rem", cursor: "pointer", fontWeight: 600 }}
                    >
                      Print/PDF
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DEPOSIT MODAL */}
      {showDepositModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999 }}>
          <div style={{ background: "rgba(9,9,11,.98)", border: "1px solid rgba(139,92,246,.4)", borderRadius: "20px", padding: "2rem", width: "450px", maxWidth: "90%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "1.2rem" }}>Deposit Funds</h3>
              <button onClick={() => setShowDepositModal(false)} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <div>
                <label style={{ display: "block", color: "#a1a1aa", fontSize: ".85rem", marginBottom: ".4rem" }}>Select Gateway</label>
                <select
                  value={depositData.gateway}
                  onChange={(e) => setDepositData({ ...depositData, gateway: e.target.value })}
                  style={{ width: "100%", padding: ".8rem", borderRadius: "10px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none" }}
                >
                  <option value="STRIPE" style={{ color: "#000" }}>Stripe (Visa/Mastercard)</option>
                  <option value="PAYPAL" style={{ color: "#000" }}>PayPal Balance</option>
                  <option value="RAZORPAY" style={{ color: "#000" }}>Razorpay (India UPI/Card)</option>
                  <option value="UPI" style={{ color: "#000" }}>UPI Direct QR</option>
                  <option value="WISE" style={{ color: "#000" }}>Wise Global Transfer</option>
                  <option value="PAYONEER" style={{ color: "#000" }}>Payoneer Global Wallet</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", color: "#a1a1aa", fontSize: ".85rem", marginBottom: ".4rem" }}>Amount ({selectedCurrency})</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#71717a", fontWeight: 700 }}>
                    {CURRENCY_SYMBOLS[selectedCurrency]}
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={depositData.amount}
                    onChange={(e) => setDepositData({ ...depositData, amount: e.target.value })}
                    style={{ width: "100%", padding: ".8rem .8rem .8rem 2.2rem", borderRadius: "10px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", color: "#a1a1aa", fontSize: ".85rem", marginBottom: ".4rem" }}>Description</label>
                <input
                  type="text"
                  placeholder="e.g. Project Escrow Deposit"
                  value={depositData.description}
                  onChange={(e) => setDepositData({ ...depositData, description: e.target.value })}
                  style={{ width: "100%", padding: ".8rem", borderRadius: "10px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none" }}
                />
              </div>

              <button
                onClick={handleDeposit}
                disabled={loading}
                style={{ background: "linear-gradient(90deg, #7c3aed, #a78bfa)", border: "none", color: "#fff", padding: "1rem", borderRadius: "12px", fontWeight: 700, cursor: "pointer", marginTop: ".5rem" }}
              >
                {loading ? "Processing..." : "Complete Simulated Deposit →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}
      {showWithdrawModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999 }}>
          <div style={{ background: "rgba(9,9,11,.98)", border: "1px solid rgba(139,92,246,.4)", borderRadius: "20px", padding: "2rem", width: "450px", maxWidth: "90%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "1.2rem" }}>Withdraw Earnings</h3>
              <button onClick={() => setShowWithdrawModal(false)} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <div>
                <label style={{ display: "block", color: "#a1a1aa", fontSize: ".85rem", marginBottom: ".4rem" }}>Withdrawal Method</label>
                <select
                  value={withdrawData.method}
                  onChange={(e) => setWithdrawData({ ...withdrawData, method: e.target.value })}
                  style={{ width: "100%", padding: ".8rem", borderRadius: "10px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none" }}
                >
                  <option value="BANK" style={{ color: "#000" }}>Direct Bank Transfer (Local/Global)</option>
                  <option value="PAYPAL" style={{ color: "#000" }}>PayPal Account</option>
                  <option value="PAYONEER" style={{ color: "#000" }}>Payoneer ID</option>
                  <option value="UPI" style={{ color: "#000" }}>UPI ID Address</option>
                  <option value="WISE" style={{ color: "#000" }}>Wise Transfer Email</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", color: "#a1a1aa", fontSize: ".85rem", marginBottom: ".4rem" }}>Amount ({selectedCurrency})</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#71717a", fontWeight: 700 }}>
                    {CURRENCY_SYMBOLS[selectedCurrency]}
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={withdrawData.amount}
                    onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                    style={{ width: "100%", padding: ".8rem .8rem .8rem 2.2rem", borderRadius: "10px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", color: "#a1a1aa", fontSize: ".85rem", marginBottom: ".4rem" }}>Account/Destination Details</label>
                <textarea
                  placeholder="e.g. Account Number, IBAN, Swift Code or Email/UPI address"
                  value={withdrawData.details}
                  onChange={(e) => setWithdrawData({ ...withdrawData, details: e.target.value })}
                  style={{ width: "100%", padding: ".8rem", borderRadius: "10px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none", height: "80px", resize: "none" }}
                />
              </div>

              <button
                onClick={handleWithdraw}
                disabled={loading}
                style={{ background: "linear-gradient(90deg, #7c3aed, #a78bfa)", border: "none", color: "#fff", padding: "1rem", borderRadius: "12px", fontWeight: 700, cursor: "pointer", marginTop: ".5rem" }}
              >
                {loading ? "Processing..." : "Submit Withdrawal Request →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ESCROW MODAL */}
      {showEscrowModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999 }}>
          <div style={{ background: "rgba(9,9,11,.98)", border: "1px solid rgba(139,92,246,.4)", borderRadius: "20px", padding: "2rem", width: "450px", maxWidth: "90%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "1.2rem" }}>Fund Project Escrow</h3>
              <button onClick={() => setShowEscrowModal(false)} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <div>
                <label style={{ display: "block", color: "#a1a1aa", fontSize: ".85rem", marginBottom: ".4rem" }}>Freelancer ID</label>
                <input
                  type="text"
                  placeholder="Copy and Paste User ID"
                  value={escrowData.freelancerId}
                  onChange={(e) => setEscrowData({ ...escrowData, freelancerId: e.target.value })}
                  style={{ width: "100%", padding: ".8rem", borderRadius: "10px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", color: "#a1a1aa", fontSize: ".85rem", marginBottom: ".4rem" }}>Project Title</label>
                <input
                  type="text"
                  placeholder="e.g. AI SaaS Application Development"
                  value={escrowData.projectTitle}
                  onChange={(e) => setEscrowData({ ...escrowData, projectTitle: e.target.value })}
                  style={{ width: "100%", padding: ".8rem", borderRadius: "10px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", color: "#a1a1aa", fontSize: ".85rem", marginBottom: ".4rem" }}>Milestone Title</label>
                <input
                  type="text"
                  placeholder="e.g. Wireframe & Design Sign-off"
                  value={escrowData.milestoneName}
                  onChange={(e) => setEscrowData({ ...escrowData, milestoneName: e.target.value })}
                  style={{ width: "100%", padding: ".8rem", borderRadius: "10px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", color: "#a1a1aa", fontSize: ".85rem", marginBottom: ".4rem" }}>Amount ({selectedCurrency})</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#71717a", fontWeight: 700 }}>
                    {CURRENCY_SYMBOLS[selectedCurrency]}
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={escrowData.amount}
                    onChange={(e) => setEscrowData({ ...escrowData, amount: e.target.value })}
                    style={{ width: "100%", padding: ".8rem .8rem .8rem 2.2rem", borderRadius: "10px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none" }}
                  />
                </div>
              </div>

              <button
                onClick={handleCreateEscrow}
                disabled={loading}
                style={{ background: "linear-gradient(90deg, #7c3aed, #a78bfa)", border: "none", color: "#fff", padding: "1rem", borderRadius: "12px", fontWeight: 700, cursor: "pointer", marginTop: ".5rem" }}
              >
                {loading ? "Processing..." : "Initiate & Hold Escrow Milestone →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
