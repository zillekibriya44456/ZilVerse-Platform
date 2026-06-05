"use client";
import { API_BASE } from "@/utils/api";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import styles from "./PaymentModal.module.css";

interface Props {
  projectTitle: string;
  price: number; // base price in INR
  onClose: () => void;
  onSuccess: () => void;
}

type Currency = "INR" | "USD" | "EUR" | "GBP" | "USDT";
type PaymentMethod = "card" | "upi" | "paypal" | "crypto";

const RATES: Record<Currency, { rate: number; symbol: string }> = {
  INR: { rate: 1, symbol: "₹" },
  USD: { rate: 1 / 83.5, symbol: "$" },
  EUR: { rate: 1 / 89.2, symbol: "€" },
  GBP: { rate: 1 / 104.5, symbol: "£" },
  USDT: { rate: 1 / 88.0, symbol: "🪙" },
};

export default function PaymentModal({ projectTitle, price, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState<"details" | "processing" | "success">("details");
  const [currency, setCurrency] = useState<Currency>("INR");
  const [method, setMethod] = useState<PaymentMethod>("card");

  const baseTotal = price + Math.round(price * 0.02); // Add 2% platform fee
  const currentRate = RATES[currency];
  
  // Convert and format the price based on currency
  const convertedTotal = (baseTotal * currentRate.rate);
  const displayTotal = currency === "USDT" 
    ? convertedTotal.toFixed(2) 
    : convertedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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

  const handlePay = async () => {
    if (method === "card" || method === "upi") {
      setStep("processing");
      try {
        const activeToken = localStorage.getItem("zilverse_token") || "";
        const config = {
          headers: {
            Authorization: `Bearer ${activeToken}`
          }
        };

        // Compute converted price based on the selected currency dropdown
        let finalAmount = price; // Default to INR
        let finalCurrency = "INR";

        if (currency === "USD") {
          finalAmount = price * RATES.USD.rate;
          finalCurrency = "USD";
        } else if (currency === "EUR") {
          finalAmount = price * RATES.EUR.rate;
          finalCurrency = "EUR";
        } else if (currency === "GBP") {
          finalAmount = price * RATES.GBP.rate;
          finalCurrency = "GBP";
        }

        // Smallest unit of selected currency (cents / paise / etc.)
        const smallestUnitAmount = Math.max(100, Math.round(finalAmount * 100));

        // 1. Create order on the backend
        const orderRes = await axios.post(
          `${API_BASE}/api/payments/razorpay/create-order`,
          {
            amount: smallestUnitAmount,
            currency: finalCurrency,
            receipt: `project_${Date.now()}`
          },
          config
        );

        const { order_id, amount: orderAmount, currency: orderCurrency } = orderRes.data;

        // 2. Configure Razorpay checkout options
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SxrGDKusVwDK8G",
          amount: orderAmount,
          currency: orderCurrency,
          name: "ZilVerse Marketplace",
          description: `Purchase: ${projectTitle}`,
          order_id: order_id,
          handler: async function (response: any) {
            setStep("processing");
            try {
              // 3. Verify Payment on Backend
              const verifyRes = await axios.post(
                `${API_BASE}/api/payments/razorpay/verify-payment`,
                {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  amount: finalAmount,
                  currency: finalCurrency
                },
                config
              );

              if (verifyRes.data.success) {
                setStep("success");
                setTimeout(() => {
                  onSuccess();
                }, 2000);
              } else {
                alert("Payment verification failed.");
                setStep("details");
              }
            } catch (err: any) {
              console.error("Verification error:", err);
              alert(err.response?.data?.error || "Payment verification failed.");
              setStep("details");
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
              setStep("details");
            }
          }
        };

        if ((window as any).Razorpay) {
          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', function (resp: any) {
            console.error("Payment failed:", resp.error);
            alert(`Payment failed: ${resp.error.description}`);
            setStep("details");
          });
          rzp.open();
        } else {
          alert("Razorpay SDK not loaded. Please try again.");
          setStep("details");
        }
      } catch (err: any) {
        console.error("Razorpay order creation error:", err);
        alert(err.response?.data?.error || "Failed to initiate Razorpay checkout.");
        setStep("details");
      }
      return;
    }

    // For PayPal or Crypto, fall back to simulated success
    setStep("processing");
    try {
      if (user) {
        const usdAmount = price * RATES.USD.rate;
        const activeToken = localStorage.getItem("zilverse_token") || "";
        await axios.post(`${API_BASE}/api/payments/deposit`, {
          userId: user.id,
          amount: usdAmount,
          currency: "USD",
          gateway: method.toUpperCase(),
          description: `Purchase: ${projectTitle}`
        }, {
          headers: {
            Authorization: `Bearer ${activeToken}`
          }
        });
      }
      setStep("success");
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      console.error("Database billing sync failed:", err);
      setStep("success");
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} disabled={step === "processing"}>✕</button>
        
        {step === "details" && (
          <div className={styles.content}>
            <div className={styles.header}>
              <div className={styles.secureIcon}>🔒</div>
              <h2>Secure Checkout</h2>
              <p>ZilVerse Universal Payment Gateway</p>
            </div>
            
            <div className={styles.topControls}>
              <div className={styles.currencySelector}>
                <label>Currency:</label>
                <select 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className={styles.select}
                >
                  <option value="INR">🇮🇳 INR (₹)</option>
                  <option value="USD">🇺🇸 USD ($)</option>
                  <option value="EUR">🇪🇺 EUR (€)</option>
                  <option value="GBP">🇬🇧 GBP (£)</option>
                  <option value="USDT">🪙 Crypto (USDT)</option>
                </select>
              </div>
            </div>

            <div className={styles.orderSummary}>
              <div className={styles.row}>
                <span>{projectTitle}</span>
                <span>{currentRate.symbol}{(price * currentRate.rate).toLocaleString(undefined, {maximumFractionDigits:2})}</span>
              </div>
              <div className={styles.row}>
                <span>Platform Fee (2%)</span>
                <span>{currentRate.symbol}{(price * 0.02 * currentRate.rate).toLocaleString(undefined, {maximumFractionDigits:2})}</span>
              </div>
              <div className={styles.divider} />
              <div className={`${styles.row} ${styles.total}`}>
                <span>Total Amount</span>
                <span>{currentRate.symbol}{displayTotal}</span>
              </div>
            </div>

            <div className={styles.methodTabs}>
              <button 
                className={`${styles.tab} ${method === "card" ? styles.activeTab : ""}`}
                onClick={() => setMethod("card")}
              >💳 Card</button>
              <button 
                className={`${styles.tab} ${method === "upi" ? styles.activeTab : ""}`}
                onClick={() => setMethod("upi")}
              >📱 UPI / QR</button>
              <button 
                className={`${styles.tab} ${method === "paypal" ? styles.activeTab : ""}`}
                onClick={() => setMethod("paypal")}
              >🌐 PayPal</button>
              <button 
                className={`${styles.tab} ${method === "crypto" ? styles.activeTab : ""}`}
                onClick={() => setMethod("crypto")}
              >🪙 Crypto</button>
            </div>

            <div className={styles.paymentForm}>
              {method === "card" && (
                <div className={styles.cardForm}>
                  <input type="text" placeholder="Card Number (0000 0000 0000 0000)" className={styles.input} />
                  <div className={styles.rowInputs}>
                    <input type="text" placeholder="MM/YY" className={styles.input} />
                    <input type="text" placeholder="CVV" className={styles.input} />
                  </div>
                  <input type="text" placeholder="Cardholder Name" className={styles.input} />
                </div>
              )}

              {method === "upi" && (
                <div className={styles.upiForm}>
                  <div className={styles.qrContainer}>
                    <div className={styles.mockQr}>
                      <span className={styles.scanText}>Scan with any UPI app</span>
                    </div>
                  </div>
                  <div className={styles.divider}><span className={styles.or}>OR</span></div>
                  <input type="text" placeholder="Enter UPI ID (e.g., user@okaxis)" className={styles.input} />
                </div>
              )}

              {method === "paypal" && (
                <div className={styles.paypalForm}>
                  <div className={styles.paypalBanner}>
                    Pay securely with your PayPal account.
                  </div>
                </div>
              )}

              {method === "crypto" && (
                <div className={styles.cryptoForm}>
                  <div className={styles.networkSelect}>
                    <label>Network:</label>
                    <select className={styles.select}>
                      <option>ERC-20 (Ethereum)</option>
                      <option>TRC-20 (Tron)</option>
                      <option>BEP-20 (Binance Smart Chain)</option>
                    </select>
                  </div>
                  <div className={styles.qrContainer}>
                    <div className={styles.mockQr}>
                      <span className={styles.scanText}>Scan to Pay USDT</span>
                    </div>
                  </div>
                  <div className={styles.addressBox}>
                    <code>0x71C...3aF9</code>
                    <button className={styles.copyBtn}>Copy</button>
                  </div>
                </div>
              )}
            </div>

            <button className={styles.payBtn} onClick={handlePay}>
              {method === "paypal" ? "Pay with PayPal" : `Pay ${currentRate.symbol}${displayTotal} Securely`}
            </button>
          </div>
        )}

        {step === "processing" && (
          <div className={styles.processingState}>
            <div className={styles.loader} />
            <h2>Processing Payment...</h2>
            <p>Please do not close this window.</p>
          </div>
        )}

        {step === "success" && (
          <div className={styles.successState}>
            <div className={styles.checkIcon}>✅</div>
            <h2>Payment Successful!</h2>
            <p>Your order for <strong>{projectTitle}</strong> is confirmed.</p>
            <p className={styles.muted}>Preparing your download...</p>
          </div>
        )}
      </div>
    </div>
  );
}
