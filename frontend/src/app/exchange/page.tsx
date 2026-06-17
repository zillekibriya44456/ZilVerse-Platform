"use client";
import { API_BASE } from "@/utils/api";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { SKILL_TRADES, IMPACT_PROJECTS } from "@/data/exchange";
import styles from "./exchange.module.css";

type Tab = "Skills" | "Impact";

export default function ExchangePage() {
  const [activeTab, setActiveTab] = useState<Tab>("Skills");
  const [dbTrades, setDbTrades] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTrade, setNewTrade] = useState({ title: '', description: '', assetType: 'Skill Exchange', price: '0' });
  const [isUploading, setIsUploading] = useState(false);

  // Proposal Modal State
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [proposalMessage, setProposalMessage] = useState('');
  const [isProposing, setIsProposing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    axios.get(`${API_BASE}/api/exchange`)
      .then(res => {
        const raw = res.data?.data ?? res.data;
        setDbTrades(Array.isArray(raw) ? raw : []);
      })
      .catch(err => console.error("Failed to fetch exchange listings", err));
  }, []);

  const handlePostTrade = async () => {
    setIsUploading(true);
    try {
      await axios.post(`${API_BASE}/api/exchange/create`, newTrade);
      setIsModalOpen(false);
      const res = await axios.get(`${API_BASE}/api/exchange`);
      const raw = res.data?.data ?? res.data;
      setDbTrades(Array.isArray(raw) ? raw : []);

    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleProposeClick = (tradeId: string) => {
    setSelectedTradeId(tradeId);
    setIsProposeModalOpen(true);
  };

  const handleProposeSubmit = async () => {
    setIsProposing(true);
    try {
      await axios.post(`${API_BASE}/api/exchange/propose`, {
        listingId: selectedTradeId,
        message: proposalMessage
      });
      setIsProposeModalOpen(false);
      setToastMessage("Trade proposal sent successfully!");
      setProposalMessage('');
    } catch (err) {
      console.error(err);
      setToastMessage("Failed to send proposal. Check console for details.");
    } finally {
      setIsProposing(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const formattedDbTrades = dbTrades.map(trade => ({
    id: trade.id,
    userName: trade.seller?.name || "Anonymous",
    userCountry: "Global",
    userFlag: "🌐",
    image: trade.seller?.avatar || "/default-avatar.png",
    offering: trade.title,
    seeking: trade.description
  }));

  const TRADES = [...formattedDbTrades, ...SKILL_TRADES];

  return (
    <div className={styles.page}>
      {toastMessage && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#10b981', color: '#fff', padding: '1rem', borderRadius: '8px', zIndex: 9999999 }}>
          {toastMessage}
        </div>
      )}
      <div className={styles.header}>
        <div className="container">
          <div className={styles.badgeLabel}>Global Collaboration Hub</div>
          <h1>Trade Skills. Make an Impact.</h1>
          <p>Learn unique cultural trades from locals, or collaborate on global social projects.</p>

          <div className={styles.tabContainer}>
            <button
              className={`${styles.tabBtn} ${activeTab === "Skills" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("Skills")}
            >
              🔄 Skills Exchange
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === "Impact" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("Impact")}
            >
              🌍 Impact Projects
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {activeTab === "Skills" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Two-Way Cultural Learning</h2>
              <p>Offer a skill you master in exchange for something you want to learn.</p>
              <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Post a Trade Offer</button>
            </div>

            <div className={styles.grid}>
              {TRADES.map((trade) => (
                <div key={trade.id} className={`glass-panel ${styles.tradeCard}`}>
                  <div className={styles.tradeUser}>
                    <div className={styles.avatarWrapper}>
                      <Image src={trade.image} alt={trade.userName} fill className={styles.avatar} />
                    </div>
                    <div>
                      <h3>{trade.userName}</h3>
                      <p>{trade.userFlag} {trade.userCountry}</p>
                    </div>
                  </div>
                  
                  <div className={styles.tradeDetails}>
                    <div className={styles.tradeBlock}>
                      <span className={styles.tradeLabel}>Will Teach:</span>
                      <p className={styles.offering}>{trade.offering}</p>
                    </div>
                    <div className={styles.tradeDivider}>🔄</div>
                    <div className={styles.tradeBlock}>
                      <span className={styles.tradeLabel}>Seeking:</span>
                      <p className={styles.seeking}>{trade.seeking}</p>
                    </div>
                  </div>

                  <button className={`btn btn-secondary ${styles.fullBtn}`} onClick={() => handleProposeClick(String(trade.id))}>Propose Trade</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Impact" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Global Social Collaboration</h2>
              <p>Join forces with developers and creators worldwide to solve real problems.</p>
              <button className="btn btn-primary">Start a Project</button>
            </div>

            <div className={styles.projectGrid}>
              {IMPACT_PROJECTS.map((project) => (
                <div key={project.id} className={`glass-panel ${styles.projectCard}`}>
                  <div className={styles.projectHeader}>
                    <h3>{project.title}</h3>
                    <span className={styles.regionBadge}>📍 {project.region}</span>
                  </div>
                  <p className={styles.projectDesc}>{project.description}</p>
                  
                  <div className={styles.projectMeta}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Organizer</span>
                      <span className={styles.metaValue}>{project.organizer}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Participants</span>
                      <span className={styles.metaValue}>👥 {project.participants}</span>
                    </div>
                  </div>

                  <div className={styles.tagsContainer}>
                    {project.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                  </div>

                  <button className={`btn btn-primary ${styles.fullBtn}`}>Join Project</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', padding: '2rem', borderRadius: '16px', border: '1px solid #333', width: '90%', maxWidth: '500px' }}>
            <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Post a Trade Offer</h2>
            <input 
              type="text" 
              placeholder="Will Teach (e.g. Next.js, Python)" 
              value={newTrade.title}
              onChange={(e) => setNewTrade({...newTrade, title: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
            />
            <input 
              type="text" 
              placeholder="Seeking (e.g. UI Design, Marketing)" 
              value={newTrade.description}
              onChange={(e) => setNewTrade({...newTrade, description: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1.5rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.8rem', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handlePostTrade} disabled={isUploading} style={{ flex: 1, padding: '0.8rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                {isUploading ? 'Posting...' : 'Post Offer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Propose Trade Modal */}
      {isProposeModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', padding: '2rem', borderRadius: '16px', border: '1px solid #333', width: '90%', maxWidth: '500px' }}>
            <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Propose a Trade</h2>
            <textarea 
              placeholder="Write a message explaining what you offer and why it's a fair trade..." 
              value={proposalMessage}
              onChange={(e) => setProposalMessage(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1.5rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px', minHeight: '120px' }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setIsProposeModalOpen(false)} style={{ flex: 1, padding: '0.8rem', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleProposeSubmit} disabled={isProposing} style={{ flex: 1, padding: '0.8rem', background: '#a855f7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                {isProposing ? 'Sending...' : 'Send Proposal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
