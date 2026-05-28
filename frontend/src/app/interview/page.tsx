"use client";
import { API_BASE } from "@/utils/api";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import styles from "./interview.module.css";
import AIInterviewRoom from "@/components/AIInterviewRoom";
import { Award, Briefcase, Code, GraduationCap, ShieldAlert, Sparkles, Trophy, Users } from "lucide-react";

// Recruiter list
const INTERVIEWERS = [
  { id: "sarah", name: "Sarah Jenkins", gender: "female", role: "Lead Talent HR Manager", avatar: "/avatars/hr_female.png", style: "Conversational, behavioral, culture-fit, notice periods." },
  { id: "david", name: "David Lee", gender: "male", role: "Technical Staff Architect", avatar: "/avatars/hr_male.png", style: "Deep system architecture, live code verification, security." },
  { id: "hans", name: "Professor Hans", gender: "male", role: "Director of Research", avatar: "/avatars/hr_male.png", style: "Academic theories, methodology validation, publishings." },
  { id: "elon", name: "Elon Draper", gender: "female", role: "Venture Principal", avatar: "/avatars/hr_female.png", style: "High-pressure, fast pace, unit economics, startup scaling." }
];

// Marketplace experts
const EXPERTS = [
  { id: "exp1", name: "Devon - Staff AI at Vercel", rate: "$120/hr", rating: "4.9 (42 reviews)", tag: "AI/RAG Expert" },
  { id: "exp2", name: "Melanie - Senior HR at Stripe", rate: "$95/hr", rating: "5.0 (68 reviews)", tag: "HR & Behavioral" },
  { id: "exp3", name: "Arjun - Lead Architect at AWS", rate: "$150/hr", rating: "4.8 (110 reviews)", tag: "System Design" },
  { id: "exp4", name: "Chloe - Security Lead at OWASP", rate: "$110/hr", rating: "4.9 (24 reviews)", tag: "Cybersecurity Auditing" }
];

// Gamification badges
const BADGES = [
  { name: "Flawless Code", desc: "Compile coding challenge with zero errors", icon: "💻" },
  { name: "Unbreakable Focus", desc: "Trigger 0 anti-cheat focus warnings", icon: "🛡️" },
  { name: "Fluency Specialist", desc: "Average over 85% communication score", icon: "🎙️" },
  { name: "Startup Hustler", desc: "Pass VC funding mock interview mode", icon: "🚀" }
];

export default function InterviewPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"ai" | "marketplace" | "history">("ai");
  const [startRoom, setStartRoom] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState<string | null>(null);

  // Setup options
  const [targetRole, setTargetRole] = useState("Full Stack AI Engineer");
  const [roleMode, setRoleMode] = useState<"ai" | "frontend" | "cyber" | "freelance" | "intern" | "professor" | "founder" | "hr">("ai");
  const [level, setLevel] = useState("Senior");
  const [skillsText, setSkillsText] = useState("React, Next.js, Node.js, Python, RAG, PyTorch");
  const [selectedInterviewer, setSelectedInterviewer] = useState("david");
  const [interviewType, setInterviewType] = useState<"coding" | "voice" | "traditional">("coding");

  // Replay result viewer
  const [selectedResult, setSelectedResult] = useState<any | null>(null);
  const [results, setResults] = useState<any[]>([]);

  // Fetch results from backend
  const fetchResults = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/interview`);
      // If we need the results of the specific user, or fallback
      if (res.data && Array.isArray(res.data)) {
        // filter or set
        setResults(res.data);
      }
    } catch (e) {
      // Mock history in case DB is clean or api fails
      setResults([
        {
          id: "m1",
          score: 88,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          feedback: JSON.stringify({
            score: 88,
            technical: 90,
            communication: 85,
            confidence: 92,
            problemSolving: 85,
            readiness: "Highly Recommended",
            strengths: ["Strong RAG vector search knowledge", "Precise coding structure"],
            weaknesses: ["Brief handling of notice period explanation"],
            suggestions: "Practice structuring response timeline for behavioral questions.",
            salary: "$125,000 - $145,000",
            answers: ["BERT relies on bi-directional encoders while GPT uses masked auto-regressive decoders...", "RAG overlap keeps sentence context intact..."],
            questions: ["ExplainBERT vs GPT structure", "How does document overlap solve RAG queries?"]
          })
        }
      ]);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleInterviewComplete = (score: number, rawFeedback: string) => {
    setStartRoom(false);
    fetchResults();
    // Show completed report immediately
    try {
      const parsed = JSON.parse(rawFeedback);
      setSelectedResult({ score, feedback: rawFeedback });
    } catch {
      setSelectedResult({
        score,
        feedback: JSON.stringify({
          score,
          technical: score,
          communication: 80,
          confidence: 85,
          problemSolving: score - 5,
          readiness: score > 80 ? "Recommended" : "Needs Practice",
          strengths: ["Highly technical response delivery"],
          weaknesses: ["Needs minor depth in code design principles"],
          suggestions: "Keep practicing coding challenges.",
          salary: "Estimated Market Value",
          answers: [],
          questions: []
        })
      });
    }
    setActiveTab("history");
  };

  if (startRoom) {
    const activeInt = INTERVIEWERS.find(i => i.id === selectedInterviewer) || INTERVIEWERS[1];
    return (
      <AIInterviewRoom
        name={user?.name || "Candidate"}
        role={targetRole}
        roleMode={roleMode}
        level={level}
        skills={skillsText}
        interviewerName={activeInt.name}
        interviewerGender={activeInt.gender as "male" | "female"}
        interviewType={interviewType}
        onComplete={handleInterviewComplete}
        onClose={() => setStartRoom(false)}
      />
    );
  }

  return (
    <div className={styles.portal}>
      {/* Background gradients */}
      <div className={styles.bgGlow} />

      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        {/* Header Hero */}
        <div className={styles.hero}>
          <div className={styles.badgeLine}>
            <Sparkles size={16} color="#a78bfa" />
            <span>AI-Powered Global Interview Intelligence</span>
          </div>
          <h1>Optimize Your Professional Career</h1>
          <p>
            Experience dynamic, responsive, and adaptive mock interviews matching top global hiring bars.
            Train with specialized AI interview roles, test your coding skills, and unlock detailed analytics.
          </p>
        </div>

        {/* Tab Selector */}
        <div className={styles.tabs}>
          <button className={`${styles.tabBtn} ${activeTab === "ai" ? styles.tabBtnActive : ""}`} onClick={() => setActiveTab("ai")}>
            🤖 AI Mock Room
          </button>
          <button className={`${styles.tabBtn} ${activeTab === "marketplace" ? styles.tabBtnActive : ""}`} onClick={() => setActiveTab("marketplace")}>
            👥 Expert Marketplace
          </button>
          <button className={`${styles.tabBtn} ${activeTab === "history" ? styles.tabBtnActive : ""}`} onClick={() => { setActiveTab("history"); fetchResults(); }}>
            📊 Performance History & Replay
          </button>
        </div>

        <div className={styles.grid}>
          {/* Main Area */}
          <div className={styles.mainCol}>
            {activeTab === "ai" && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>Configure Your AI Interview Simulation</h3>
                  <p>The AI dynamically generates custom prompts matching your background.</p>
                </div>

                <div className={styles.fields}>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label>Target Job / Freelance Role</label>
                      <input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Staff Machine Learning Engineer" />
                    </div>
                    <div className={styles.field}>
                      <label>Target Level</label>
                      <select value={level} onChange={e => setLevel(e.target.value)}>
                        <option>Intern / Fresher</option>
                        <option>Junior Developer</option>
                        <option>Senior Developer</option>
                        <option>Staff Engineer / Lead</option>
                        <option>Principal Expert</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label>AI Recruiter Role Mode</label>
                      <select value={roleMode} onChange={e => setRoleMode(e.target.value as any)}>
                        <option value="ai">🧠 AI / ML Engineer (RAG, Vector DBs, LLMs)</option>
                        <option value="frontend">🎨 Frontend Developer (React, Hydration, Next.js)</option>
                        <option value="cyber">🔒 Cybersecurity Expert (OWASP, SIEM, Pen-Testing)</option>
                        <option value="freelance">💼 Freelancer Mode (AI acts as Client, pricing, scope creep)</option>
                        <option value="intern">🎓 Intern & Fresher Fundamentals</option>
                        <option value="professor">🔬 Professor & Academic Researcher</option>
                        <option value="founder">🚀 Venture & Startup Founder (Scale, funding pressure)</option>
                        <option value="hr">👤 Standard HR Talent Recruiter</option>
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label>Session Format Type</label>
                      <select value={interviewType} onChange={e => setInterviewType(e.target.value as any)}>
                        <option value="coding">💻 Interactive Coding & Technical Challenge</option>
                        <option value="voice">🎙️ Full Voice & Conversational Simulation</option>
                        <option value="traditional">📝 Traditional Q&A Video Screen</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label>Profile Keywords & Key Skills</label>
                    <input value={skillsText} onChange={e => setSkillsText(e.target.value)} placeholder="e.g. React, Next.js, Node.js, PyTorch" />
                  </div>

                  {/* Interviewer Selector */}
                  <div className={styles.interviewerGrid}>
                    <label style={{ gridColumn: "1 / -1", fontSize: "0.9rem", color: "#a1a1aa", marginBottom: "0.5rem" }}>Select Recruiter AI Persona</label>
                    {INTERVIEWERS.map(int => (
                      <div
                        key={int.id}
                        className={`${styles.interviewerCard} ${selectedInterviewer === int.id ? styles.interviewerCardActive : ""}`}
                        onClick={() => setSelectedInterviewer(int.id)}
                      >
                        <img src={int.avatar} alt={int.name} />
                        <div>
                          <h5>{int.name}</h5>
                          <h6>{int.role}</h6>
                          <p>{int.style}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className={styles.launchBtn} onClick={() => setStartRoom(true)}>
                    🚀 Start Session Room
                  </button>
                </div>
              </div>
            )}

            {activeTab === "marketplace" && (
              <div className={styles.card}>
                <div className={styles.cardHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3>Human Recruiter Mock Marketplace</h3>
                    <p>Schedule high-fidelity mock interviews with top enterprise leaders.</p>
                  </div>
                  <button className={styles.registerBtn} onClick={() => setShowRegisterModal(true)}>
                    Join as Interviewer
                  </button>
                </div>

                <div className={styles.marketplaceGrid}>
                  {EXPERTS.map(exp => (
                    <div key={exp.id} className={styles.expertCard}>
                      <div className={styles.expertHead}>
                        <div>
                          <h4>{exp.name}</h4>
                          <span className={styles.expertTag}>{exp.tag}</span>
                        </div>
                        <span className={styles.expertRate}>{exp.rate}</span>
                      </div>
                      <div className={styles.expertFooter}>
                        <span>⭐ {exp.rating}</span>
                        <button className={styles.bookBtn} onClick={() => setShowBookingModal(exp.name)}>
                          Book Mock Session
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className={styles.historySection}>
                <div className={styles.card} style={{ marginBottom: "2rem" }}>
                  <h3>Your Career Mock Sessions</h3>
                  <div className={styles.resultsList}>
                    {results.map((res, i) => {
                      let parsedFeedback: any = {};
                      try { parsedFeedback = JSON.parse(res.feedback); } catch { parsedFeedback = { suggestions: res.feedback }; }
                      return (
                        <div key={res.id || i} className={styles.historyRow} onClick={() => setSelectedResult(res)}>
                          <div className={styles.historyMeta}>
                            <span className={styles.historyScore}>{res.score}%</span>
                            <div>
                              <h5>AI Interview Assessment</h5>
                              <p>{new Date(res.createdAt).toLocaleDateString()} — {parsedFeedback.readiness || "Evaluated"}</p>
                            </div>
                          </div>
                          <button className={styles.viewReportBtn}>View Replay Report</button>
                        </div>
                      );
                    })}
                    {results.length === 0 && (
                      <p style={{ color: "#71717a", textAlign: "center", padding: "2rem 0" }}>No mock interviews recorded yet. Launch your first room above!</p>
                    )}
                  </div>
                </div>

                {selectedResult && (
                  <div className={styles.reportCard}>
                    <h3>Mock Room Report Detail</h3>
                    {(() => {
                      let data: any = {};
                      try { data = JSON.parse(selectedResult.feedback); } catch {
                        data = {
                          score: selectedResult.score,
                          technical: selectedResult.score,
                          communication: 80,
                          confidence: 85,
                          problemSolving: selectedResult.score - 5,
                          readiness: "Completed",
                          strengths: ["Good communication"],
                          weaknesses: [],
                          suggestions: selectedResult.feedback,
                          salary: "$90k - $110k",
                          answers: [],
                          questions: []
                        };
                      }
                      return (
                        <div>
                          {/* Score Ring */}
                          <div className={styles.reportScoresGrid}>
                            <div className={styles.scoreMetric}>
                              <span>{data.aptitude ?? data.problemSolving}%</span>
                              <label>Aptitude Round</label>
                            </div>
                            <div className={styles.scoreMetric}>
                              <span>{data.hr ?? 80}%</span>
                              <label>HR Interview</label>
                            </div>
                            <div className={styles.scoreMetric}>
                              <span>{data.technical}%</span>
                              <label>Technical Round</label>
                            </div>
                            <div className={styles.scoreMetric}>
                              <span>{data.coding ?? 0}%</span>
                              <label>Coding Sandbox</label>
                            </div>
                            <div className={styles.scoreMetric}>
                              <span>{data.communication}%</span>
                              <label>Communication</label>
                            </div>
                            <div className={styles.scoreMetric}>
                              <span>{data.confidence}%</span>
                              <label>Confidence Index</label>
                            </div>
                          </div>

                          <div className={styles.reportMeta}>
                            <div className={styles.metaBadge}>Hiring Status: <strong>{data.readiness}</strong></div>
                            <div className={styles.metaBadge}>Salary Estimate: <strong>{data.salary}</strong></div>
                          </div>

                          <div className={styles.reportDetails}>
                            <h5>Strengths Unlocked</h5>
                            <ul>
                              {data.strengths?.map((s: string, i: number) => <li key={i}>✅ {s}</li>)}
                            </ul>

                            <h5>Areas for Growth</h5>
                            <ul>
                              {data.weaknesses?.map((w: string, i: number) => <li key={i}>⚠️ {w}</li>)}
                            </ul>

                            <h5>Hiring Manager Suggestions</h5>
                            <p style={{ color: "#a1a1aa", fontSize: "0.9rem" }}>{data.suggestions}</p>
                          </div>

                          {/* Replay transcript */}
                          {data.questions && data.questions.length > 0 && (
                            <div className={styles.transcriptSection}>
                              <h5>Conversation Replay</h5>
                              {data.questions.map((q: string, idx: number) => (
                                <div key={idx} className={styles.transcriptExchange}>
                                  <div className={styles.transcriptQuestion}>🤖 <strong>Interviewer:</strong> {q}</div>
                                  <div className={styles.transcriptAnswer}>👤 <strong>Your Answer:</strong> {data.answers?.[idx] || "(No spoken answer)"}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Stats Area */}
          <div className={styles.sideCol}>
            {/* XP and Badges Card */}
            <div className={styles.sideCard}>
              <div className={styles.xpHead}>
                <Trophy color="#eab308" size={24} />
                <div>
                  <h4>Career Profile Rank</h4>
                  <span className={styles.rankLevel}>Level 4 — Elite Interviewer</span>
                </div>
              </div>
              <div className={styles.xpBar}>
                <div className={styles.xpProgress} style={{ width: "65%" }} />
              </div>
              <div className={styles.xpLabel}>
                <span>3,250 XP</span>
                <span>5,000 XP for next level</span>
              </div>

              {/* Streak Tracker */}
              <div className={styles.streakBox}>
                <span>🔥 4 Day Mock Streak</span>
              </div>
            </div>

            {/* Badges */}
            <div className={styles.sideCard}>
              <h4>Verified Badges Unlocked</h4>
              <div className={styles.badgeGrid}>
                {BADGES.map(b => (
                  <div key={b.name} className={styles.badgeItem}>
                    <span className={styles.badgeEmoji}>{b.icon}</span>
                    <h5>{b.name}</h5>
                    <p>{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Anti-cheat Advisory */}
            <div className={styles.sideCard} style={{ border: "1px solid rgba(239, 68, 68, 0.25)" }}>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem", color: "#f87171" }}>
                <ShieldAlert size={18} />
                <h5 style={{ margin: 0, color: "#f87171" }}>Anti-Cheat Warning</h5>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#fca5a5", margin: 0, lineHeight: 1.4 }}>
                During real-time technical rounds, the system monitors tab blurs, text clipboard copying, and excessive pause durations to maintain assessment integrity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Human registration modal */}
      {showRegisterModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Register as HR Expert / Lead</h3>
            <p>Monetize your recruiting expertise by offering mock interviews on the ZilVerse marketplace.</p>
            <div className={styles.modalFields}>
              <input placeholder="Current Job Title (e.g. Lead HR at Stripe)" />
              <input placeholder="Hourly Session Rate (e.g. $100)" />
              <textarea placeholder="Tell us about your recruiting background & certifications..." rows={4} />
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button className="btn btn-primary" onClick={() => setShowRegisterModal(false)}>Submit Registration</button>
              <button className="btn btn-secondary" onClick={() => setShowRegisterModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Confirm Booking with {showBookingModal}</h3>
            <p>A calendar link and video dashboard room invitation will be sent to your verified startup email address.</p>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button className="btn btn-primary" onClick={() => setShowBookingModal(null)}>Confirm & Pay via Wallet Escrow</button>
              <button className="btn btn-secondary" onClick={() => setShowBookingModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
