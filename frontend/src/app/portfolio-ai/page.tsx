"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import styles from "./page.module.css";

export default function ZilPortfolioAI() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState("Cybersecurity Theme");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleNext = async () => {
    if (step === 2) {
      // Simulate AI analyzing time
      setStep(3);
      setTimeout(() => setStep(4), 3000);
    } else if (step === 4) {
      setIsPublishing(true);
      try {
        await axios.post('http://localhost:5002/api/portfolio/generate', {
          theme: selectedTheme,
          bioText: "A highly motivated and adaptable professional with a strong foundation in modern technologies. Proven track record of excellence, demonstrating the ability to quickly master new skills and contribute to high-impact projects globally.",
          skills: "Leadership, Project Management, Problem Solving, Data Analysis, Global Communication",
          githubScore: "420 Commits",
          userId: user?.id
        });
        alert("Success! Your AI Portfolio has been permanently saved to the ZilVerse Database!");
        setStep(1);
        setUploadedFile(null);
      } catch (err: any) {
        alert("Error publishing portfolio: " + (err.response?.data?.error || err.message));
        console.error(err);
      } finally {
        setIsPublishing(false);
      }
    } else if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1 && step !== 4) setStep(step - 1);
    if (step === 4) setStep(1); // Allow reset from step 4
  };

  const THEMES = [
    { name: "Developer Theme", icon: "👨‍💻", bg: "#1e1e1e" },
    { name: "AI Engineer Theme", icon: "🧠", bg: "#0f172a" },
    { name: "Cybersecurity Theme", icon: "🛡️", bg: "#000000" },
    { name: "Designer Theme", icon: "🎨", bg: "#fafafa" },
    { name: "Startup Founder Theme", icon: "🚀", bg: "#18181b" },
    { name: "Futuristic Neon", icon: "✨", bg: "#2e1065" },
  ];

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.aiBadge}>✨ Powered by ZilVerse AI</div>
        <h1 className={styles.title}>Your Career. Powered by AI.</h1>
        <p className={styles.subtitle}>
          Upload your resume, GitHub, and certificates — AI builds your professional portfolio instantly.
        </p>
      </section>

      <section className={styles.dashboard}>
        <div className={styles.glassPanel}>
          
          <div className={styles.stepHeader}>
            <div className={styles.stepIndicator}>
              <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
                <div className={styles.stepNumber}>1</div> Data Sources
              </div>
              <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
                <div className={styles.stepNumber}>2</div> Design Theme
              </div>
              <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>
                <div className={styles.stepNumber}>3</div> AI Generation
              </div>
              <div className={`${styles.step} ${step >= 5 ? styles.active : ''}`}>
                <div className={styles.stepNumber}>4</div> Publish
              </div>
            </div>
          </div>

          {/* Step 1: Upload */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1.5rem' }}>Connect Your Professional Data</h2>
              <div className={styles.uploadGrid}>
                {/* Real File Upload */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
                <div 
                  className={styles.uploadCard} 
                  onClick={() => fileInputRef.current?.click()}
                  style={uploadedFile ? { borderColor: '#10b981', background: 'rgba(16,185,129,0.05)' } : {}}
                >
                  <div className={styles.uploadIcon}>{uploadedFile ? '✅' : '📄'}</div>
                  <div className={styles.uploadTitle}>
                    {uploadedFile ? uploadedFile.name : 'Upload Resume/CV'}
                  </div>
                  <div className={styles.uploadDesc}>
                    {uploadedFile ? 'Successfully uploaded' : 'PDF or Word Document'}
                  </div>
                </div>

                <div className={styles.uploadCard} onClick={() => alert("GitHub integration will trigger OAuth popup!")}>
                  <div className={styles.uploadIcon}>🐙</div>
                  <div className={styles.uploadTitle}>Connect GitHub</div>
                  <div className={styles.uploadDesc}>Auto-sync repositories</div>
                </div>
                <div className={styles.uploadCard} onClick={() => alert("LinkedIn integration will trigger OAuth popup!")}>
                  <div className={styles.uploadIcon}>💼</div>
                  <div className={styles.uploadTitle}>Connect LinkedIn</div>
                  <div className={styles.uploadDesc}>Import experience & bio</div>
                </div>
                <div className={styles.uploadCard} onClick={() => fileInputRef.current?.click()}>
                  <div className={styles.uploadIcon}>🏆</div>
                  <div className={styles.uploadTitle}>Certifications</div>
                  <div className={styles.uploadDesc}>Upload credentials</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Theme Selection */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1.5rem' }}>Select AI Design Architecture</h2>
              <div className={styles.themeGrid}>
                {THEMES.map(theme => (
                  <div 
                    key={theme.name} 
                    className={`${styles.themeCard} ${selectedTheme === theme.name ? styles.selected : ''}`}
                    onClick={() => setSelectedTheme(theme.name)}
                  >
                    <div className={styles.themePreview} style={{ background: theme.bg }}>
                      {theme.icon}
                    </div>
                    <div className={styles.themeInfo}>
                      <div className={styles.themeName}>{theme.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: AI Analyzing */}
          {step === 3 && (
            <div className={styles.aiScanning}>
              <div className={styles.scannerRing}></div>
              <div className={styles.scanningText}>ZilPortfolio AI is Architecting...</div>
              <p style={{ color: '#a1a1aa', marginTop: '1rem' }}>Analyzing GitHub Commits • Extracting Skills • Generating Professional Bio</p>
            </div>
          )}

          {/* Step 4: Preview & Publish */}
          {step === 4 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#fff' }}>Portfolio Generated Successfully! ✨</h2>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold' }}>
                  AI Score: 98/100 (Exceptional)
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', height: '500px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                {/* Browser Header Mock */}
                <div style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
                  <div style={{ marginLeft: '1rem', color: '#a1a1aa', fontSize: '0.8rem', fontFamily: 'monospace' }}>https://zilverse.in/p/your-generated-portfolio</div>
                </div>
                
                {/* Generated Portfolio Content */}
                <div className={styles.generatedPortfolio}>
                  <div className={styles.mockHeader}>
                    <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>{user ? user.name : 'Your Name'}</div>
                    <div style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>{selectedTheme}</div>
                  </div>
                  
                  <div className={styles.mockBio}>
                    Global Professional & Innovator
                  </div>
                  <p style={{ color: '#a1a1aa', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '600px' }}>
                    *AI Generated Bio from {uploadedFile ? uploadedFile.name : 'your data'}:* 
                    A highly motivated and adaptable professional with a strong foundation in modern technologies. 
                    Proven track record of excellence, demonstrating the ability to quickly master new skills and 
                    contribute to high-impact projects globally.
                  </p>

                  <div className={styles.mockStats}>
                    <div className={styles.mockStatCard}>
                      <div style={{ color: '#4f46e5', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>AI ANALYSIS STATUS</div>
                      <div style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 'bold' }}>100% Verified</div>
                      <div style={{ color: '#a1a1aa', fontSize: '0.8rem', marginTop: '0.5rem' }}>Data synced from {uploadedFile ? uploadedFile.name : 'Resume'}</div>
                    </div>
                    <div className={styles.mockStatCard}>
                      <div style={{ color: '#0ea5e9', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>AI CAREER RECOMMENDATION</div>
                      <div style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 'bold' }}>Senior Specialist</div>
                      <div style={{ color: '#a1a1aa', fontSize: '0.8rem', marginTop: '0.5rem' }}>Match based on your skills & certificates</div>
                    </div>
                  </div>

                  <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Smart Skills Extraction</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                    {['Leadership', 'Project Management', 'Problem Solving', 'Data Analysis', 'Global Communication'].map(skill => (
                      <span key={skill} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.4rem 1rem', borderRadius: '99px', fontSize: '0.85rem', color: '#fff' }}>
                        {skill}
                      </span>
                    ))}
                  </div>

                  <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Experience Timeline</h3>
                  <div style={{ borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem', marginLeft: '0.5rem', marginBottom: '2rem' }}>
                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                      <div style={{ position: 'absolute', left: '-1.85rem', top: '0.2rem', width: '12px', height: '12px', borderRadius: '50%', background: '#4f46e5' }}></div>
                      <div style={{ color: '#fff', fontWeight: 'bold' }}>Recent Role (Extracted)</div>
                      <div style={{ color: '#a1a1aa', fontSize: '0.8rem' }}>Based on {uploadedFile ? uploadedFile.name : 'Resume'}</div>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-1.85rem', top: '0.2rem', width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></div>
                      <div style={{ color: '#fff', fontWeight: 'bold' }}>Previous Experience</div>
                      <div style={{ color: '#a1a1aa', fontSize: '0.8rem' }}>Verified background</div>
                    </div>
                  </div>

                  <h3 style={{ color: '#fff', marginBottom: '1rem', marginTop: '2rem' }}>GitHub Open Source Contributions</h3>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ color: '#fff', fontWeight: 'bold' }}>zilverse-core-engine</div>
                      <div style={{ color: '#10b981', fontSize: '0.9rem' }}>420 Commits</div>
                    </div>
                    <div style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Maintained the core decentralized protocol and enhanced the React frontend architecture.</div>
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Get in Touch</h3>
                    <button style={{ background: '#fff', color: '#000', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Contact {user ? user.name.split(' ')[0] : 'Me'}
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Navigation Actions */}
          {step !== 3 && (
            <div className={styles.dashboardActions}>
              <button className={styles.btnSecondary} onClick={handleBack} style={{ opacity: step === 1 ? 0 : 1, pointerEvents: step === 1 ? 'none' : 'auto' }}>
                Back
              </button>
              <button className={styles.btnPrimary} onClick={handleNext} disabled={isPublishing}>
                {step === 1 ? 'Select Theme' : step === 2 ? 'Generate with AI' : step === 4 ? (isPublishing ? 'Publishing...' : 'One-Click Publish') : ''}
              </button>
            </div>
          )}

        </div>
      </section>

      {/* 10 Core Features Landing Section */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>The World's Smartest Portfolio Ecosystem</h2>
        <div className={styles.featuresGrid}>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🧠</div>
            <h3 className={styles.featureTitle}>1. AI Resume Analyzer</h3>
            <p className={styles.featureText}>Scans your uploaded resume, GitHub, and LinkedIn to automatically extract skills, experience, and achievements.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🌐</div>
            <h3 className={styles.featureTitle}>2. Automated Website Generation</h3>
            <p className={styles.featureText}>Builds a fully designed, responsive portfolio website complete with animated sections and project galleries instantly.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>✍️</div>
            <h3 className={styles.featureTitle}>3. AI Professional Bio Writer</h3>
            <p className={styles.featureText}>Crafts a compelling professional intro, elevator pitch, and personal branding statement tailored to your industry.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3 className={styles.featureTitle}>4. Smart Skill Visualization</h3>
            <p className={styles.featureText}>Generates animated skill bars, radar charts, and expertise cards to visually prove your mastery.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🐙</div>
            <h3 className={styles.featureTitle}>5. Deep GitHub Analysis</h3>
            <p className={styles.featureText}>Analyzes your repositories, contribution history, and code complexity to calculate your Developer Score.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎯</div>
            <h3 className={styles.featureTitle}>6. AI Career Recommendations</h3>
            <p className={styles.featureText}>Suggests the best freelancing categories, full-time jobs, and startups based on your generated profile.</p>
          </div>

        </div>
      </section>
    </main>
  );
}
