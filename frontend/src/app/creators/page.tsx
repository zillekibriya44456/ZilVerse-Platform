"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import styles from "./creators.module.css";

const DEMO_CREATORS = [
  { id: "1", name: "Tech with Tim", niche: "Python & Data Science", platform: "YouTube", followers: 1200000, bio: "Teaching the world to code in Python.", avatar: "/demo-avatar-1.png" },
  { id: "2", name: "Fireship", niche: "Web Development", platform: "YouTube", followers: 2500000, bio: "High-intensity code tutorials to help you ship faster.", avatar: "/demo-avatar-2.png" },
  { id: "3", name: "Frontend Mastery", niche: "React & UI/UX", platform: "X (Twitter)", followers: 450000, bio: "Daily React tips and UI design inspiration.", avatar: "/demo-avatar-3.png" }
];

export default function CreatorsPage() {
  const [dbCreators, setDbCreators] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCreator, setNewCreator] = useState({ niche: '', platform: 'YouTube', followers: '', bio: '' });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5002/api/creators')
      .then(res => setDbCreators(res.data))
      .catch(err => console.error("Failed to fetch creators", err));
  }, []);

  const handleJoin = async () => {
    setIsUploading(true);
    try {
      await axios.post('http://localhost:5002/api/creators/register', newCreator);
      setIsModalOpen(false);
      const res = await axios.get('http://localhost:5002/api/creators');
      setDbCreators(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const formattedDbCreators = dbCreators.map(c => ({
    id: c.id,
    name: c.user?.name || "Anonymous Creator",
    niche: c.niche,
    platform: c.platform,
    followers: c.followers,
    bio: c.bio,
    avatar: c.user?.avatar || "/default-avatar.png"
  }));

  const CREATORS = [...formattedDbCreators, ...DEMO_CREATORS];

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.badgeLabel}>The Creator Network</div>
          <h1 className={styles.title}>Global Innovators & Influencers</h1>
          <p className={styles.subtitle}>
            Connect with the world's leading tech creators. Discover niches, analyze follower growth, and collaborate on massive projects.
          </p>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ marginTop: '2rem' }}>
            + Join Network
          </button>
        </div>

        <div className={styles.grid}>
          {CREATORS.map(creator => (
            <div key={creator.id} className={`glass-panel ${styles.creatorCard}`}>
              <div className={styles.creatorHeader}>
                <div className={styles.avatarPlaceholder}>
                   {creator.avatar === "/demo-avatar-1.png" ? "🐍" : creator.avatar === "/demo-avatar-2.png" ? "🔥" : creator.avatar === "/demo-avatar-3.png" ? "🎨" : "👤"}
                </div>
                <div>
                  <h3 className={styles.creatorName}>{creator.name}</h3>
                  <span className={styles.nicheBadge}>{creator.niche}</span>
                </div>
              </div>
              
              <p className={styles.creatorBio}>{creator.bio}</p>
              
              <div className={styles.creatorStats}>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Platform</span>
                  <span className={styles.statValue}>{creator.platform}</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Followers</span>
                  <span className={styles.statValue}>{creator.followers.toLocaleString()}+</span>
                </div>
              </div>
              
              <button className={`btn btn-secondary ${styles.fullBtn}`}>Collaborate</button>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', padding: '2rem', borderRadius: '16px', border: '1px solid #333', width: '90%', maxWidth: '500px' }}>
            <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Join the Creator Network</h2>
            <input 
              type="text" 
              placeholder="Your Content Niche (e.g. Next.js, AI, Python)" 
              value={newCreator.niche}
              onChange={(e) => setNewCreator({...newCreator, niche: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
            />
            <select
              value={newCreator.platform}
              onChange={(e) => setNewCreator({...newCreator, platform: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
            >
              <option>YouTube</option>
              <option>X (Twitter)</option>
              <option>LinkedIn</option>
              <option>TikTok</option>
              <option>Blog</option>
            </select>
            <input 
              type="number" 
              placeholder="Total Followers" 
              value={newCreator.followers}
              onChange={(e) => setNewCreator({...newCreator, followers: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
            />
            <textarea 
              placeholder="Short Bio / Description" 
              value={newCreator.bio}
              onChange={(e) => setNewCreator({...newCreator, bio: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1.5rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px', minHeight: '80px' }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.8rem', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleJoin} disabled={isUploading} style={{ flex: 1, padding: '0.8rem', background: '#a855f7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                {isUploading ? 'Registering...' : 'Register Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
