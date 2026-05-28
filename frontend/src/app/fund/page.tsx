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

type Tab = "Grants" | "Progress" | "Mentors" | "Journal";

export default function FundHubPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Grants");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Database State
  const [dbGrants, setDbGrants] = useState<any[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newGrant, setNewGrant] = useState({ title: '', organization: '', amount: '1000', description: '', deadline: 'Rolling' });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/api/funds`)
      .then(res => setDbGrants(res.data))
      .catch(err => console.error("Failed to load DB grants", err));
  }, []);

  const handlePostGrant = async () => {
    setIsUploading(true);
    try {
      await axios.post(`${API_BASE}/api/funds/create`, {
        title: newGrant.title,
        organization: newGrant.organization,
        amount: newGrant.amount,
        description: newGrant.description,
        deadline: newGrant.deadline
      });
      setToastMessage("Successfully created your Grant on the global network!");
      setIsUploadModalOpen(false);
      // Refresh DB Grants
      const res = await axios.get(`${API_BASE}/api/funds`);
      setDbGrants(res.data);
    } catch (err: any) {
      setToastMessage("Error posting grant: " + (err.response?.data?.error || err.message));
    } finally {
      setIsUploading(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const formattedDbGrants = dbGrants.map(g => ({
    id: g.id,
    title: g.title,
    startupName: g.organization,
    category: "DB Grant",
    sustainabilityScore: 99,
    description: g.description,
    currentFunding: 0,
    fundingGoal: parseInt(g.amount) || 10000,
    upvotes: 0
  }));

  const GRANTS = [...formattedDbGrants, ...MOCK_GRANTS];

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
          price={100} // $100 micro-grant example
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
                    <p className={styles.startupName}>by {grant.startupName}</p>
                    <p className={styles.desc}>{grant.description}</p>
                    
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', padding: '2rem', borderRadius: '16px', border: '1px solid #333', width: '90%', maxWidth: '500px' }}>
            <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Post a New Grant Request</h2>
            <input 
              type="text" 
              placeholder="Project / Grant Title" 
              value={newGrant.title}
              onChange={(e) => setNewGrant({...newGrant, title: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
            />
            <input 
              type="text" 
              placeholder="Organization / Startup Name" 
              value={newGrant.organization}
              onChange={(e) => setNewGrant({...newGrant, organization: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
            />
            <textarea 
              placeholder="Description & Impact" 
              value={newGrant.description}
              onChange={(e) => setNewGrant({...newGrant, description: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px', minHeight: '100px' }}
            />
            <input 
              type="number" 
              placeholder="Funding Goal ($)" 
              value={newGrant.amount}
              onChange={(e) => setNewGrant({...newGrant, amount: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1.5rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setIsUploadModalOpen(false)} style={{ flex: 1, padding: '0.8rem', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handlePostGrant} disabled={isUploading} style={{ flex: 1, padding: '0.8rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                {isUploading ? 'Posting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
