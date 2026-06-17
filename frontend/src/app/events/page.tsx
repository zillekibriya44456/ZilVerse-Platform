"use client";
import { API_BASE } from "@/utils/api";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Script from "next/script";
import axios from "axios";
import { MOCK_EVENTS, EventType, EventCategory } from "@/data/events";
import countriesList from "@/constants/countries";
import styles from "./events.module.css";
import { useAuth } from "@/context/AuthContext";

export default function EventsPage() {
  const { user, token } = useAuth();
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<EventType | "ALL">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "ALL">("ALL");
  const [registrationMessage, setRegistrationMessage] = useState<string | null>(null);

  // Submit event form state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "Workshop",
    date: "",
    location: "Online",
    description: "",
    category: "Full Stack",
    isFree: true
  });
  const [isUploading, setIsUploading] = useState(false);

  // Load events — handles both flat array and paginated {data,...}
  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/events`);
      const raw = res.data?.data ?? res.data;
      setDbEvents(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Failed to load events from DB", err);
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async (eventName: string, isFree: boolean) => {
    if (isFree) {
      setRegistrationMessage(`Successfully registered for ${eventName}! Check your email for details.`);
      setTimeout(() => setRegistrationMessage(null), 4000);
    } else {
      const activeToken = token || localStorage.getItem("zilverse_token");
      if (!activeToken) {
        alert("Please log in to register for premium events.");
        return window.location.href = "/login?redirect=/events";
      }

      try {
        setRegistrationMessage(`Registration for premium event "${eventName}" requires payment. Initiating checkout...`);
        
        const paiseAmount = 50 * 83.5 * 100; // $50 in paise
        const orderRes = await axios.post(
          `${API_BASE}/api/payments/razorpay/create-order`,
          { amount: paiseAmount, currency: "INR", receipt: `event_${Date.now()}` },
          { headers: { Authorization: `Bearer ${activeToken}` } }
        );

        const { order_id, amount: orderAmount, currency: orderCurrency } = orderRes.data;

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_Sxuhmk2KLWNZx5",
          amount: orderAmount,
          currency: orderCurrency,
          name: "ZilVerse Events",
          description: `Ticket: ${eventName}`,
          order_id: order_id,
          handler: async function (response: any) {
            try {
              setRegistrationMessage("Verifying payment...");
              await axios.post(
                `${API_BASE}/api/payments/razorpay/verify-payment`,
                {
                  ...response,
                  amount: 50,
                  currency: "USD",
                  type: "PURCHASE",
                  description: `Event Ticket: ${eventName}`
                },
                { headers: { Authorization: `Bearer ${activeToken}` } }
              );
              setRegistrationMessage(`✅ Payment successful! You are registered for ${eventName}.`);
              setTimeout(() => setRegistrationMessage(null), 5000);
            } catch (err: any) {
              setRegistrationMessage(`❌ Payment verification failed: ${err.message}`);
              setTimeout(() => setRegistrationMessage(null), 5000);
            }
          },
          theme: { color: "#7c3aed" }
        };

        if ((window as any).Razorpay) {
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } else {
          setRegistrationMessage("❌ Razorpay SDK not loaded.");
        }
      } catch (err: any) {
        setRegistrationMessage(`❌ Failed to initiate checkout: ${err.message}`);
        setTimeout(() => setRegistrationMessage(null), 4000);
      }
    }
  };

  const handleSubmitEvent = async () => {
    setIsUploading(true);
    try {
      await axios.post(`${API_BASE}/api/events/create`, newEvent);
      setIsSubmitModalOpen(false);
      setNewEvent({
        title: "",
        type: "Workshop",
        date: "",
        location: "Online",
        description: "",
        category: "Full Stack",
        isFree: true
      });
      fetchEvents();
      setRegistrationMessage("Event submitted successfully!");
      setTimeout(() => setRegistrationMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setRegistrationMessage("Failed to submit event.");
      setTimeout(() => setRegistrationMessage(null), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  // Convert db events to the page's model
  const formattedDbEvents = dbEvents.map(e => ({
    id: e.id,
    title: e.title,
    organizer: "ZilVerse Partner",
    date: e.date || "TBD",
    location: e.location || "Online",
    countryCode: (e.location || "").toLowerCase().includes("online") ? "WW" : "US",
    type: (e.type || "Workshop") as EventType,
    category: (e.category || "Full Stack") as EventCategory,
    participantsCount: 150,
    image: "/avatars/avatar_1.png",
    description: e.description || "No description provided.",
    isFree: e.isFree !== undefined ? e.isFree : true
  }));


  const ALL_EVENTS = [...formattedDbEvents, ...MOCK_EVENTS];

  // Derive unique categories and types for the filter UI
  const uniqueTypes = Array.from(new Set(ALL_EVENTS.map(e => e.type)));
  const uniqueCategories = Array.from(new Set(ALL_EVENTS.map(e => e.category)));

  // Filter Logic
  const filteredEvents = useMemo(() => {
    return ALL_EVENTS.filter((event) => {
      const matchCountry = selectedCountry === "ALL" || event.countryCode === selectedCountry;
      const matchType = selectedType === "ALL" || event.type === selectedType;
      const matchCategory = selectedCategory === "ALL" || event.category === selectedCategory;
      return matchCountry && matchType && matchCategory;
    });
  }, [selectedCountry, selectedType, selectedCategory, dbEvents]);

  return (
    <div className={styles.page} style={{ paddingTop: "120px" }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {/* Registration Toast */}
      {registrationMessage && (
        <div className={styles.toast}>
          {registrationMessage}
        </div>
      )}

      {/* Hero Section */}
      <div className={styles.header}>
        <div className="container">
          <div className={styles.badgeLabel}>Global Hub</div>
          <h1>Events & Hackathons</h1>
          <p>Discover tech conferences, participate in global hackathons, and expand your network.</p>
          <div className={styles.heroActions}>
            <button className="btn btn-primary" onClick={() => setIsSubmitModalOpen(true)}>Submit an Event</button>
            <button className="btn btn-secondary" onClick={() => {
              setSelectedCountry("ALL");
              setSelectedType("ALL");
              setSelectedCategory("ALL");
            }}>Explore All</button>
          </div>
        </div>
      </div>

      <div className={`container ${styles.layout}`}>
        {/* Sidebar Filters */}
        <aside className={styles.sidebar}>
          <div className={`glass-panel ${styles.filterPanel}`}>
            <h3>Filters</h3>
            
            <div className={styles.filterGroup}>
              <label>Location</label>
              <select 
                className={styles.filterSelect}
                value={selectedCountry} 
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                <option value="ALL">🌍 Everywhere</option>
                <option value="WW">🌐 Online Only</option>
                {countriesList.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Event Type</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input type="radio" checked={selectedType === "ALL"} onChange={() => setSelectedType("ALL")} />
                  All Types
                </label>
                {uniqueTypes.map(type => (
                  <label key={type} className={styles.radioLabel}>
                    <input type="radio" checked={selectedType === type} onChange={() => setSelectedType(type as EventType)} />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label>Category</label>
              <div className={styles.pillsContainer}>
                <button 
                  className={`${styles.pill} ${selectedCategory === "ALL" ? styles.activePill : ""}`}
                  onClick={() => setSelectedCategory("ALL")}
                >
                  All
                </button>
                {uniqueCategories.map(cat => (
                  <button 
                    key={cat}
                    className={`${styles.pill} ${selectedCategory === cat ? styles.activePill : ""}`}
                    onClick={() => setSelectedCategory(cat as EventCategory)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            <button className={`btn btn-secondary ${styles.resetBtn}`} onClick={() => {
              setSelectedCountry("ALL");
              setSelectedType("ALL");
              setSelectedCategory("ALL");
            }}>
              Reset Filters
            </button>
          </div>
        </aside>

        {/* Event Grid */}
        <main className={styles.mainContent}>
          <div className={styles.resultsHeader}>
            <h2>Showing {filteredEvents.length} Events</h2>
          </div>

          {filteredEvents.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <h3>No events found</h3>
              <p>Try adjusting your filters or check back later for new events.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredEvents.map((event) => (
                <div key={event.id} className={`glass-panel ${styles.eventCard}`}>
                  <div className={styles.eventImageWrapper}>
                    <div className={styles.eventTypeBadge}>{event.type}</div>
                    <Image src={event.image || "/avatars/avatar_1.png"} alt={event.title} fill className={styles.eventImage} />
                  </div>
                  
                  <div className={styles.eventContent}>
                    <div className={styles.eventDate}>{event.date}</div>
                    <h3 className={styles.eventTitle}>{event.title}</h3>
                    <p className={styles.eventOrg}>By {event.organizer}</p>
                    
                    <div className={styles.eventMeta}>
                      <span>📍 {event.location}</span>
                      <span>👥 {event.participantsCount.toLocaleString()} attending</span>
                      <span className={styles.categoryTag}>{event.category}</span>
                    </div>
                    
                    <p className={styles.eventDesc}>{event.description}</p>
                    
                    <div className={styles.eventFooter}>
                      <span className={event.isFree ? styles.freeLabel : styles.premiumLabel}>
                        {event.isFree ? "Free to Attend" : "Premium Event"}
                      </span>
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleRegister(event.title, event.isFree)}
                      >
                        Register Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* SUBMIT EVENT MODAL */}
      {isSubmitModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#111", padding: "2rem", borderRadius: "16px", border: "1px solid #333", width: "90%", maxWidth: "500px" }}>
            <h2 style={{ color: "#fff", marginBottom: "1.5rem" }}>Submit a Tech Event</h2>
            <input 
              type="text" 
              placeholder="Event Title" 
              value={newEvent.title}
              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              style={{ width: "100%", padding: "0.8rem", marginBottom: "1rem", background: "#000", border: "1px solid #333", color: "#fff", borderRadius: "8px" }}
            />
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                style={{ flex: 1, padding: "0.8rem", background: "#000", border: "1px solid #333", color: "#fff", borderRadius: "8px" }}
              >
                <option>Workshop</option>
                <option>Hackathon</option>
                <option>Conference</option>
                <option>Meetup</option>
              </select>
              <select
                value={newEvent.category}
                onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                style={{ flex: 1, padding: "0.8rem", background: "#000", border: "1px solid #333", color: "#fff", borderRadius: "8px" }}
              >
                <option>AI & ML</option>
                <option>Web3</option>
                <option>Design</option>
                <option>Full Stack</option>
                <option>Open Source</option>
                <option>Cybersecurity</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <input 
                type="text" 
                placeholder="Date (e.g. June 25, 2026)" 
                value={newEvent.date}
                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                style={{ flex: 1, padding: "0.8rem", background: "#000", border: "1px solid #333", color: "#fff", borderRadius: "8px" }}
              />
              <input 
                type="text" 
                placeholder="Location (e.g. Online, Tokyo)" 
                value={newEvent.location}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                style={{ flex: 1, padding: "0.8rem", background: "#000", border: "1px solid #333", color: "#fff", borderRadius: "8px" }}
              />
            </div>
            <textarea 
              placeholder="Short Description of the Event" 
              value={newEvent.description}
              onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              style={{ width: "100%", padding: "0.8rem", marginBottom: "1.5rem", background: "#000", border: "1px solid #333", color: "#fff", borderRadius: "8px", minHeight: "80px" }}
            />
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={() => setIsSubmitModalOpen(false)} style={{ flex: 1, padding: "0.8rem", background: "#333", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSubmitEvent} disabled={isUploading} style={{ flex: 1, padding: "0.8rem", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                {isUploading ? "Uploading..." : "Submit Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
