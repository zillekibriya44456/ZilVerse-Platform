"use client";
import { API_BASE } from "@/utils/api";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import styles from "../jobs/jobs.module.css";
import { useAuth } from "@/context/AuthContext";

const MOCK_INTERNSHIPS = [
  { id: "intern-1", title: "UI/UX Design Intern", company: "DesignHive", location: "Remote", salary: "$1,200/mo", type: "Internship", tags: ["Figma", "Design System", "Prototyping"], posted: "2 days ago", logo: "DH" },
  { id: "intern-2", title: "Frontend Developer Intern", company: "ZilLabs", location: "Karachi, PK", salary: "$800/mo", type: "Internship", tags: ["React", "CSS Grid", "JavaScript"], posted: "Just now", logo: "ZL" },
  { id: "intern-3", title: "Software Engineer Intern (AI/ML)", company: "NeuroTech", location: "Remote", salary: "$1,500/mo", type: "Internship", tags: ["Python", "TensorFlow", "Pandas"], posted: "1 week ago", logo: "NT" },
  { id: "intern-4", title: "Digital Marketing Intern", company: "GrowthSync", location: "London, UK", salary: "£1,000/mo", type: "Internship", tags: ["SEO", "Analytics", "Copywriting"], posted: "3 days ago", logo: "GS" }
];

export default function InternshipsPage() {
  const { user } = useAuth();
  const [dbJobs, setDbJobs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInternship, setNewInternship] = useState({
    title: "",
    company: "",
    location: "Remote",
    salary: "",
    type: "Internship",
    description: "Exciting internship opportunity to learn and grow with our team.",
    requirements: ""
  });
  const [isUploading, setIsUploading] = useState(false);

  // Application modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState({ resumeUrl: "", coverLetter: "" });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchInternships = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/jobs`);
      const raw = res.data?.data ?? res.data;
      setDbJobs(Array.isArray(raw) ? raw : []);

    } catch (err) {
      console.error("Failed to load internships", err);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const handlePostInternship = async () => {
    setIsUploading(true);
    try {
      await axios.post(`${API_BASE}/api/jobs/create`, {
        ...newInternship,
        type: "Internship"
      });
      setIsModalOpen(false);
      setNewInternship({
        title: "",
        company: "",
        location: "Remote",
        salary: "",
        type: "Internship",
        description: "Exciting internship opportunity to learn and grow with our team.",
        requirements: ""
      });
      fetchInternships();
      setToastMessage("Internship opportunity posted!");
    } catch (err) {
      console.error(err);
      setToastMessage("Failed to post internship.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleApplyClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setIsApplyModalOpen(true);
  };

  const handleApplySubmit = async () => {
    setIsApplying(true);
    try {
      const activeToken = localStorage.getItem("zilverse_token") || "";
      const formData = new FormData();
      formData.append("jobId", selectedJobId || "");
      formData.append("coverLetter", applicationData.coverLetter);
      if (resumeFile) {
        formData.append("resume", resumeFile);
      } else {
        formData.append("resumeUrl", applicationData.resumeUrl);
      }

      await axios.post(`${API_BASE}/api/jobs/apply`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${activeToken}`
        }
      });

      setIsApplyModalOpen(false);
      setToastMessage("Application submitted successfully!");
      setApplicationData({ resumeUrl: "", coverLetter: "" });
      setResumeFile(null);
    } catch (err: any) {
      console.error(err);
      setToastMessage("Failed to submit application: " + (err.response?.data?.error || err.message));
    } finally {
      setIsApplying(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const formattedDbInternships = dbJobs
    .filter(j => j.type === "Internship")
    .map(j => ({
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      salary: j.salary || "Competitive",
      type: "Internship",
      tags: j.requirements ? j.requirements.split(",") : ["Tech"],
      posted: "Just now",
      logo: j.company.substring(0, 2).toUpperCase()
    }));

  const INTERNSHIPS = [...formattedDbInternships, ...MOCK_INTERNSHIPS];
  const filtered = INTERNSHIPS.filter(item => {
    return (
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.company.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className={styles.page} style={{ paddingTop: "120px", minHeight: "100vh" }}>
      {toastMessage && (
        <div style={{ position: "fixed", top: "20px", right: "20px", background: "#7c3aed", color: "#fff", padding: "1rem 1.5rem", borderRadius: "10px", zIndex: 9999999, fontWeight: 600 }}>
          {toastMessage}
        </div>
      )}
      
      <div className="container">
        <div className={styles.header} style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{
            display: "inline-block",
            padding: "0.5rem 1.25rem",
            background: "rgba(124, 58, 237, 0.1)",
            color: "#a78bfa",
            borderRadius: "99px",
            fontWeight: "700",
            fontSize: "0.85rem",
            letterSpacing: ".05em",
            textTransform: "uppercase",
            border: "1px solid rgba(124, 58, 237, 0.2)",
            marginBottom: "1.5rem"
          }}>
            🎓 Global Internships
          </div>
          <h1 className={styles.title} style={{ fontSize: "3rem", fontWeight: 800, background: "linear-gradient(90deg, #fff, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Kickstart Your Global Career
          </h1>
          <p className={styles.subtitle} style={{ maxWidth: "600px", margin: "0.5rem auto 2rem", color: "#a1a1aa" }}>
            Discover exclusive remote and hybrid internships with top tech startups. Build your portfolio, learn from experts, and get paid.
          </p>
 
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", maxWidth: "600px", margin: "0 auto" }}>
            <input
              type="text"
              placeholder="Search by role, company, or technology..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Post Internship</button>
          </div>
        </div>
 
        {/* Listings Grid */}
        <div className={styles.jobsList}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>No internships found matching your search.</div>
          ) : (
            filtered.map(item => (
              <div key={item.id} className={`glass-panel ${styles.jobCard}`}>
                <div className={styles.jobLogo} style={{ background: "rgba(124, 58, 237, 0.1)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>{item.logo}</div>
                <div className={styles.jobInfo}>
                  <h3 className={styles.jobTitle}>{item.title}</h3>
                  <p className={styles.jobMeta}>{item.company} • {item.location} • {item.posted}</p>
                  <div className={styles.tags}>
                    {item.tags.map((tag: string) => (
                      <span key={tag} className={styles.tag} style={{ background: "rgba(124, 58, 237, 0.05)", border: "1px solid rgba(124, 58, 237, 0.1)", color: "#c4b5fd" }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className={styles.jobRight}>
                  <span className={`${styles.typeBadge}`} style={{ background: "rgba(167, 139, 250, 0.15)", color: "#c4b5fd", border: "1px solid rgba(167, 139, 250, 0.3)" }}>
                    {item.type}
                  </span>
                  <p className={styles.salary} style={{ color: "#a78bfa" }}>{item.salary}</p>
                  <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => handleApplyClick(String(item.id))}>Apply Now</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* POST INTERNSHIP MODAL */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#111", padding: "2rem", borderRadius: "16px", border: "1px solid #333", width: "90%", maxWidth: "500px" }}>
            <h2 style={{ color: "#fff", marginBottom: "1.5rem" }}>Post an Internship Role</h2>
            <input 
              type="text" 
              placeholder="Role Title (e.g. Frontend Intern)" 
              value={newInternship.title}
              onChange={(e) => setNewInternship({...newInternship, title: e.target.value})}
              style={{ width: "100%", padding: "0.8rem", marginBottom: "1rem", background: "#000", border: "1px solid #333", color: "#fff", borderRadius: "8px" }}
            />
            <input 
              type="text" 
              placeholder="Company Name" 
              value={newInternship.company}
              onChange={(e) => setNewInternship({...newInternship, company: e.target.value})}
              style={{ width: "100%", padding: "0.8rem", marginBottom: "1rem", background: "#000", border: "1px solid #333", color: "#fff", borderRadius: "8px" }}
            />
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <input 
                type="text" 
                placeholder="Location (e.g. Remote, US)" 
                value={newInternship.location}
                onChange={(e) => setNewInternship({...newInternship, location: e.target.value})}
                style={{ flex: 1, padding: "0.8rem", background: "#000", border: "1px solid #333", color: "#fff", borderRadius: "8px" }}
              />
              <input 
                type="text" 
                placeholder="Stipend (e.g. $1,000/mo)" 
                value={newInternship.salary}
                onChange={(e) => setNewInternship({...newInternship, salary: e.target.value})}
                style={{ flex: 1, padding: "0.8rem", background: "#000", border: "1px solid #333", color: "#fff", borderRadius: "8px" }}
              />
            </div>
            <textarea 
              placeholder="Skills & Required Tech (comma separated)" 
              value={newInternship.requirements}
              onChange={(e) => setNewInternship({...newInternship, requirements: e.target.value})}
              style={{ width: "100%", padding: "0.8rem", marginBottom: "1.5rem", background: "#000", border: "1px solid #333", color: "#fff", borderRadius: "8px", minHeight: "80px" }}
            />
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: "0.8rem", background: "#333", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
              <button onClick={handlePostInternship} disabled={isUploading} style={{ flex: 1, padding: "0.8rem", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                {isUploading ? "Posting..." : "Post Internship"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPLY MODAL */}
      {isApplyModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#111", padding: "2rem", borderRadius: "16px", border: "1px solid #333", width: "90%", maxWidth: "500px" }}>
            <h2 style={{ color: "#fff", marginBottom: "1.5rem" }}>Submit Internship Application</h2>
            
            {/* File Upload Control */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                Upload Resume / CV (PDF, DOC, DOCX, Images)
              </label>
              <div style={{
                border: "2px dashed #333", borderRadius: "8px", padding: "1.5rem",
                textAlign: "center", cursor: "pointer", background: "#050505",
                transition: "border-color 0.2s"
              }} onClick={() => document.getElementById("file-upload-input")?.click()}>
                <input 
                  type="file" 
                  id="file-upload-input" 
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setResumeFile(file);
                  }}
                />
                {resumeFile ? (
                  <div>
                    <span style={{ color: "#10b981", fontWeight: "600", fontSize: "0.9rem" }}>📄 {resumeFile.name}</span>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setResumeFile(null);
                      }} 
                      style={{
                        marginLeft: "10px", background: "#ef4444", color: "#fff",
                        border: "none", borderRadius: "4px", padding: "2px 6px",
                        fontSize: "0.75rem", cursor: "pointer"
                      }}
                    >Remove</button>
                  </div>
                ) : (
                  <div>
                    <span style={{ color: "#3b82f6", fontSize: "0.9rem", fontWeight: "600" }}>📂 Click to browse files</span>
                    <p style={{ color: "#71717a", fontSize: "0.75rem", marginTop: "4px" }}>Max size: 10MB</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ textAlign: "center", margin: "0.5rem 0", color: "#52525b", fontSize: "0.8rem" }}>— OR —</div>

            <input 
              type="text" 
              placeholder="Portfolio / Resume Link" 
              value={applicationData.resumeUrl}
              onChange={(e) => setApplicationData({...applicationData, resumeUrl: e.target.value})}
              disabled={!!resumeFile}
              style={{ width: "100%", padding: "0.8rem", marginBottom: "1rem", background: "#000", border: "1px solid #333", color: !!resumeFile ? "#555" : "#fff", borderRadius: "8px" }}
            />

            <textarea 
              placeholder="Cover Letter / Why do you want this internship? (Optional)" 
              value={applicationData.coverLetter}
              onChange={(e) => setApplicationData({...applicationData, coverLetter: e.target.value})}
              style={{ width: "100%", padding: "0.8rem", marginBottom: "1.5rem", background: "#000", border: "1px solid #333", color: "#fff", borderRadius: "8px", minHeight: "120px" }}
            />
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={() => { setIsApplyModalOpen(false); setResumeFile(null); }} style={{ flex: 1, padding: "0.8rem", background: "#333", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleApplySubmit} disabled={isApplying} style={{ flex: 1, padding: "0.8rem", background: "#10b981", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                {isApplying ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
