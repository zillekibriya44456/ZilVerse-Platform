"use client";
import { API_BASE } from "@/utils/api";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { 
  MOCK_GRANTS, 
  MOCK_PROGRESS, 
  MOCK_MENTORS, 
  MOCK_JOURNAL 
} from "@/data/fund";
import PaymentModal from "@/components/PaymentModal";
import styles from "./fund.module.css";
import { useAuth } from "@/context/AuthContext";

type Tab = "Grants" | "Progress" | "Mentors" | "Journal" | "Matching";

export default function FundHubPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("Grants");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Database State
  const [dbGrants, setDbGrants] = useState<any[]>([]);
  const [matchedGrants, setMatchedGrants] = useState<any[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [pitchFile, setPitchFile] = useState<File | null>(null);
  
  const [newGrant, setNewGrant] = useState({ 
    title: '', 
    organization: '', 
    amount: '10000', 
    description: '', 
    deadline: 'Rolling',
    website: '',
    stage: 'MVP',
    sector: 'SaaS'
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/api/funds`)
      .then(res => {
        const raw = res.data?.data ?? res.data;
        setDbGrants(Array.isArray(raw) ? raw : []);
      })
      .catch(err => console.error("Failed to load DB grants", err));
  }, []);

  useEffect(() => {
    const activeToken = token || localStorage.getItem("zilverse_token");
    if (activeToken) {
      axios.get(`${API_BASE}/api/funds/investor-matches`, {
        headers: { Authorization: `Bearer ${activeToken}` }
      })
      .then(res => {
        setMatchedGrants(res.data);
      })
      .catch(err => console.error("Failed to load investor matches", err));
    }
  }, [token]);

  const handlePostGrant = async () => {
    setIsUploading(true);
    try {
      const activeToken = token || localStorage.getItem("zilverse_token");
      const createRes = await axios.post(`${API_BASE}/api/funds/create`, {
        title: newGrant.title,
        organization: newGrant.organization,
        amount: newGrant.amount,
        description: newGrant.description,
        deadline: newGrant.deadline,
        website: newGrant.website,
        stage: newGrant.stage,
        sector: newGrant.sector,
        targetAmount: parseFloat(newGrant.amount)
      }, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });

      const createdId = createRes.data.id;

      if (pitchFile && createdId) {
        const formData = new FormData();
        formData.append('pitch', pitchFile);
        
        await axios.post(`${API_BASE}/api/funds/${createdId}/pitch`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${activeToken}`
          }
        });
      }

      setToastMessage("Successfully created your Grant Pitch on the global network!");
      setIsUploadModalOpen(false);
      setPitchFile(null);
      setNewGrant({ 
        title: '', 
        organization: '', 
        amount: '10000', 
        description: '', 
        deadline: 'Rolling',
        website: '',
        stage: 'MVP',
        sector: 'SaaS'
      });

      const res = await axios.get(`${API_BASE}/api/funds`);
      const raw = res.data?.data ?? res.data;
      setDbGrants(Array.isArray(raw) ? raw : []);

    } catch (err: any) {
      setToastMessage("Error posting grant: " + (err.response?.data?.error || err.message));
    } finally {
      setIsUploading(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleExpressInterest = async (grantId: string, title: string) => {
    try {
      const activeToken = token || localStorage.getItem("zilverse_token");
      await axios.post(`${API_BASE}/api/funds/${grantId}/interest`, {}, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      setToastMessage(`Successfully expressed interest in "${title}"! The creator has been notified.`);
      
      // Refresh matched grants
      if (activeToken) {
        const matchRes = await axios.get(`${API_BASE}/api/funds/investor-matches`, {
          headers: { Authorization: `Bearer ${activeToken}` }
        });
        setMatchedGrants(matchRes.data);
      }
    } catch (err: any) {
      alert("Failed to express interest: " + (err.response?.data?.error || err.message));
    } finally {
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const formattedDbGrants = dbGrants.map(g => ({
    id: g.id,
    title: g.title,
    startupName: g.organization,
    category: g.sector || "General",
    sustainabilityScore: g.stage === 'Idea' ? 75 : g.stage === 'MVP' ? 88 : 95,
    description: g.description,
    currentFunding: g.raisedAmount || 0,
    fundingGoal: g.targetAmount || parseInt(g.amount) || 10000,
    pitchDeck: g.pitchDeck,
    website: g.website,
    stage: g.stage,
    upvotes: 5,
    investorId: g.investorId
  }));

  const GRANTS = [...formattedDbGrants, ...MOCK_GRANTS.map(mg => ({ ...mg, pitchDeck: null, website: null, stage: "MVP", investorId: null }))];

  const handleUpvote = (title: string) => {
    setToastMessage(`You upvoted "${title}". Community ranking increased!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleInvestClick = (title: string) => {
    setSelectedGrant(title);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    setToastMessage(`Successfully invested in "${selectedGrant}"! Tokens transferred.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleMentorMatch = (name: string) => {
    setToastMessage(`Match requested with ${name}. The AI is processing your profile.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className={styles.page}>
      {toastMessage && <div className={styles.toast}>{toastMessage}</div>}

      {isPaymentOpen && selectedGrant && (
        <PaymentModal
          projectTitle={`Token Investment: ${selectedGrant}`}
          price={100}
          onClose={() => setIsPaymentOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Hero Section */}
      <div className={styles.header}>
        <div className="container">
          <div className={styles.badgeLabel}>Global Innovation Ecosystem</div>
          <h1>Grants & Fund Hub</h1>
          <p>Invest in sustainable startups, track live progress, and match with world-class mentors.</p>

          <div className={styles.tabContainer}>
            <button className={`${styles.tabBtn} ${activeTab === "Grants" ? styles.activeTab : ""}`} onClick={() => setActiveTab("Grants")}>
              💰 Micro-Grants
            </button>
            <button className={`${styles.tabBtn} ${activeTab === "Matching" ? styles.activeTab : ""}`} onClick={() => setActiveTab("Matching")}>
              ✨ AI Matchmaking
            </button>
            <button className={`${styles.tabBtn} ${activeTab === "Progress" ? styles.activeTab : ""}`} onClick={() => setActiveTab("Progress")}>
              📈 Live Progress
            </button>
            <button className={`${styles.tabBtn} ${activeTab === "Mentors" ? styles.activeTab : ""}`} onClick={() => setActiveTab("Mentors")}>
              🧠 Mentors
            </button>
            <button className={`${styles.tabBtn} ${activeTab === "Journal" ? styles.activeTab : ""}`} onClick={() => setActiveTab("Journal")}>
              📰 Journal & Summit
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        
        {/* TAB 1: Micro-Grants & Voting */}
        {activeTab === "Grants" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Fund the Future</h2>
              <p>Vote for your favorite ideas or provide tokenized micro-grants to kickstart innovation.</p>
              <button className="btn btn-primary" onClick={() => setIsUploadModalOpen(true)}>Post a Project</button>
            </div>
            
            <div className={styles.grid}>
              {GRANTS.map((grant) => {
                const progressPercent = Math.min(100, Math.round((grant.currentFunding / grant.fundingGoal) * 100));
                
                return (
                  <div key={grant.id} className={`glass-panel ${styles.card}`}>
                    <div className={styles.cardHeader}>
                      <span className={styles.categoryBadge}>{grant.category}</span>
                      <div className={styles.scoreBox} title="Sustainability Impact Score">
                        <span className={styles.scoreLabel}>Impact</span>
                        <span className={styles.scoreValue}>{grant.sustainabilityScore}</span>
                      </div>
                    </div>
                    
                    <h3>{grant.title}</h3>
                    <p className={styles.startupName}>by {grant.startupName} {grant.stage && `• ${grant.stage}`}</p>
                    <p className={styles.desc}>{grant.description}</p>
                    
                    {grant.pitchDeck && (
                      <div style={{ margin: '0.8rem 0', display: 'flex', gap: '0.5rem' }}>
                        <a 
                          href={`${API_BASE}${grant.pitchDeck}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'underline' }}
                        >
                          📄 View Pitch Deck
                        </a>
                        {grant.website && (
                          <a 
                            href={grant.website.startsWith('http') ? grant.website : `https://${grant.website}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            style={{ fontSize: '0.8rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'underline' }}
                          >
                            🌐 Website
                          </a>
                        )}
                      </div>
                    )}

                    <div className={styles.fundingData}>
                      <div className={styles.fundHeader}>
                        <span>${grant.currentFunding.toLocaleString()} raised</span>
                        <span>Goal: ${grant.fundingGoal.toLocaleString()}</span>
                      </div>
                      <div className={styles.progressBarBg}>
                        <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }}></div>
                      </div>
                    </div>
                    
                    <div className={styles.cardFooter}>
                      <button className={`btn btn-secondary ${styles.voteBtn}`} onClick={() => handleUpvote(grant.title)}>
                        👍 {grant.upvotes}
                      </button>
                      <button className="btn btn-primary" onClick={() => handleInvestClick(grant.title)}>
                        Invest Tokens
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: AI Matchmaking Dashboard */}
        {activeTab === "Matching" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Investor Smart Dashboard</h2>
              <p>AI matchmaking powered by ZilVerse algorithms. High-quality startup pitches curated for your investment criteria.</p>
            </div>

            {matchedGrants.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#18181b', borderRadius: '12px', border: '1px solid #27272a' }}>
                <span style={{ fontSize: '2.5rem' }}>✨</span>
                <h3 style={{ color: '#fff', marginTop: '1rem' }}>No Matches Found Yet</h3>
                <p style={{ color: '#71717a' }}>Pitches will appear here as startups post their investment requests on the ZilVerse network.</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {matchedGrants.map((grant) => (
                  <div key={grant.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {grant.sector || 'General'}
                      </span>
                      <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {grant.matchScore}% Match
                      </span>
                    </div>

                    <div>
                      <h3 style={{ color: '#fff', margin: 0, fontSize: '1.2rem' }}>{grant.title}</h3>
                      <p style={{ color: '#71717a', fontSize: '0.85rem', margin: '0.25rem 0' }}>by {grant.organization} • {grant.stage || 'MVP'}</p>
                    </div>

                    <p style={{ color: '#ccc', fontSize: '0.9rem', flex: 1 }}>{grant.description}</p>

                    <div style={{ background: '#09090b', padding: '0.75rem', borderRadius: '8px', border: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: '#71717a' }}>Goal Amount:</span>
                      <strong style={{ color: '#10b981' }}>${(grant.targetAmount || parseInt(grant.amount) || 10000).toLocaleString()}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {grant.pitchDeck && (
                        <a 
                          href={`${API_BASE}${grant.pitchDeck}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn btn-secondary"
                          style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', textAlign: 'center', display: 'block' }}
                        >
                          📄 Pitch Deck
                        </a>
                      )}
                      {grant.website && (
                        <a 
                          href={grant.website.startsWith('http') ? grant.website : `https://${grant.website}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn btn-secondary"
                          style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', textAlign: 'center', display: 'block' }}
                        >
                          🌐 Website
                        </a>
                      )}
                    </div>

                    <button 
                      className="btn btn-primary"
                      onClick={() => handleExpressInterest(grant.id, grant.title)}
                      disabled={grant.investorId === user?.id}
                      style={{ width: '100%', padding: '0.6rem', fontSize: '0.9rem' }}
                    >
                      {grant.investorId === user?.id ? '✅ Interest Expressed' : '🤝 Express Interest'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Live Progress Tracker */}
        {activeTab === "Progress" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Transparent Accountability</h2>
              <p>Track the real-world milestones of funded projects.</p>
            </div>
            
            <div className={styles.progressList}>
              {MOCK_PROGRESS.map((prog) => (
                <div key={prog.id} className={`glass-panel ${styles.progressCard}`}>
                  <div className={styles.progHeader}>
                    <div>
                      <h3>{prog.projectTitle}</h3>
                      <p className={styles.startupName}>{prog.startupName}</p>
                    </div>
                    <span className={`${styles.statusBadge} ${prog.status === "Completed" ? styles.statusCompleted : styles.statusTrack}`}>
                      {prog.status}
                    </span>
                  </div>
                  
                  <div className={styles.progBody}>
                    <p><strong>Last Update:</strong> {prog.lastUpdate}</p>
                    <p>{prog.milestoneDesc}</p>
                    
                    <div className={styles.fundingData} style={{ marginTop: "1rem" }}>
                      <div className={styles.fundHeader}>
                        <span>Project Completion</span>
                        <span>{prog.progressPercent}%</span>
                      </div>
                      <div className={styles.progressBarBg}>
                        <div className={styles.progressBarFill} style={{ width: `${prog.progressPercent}%`, background: "var(--primary)" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Mentorship Marketplace */}
        {activeTab === "Mentors" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>AI-Powered Matchmaking</h2>
              <p>Get paired with industry veterans to accelerate your startup's growth.</p>
            </div>
            
            <div className={styles.grid}>
              {MOCK_MENTORS.map((mentor) => (
                <div key={mentor.id} className={`glass-panel ${styles.mentorCard}`}>
                  <div className={styles.mentorInfo}>
                    <div className={styles.avatarWrapper}>
                      <Image src={mentor.image} alt={mentor.name} fill className={styles.avatar} />
                    </div>
                    <div>
                      <h3>{mentor.name}</h3>
                      <p className={styles.startupName}>{mentor.company}</p>
                    </div>
                  </div>
                  
                  <div className={styles.mentorSkills}>
                    {mentor.expertise.map(skill => (
                      <span key={skill} className={styles.skillTag}>{skill}</span>
                    ))}
                  </div>
                  
                  <div className={styles.cardFooter}>
                    <span className={styles.availText}>Availability: {mentor.availability}</span>
                    <button className="btn btn-secondary" onClick={() => handleMentorMatch(mentor.name)}>
                      Request AI Match
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Journal & Summit */}
        {activeTab === "Journal" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Global Innovation Summit & Journal</h2>
              <p>Read the latest research and announcements from the ecosystem.</p>
            </div>
            
            <div className={styles.masonryGrid}>
              {MOCK_JOURNAL.map((entry) => (
                <div key={entry.id} className={`glass-panel ${styles.journalCard}`}>
                  <div className={styles.journalHeader}>
                    <span className={styles.journalType}>{entry.type}</span>
                    <span className={styles.journalDate}>{entry.date}</span>
                  </div>
                  <h3>{entry.title}</h3>
                  <p className={styles.journalAuthor}>By {entry.author}</p>
                  <p className={styles.journalExcerpt}>{entry.excerpt}</p>
                  <button className={`btn btn-secondary ${styles.readMoreBtn}`}>Read Full Report</button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Upload Grant Modal */}
      {isUploadModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
          <div style={{ background: '#111', padding: '2rem', borderRadius: '16px', border: '1px solid #333', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Post a New Grant Request</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              <input 
                type="text" 
                placeholder="Project / Grant Title *" 
                value={newGrant.title}
                onChange={(e) => setNewGrant({...newGrant, title: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
              />
              <input 
                type="text" 
                placeholder="Organization / Startup Name *" 
                value={newGrant.organization}
                onChange={(e) => setNewGrant({...newGrant, organization: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
              />
              <textarea 
                placeholder="Description & Impact *" 
                value={newGrant.description}
                onChange={(e) => setNewGrant({...newGrant, description: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px', minHeight: '100px' }}
              />
              <input 
                type="number" 
                placeholder="Funding Goal ($) *" 
                value={newGrant.amount}
                onChange={(e) => setNewGrant({...newGrant, amount: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
              />
              
              <input 
                type="text" 
                placeholder="Website URL (e.g. startup.com)" 
                value={newGrant.website}
                onChange={(e) => setNewGrant({...newGrant, website: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <select 
                  value={newGrant.stage}
                  onChange={(e) => setNewGrant({...newGrant, stage: e.target.value})}
                  style={{ padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
                >
                  <option value="Idea">Idea Stage</option>
                  <option value="MVP">MVP Stage</option>
                  <option value="Growth">Growth Stage</option>
                </select>

                <input 
                  type="text" 
                  placeholder="Sector (e.g. SaaS, Fintech)" 
                  value={newGrant.sector}
                  onChange={(e) => setNewGrant({...newGrant, sector: e.target.value})}
                  style={{ padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
                />
              </div>

              {/* Pitch deck file upload */}
              <div>
                <label style={{ color: '#aaa', fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Upload Pitch Deck (PDF/Doc/PPT)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px dashed #444', borderRadius: '8px', padding: '0.8rem', background: '#070707' }}>
                  <label style={{ cursor: 'pointer', background: '#222', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid #333', fontWeight: 'bold' }}>
                    📁 Select File
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx,.ppt,.pptx" 
                      onChange={(e) => setPitchFile(e.target.files?.[0] || null)}
                      style={{ display: 'none' }} 
                    />
                  </label>
                  <span style={{ color: '#888', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {pitchFile ? `✅ ${pitchFile.name}` : 'No file selected'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setIsUploadModalOpen(false)} style={{ flex: 1, padding: '0.8rem', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handlePostGrant} disabled={isUploading || !newGrant.title || !newGrant.organization} style={{ flex: 1, padding: '0.8rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                {isUploading ? 'Posting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
