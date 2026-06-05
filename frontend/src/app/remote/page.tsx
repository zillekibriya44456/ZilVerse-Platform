"use client";
import { API_BASE } from "@/utils/api";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import styles from "../jobs/jobs.module.css";
import { useAuth } from "@/context/AuthContext";

const MOCK_REMOTE_JOBS = [
  { id: "remote-1", title: "Senior React Architect", company: "DevStack Corp", location: "Remote (Global)", salary: "$120k–$150k/yr", type: "Full-Time", tags: ["Next.js", "TypeScript", "Tailwind"], posted: "1 day ago", logo: "DS" },
  { id: "remote-2", title: "Flutter Mobile Architect", company: "ZilVerse Devs", location: "Remote (APAC)", salary: "$70k–$90k/yr", type: "Full-Time", tags: ["Flutter", "Dart", "CI/CD"], posted: "Just now", logo: "ZV" },
  { id: "remote-3", title: "Senior AI Researcher", company: "DeepMind Simulation", location: "Remote (US/Canada)", salary: "$180k–$220k/yr", type: "Full-Time", tags: ["PyTorch", "NLP", "LLMs"], posted: "4 days ago", logo: "DM" },
  { id: "remote-4", title: "DevOps Engineer (Kubernetes)", company: "CloudScale Inc", location: "Remote (Europe)", salary: "€80k–€110k/yr", type: "Full-Time", tags: ["Docker", "Kubernetes", "AWS"], posted: "5 days ago", logo: "CS" }
];

export default function RemoteWorkPage() {
  const { user } = useAuth();
  const [dbJobs, setDbJobs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "Remote (Global)",
    salary: "",
    type: "Full-Time",
    description: "Looking for an awesome remote team player.",
    requirements: ""
  });
  const [isUploading, setIsUploading] = useState(false);

  // Application Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState({ resumeUrl: "", coverLetter: "" });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchRemoteJobs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/jobs`);
      setDbJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch remote jobs", err);
    }
  };

  useEffect(() => {
    fetchRemoteJobs();
  }, []);

  const handlePostJob = async () => {
    setIsUploading(true);
    try {
      await axios.post(`${API_BASE}/api/jobs/create`, {
        ...newJob,
        location: newJob.location.toLowerCase().includes("remote") ? newJob.location : `Remote (${newJob.location})`
      });
      setIsModalOpen(false);
      setNewJob({
        title: "",
        company: "",
        location: "Remote (Global)",
        salary: "",
        type: "Full-Time",
        description: "Looking for an awesome remote team player.",
        requirements: ""
      });
      fetchRemoteJobs();
      setToastMessage("Remote job listed successfully!");
    } catch (err) {
      console.error(err);
      setToastMessage("Failed to list remote job.");
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

  const formattedDbRemoteJobs = dbJobs
    .filter(j => j.location.toLowerCase().includes("remote"))
    .map(j => ({
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      salary: j.salary || "Competitive",
      type: j.type || "Full-Time",
      tags: j.requirements ? j.requirements.split(",") : ["Tech"],
      posted: "Just now",
      logo: j.company.substring(0, 2).toUpperCase()
    }));

  const ALL_REMOTE = [...formattedDbRemoteJobs, ...MOCK_REMOTE_JOBS];

  const filtered = ALL_REMOTE.filter(job => {
    const matchSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase()));

    const matchRegion =
      regionFilter === "All" ||
      job.location.toLowerCase().includes(regionFilter.toLowerCase());

    return matchSearch && matchRegion;
  });

  return (
    <div className={styles.page} style={{ paddingTop: "120px", minHeight: "100vh" }}>
      {toastMessage && (
        <div style={{ position: "fixed", top: "20px", right: "20px", background: "#0ea5e9", color: "#fff", padding: "1rem 1.5rem", borderRadius: "10px", zIndex: 9999999, fontWeight: 600 }}>
          {toastMessage}
        </div>
      )}

      <div className="container">
        <div className={styles.header} style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{
            display: "inline-block",
            padding: "0.5rem 1.25rem",
            background: "rgba(14, 165, 233, 0.1)",
            color: "#0ea5e9",
            borderRadius: "99px",
            fontWeight: "700",
            fontSize: "0.85rem",
            letterSpacing: ".05em",
            textTransform: "uppercase",
            border: "1px solid rgba(14, 165, 233, 0.2)",
            marginBottom: "1.5rem"
          }}>
            🌍 Remote Opportunities
          </div>
          <h1 className={styles.title} style={{ fontSize: "3rem", fontWeight: 800, background: "linear-gradient(90deg, #fff, #0ea5e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Work From Anywhere in the World
          </h1>
          <p className={styles.subtitle} style={{ maxWidth: "600px", margin: "0.5rem auto 2rem", color: "#a1a1aa" }}>
            Explore premium, borderless full-time development, design, and engineering roles. Work from home or any location you select.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", maxWidth: "600px", margin: "0 auto", marginBottom: "1.5rem" }}>
            <input
              type="text"
              placeholder="Search remote jobs..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Post Remote Job</button>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
            {["All", "Global", "US", "Europe", "APAC"].map((r) => (
              <button
                key={r}
                onClick={() => setRegionFilter(r)}
                className={`btn ${regionFilter === r ? "btn-primary" : "btn-secondary"}`}
                style={{ fontSize: "0.85rem", padding: "0.4rem 1rem" }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Listings */}
        <div className={styles.jobsList}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>No remote jobs found matching your criteria.</div>
          ) : (
            filtered.map(job => (
              <div key={job.id} className={`glass-panel ${styles.jobCard}`}>
                <div className={styles.jobLogo} style={{ background: "rgba(14, 165, 233, 0.1)", color: "#0ea5e9", border: "1px solid rgba(14, 165, 233, 0.2)" }}>{job.logo}</div>
                <div className={styles.jobInfo}>
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                  <p className={styles.jobMeta}>{job.company} • {job.location} • {job.posted}</p>
                  <div className={styles.tags}>
                    {job.tags.map((tag: string) => (
                      <span key={tag} className={styles.tag} style={{ background: "rgba(14, 165, 233, 0.05)", border: "1px solid rgba(14, 165, 233, 0.1)", color: "#38bdf8" }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className={styles.jobRight}>
                  <span className={`${styles.typeBadge}`} style={{ background: "rgba(14, 165, 233, 0.15)", color: "#38bdf8", border: "1px solid rgba(14, 165, 233, 0.3)" }}>
                    {job.type}
                  </span>
                  <p className={styles.salary} style={{ color: "#38bdf8" }}>{job.salary}</p>
                  <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => handleApplyClick(String(job.id))}>Apply Now</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* POST REMOTE JOB MODAL */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#111", padding: "2rem", borderRadius: "16px", border: "1px solid #333", width: "90%", maxWidth: "500px" }}>
            <h2 style={{ color: "#fff", marginBottom: "1.5rem" }}>Post a Remote Job</h2>
            <input 
              type="text" 
              placeholder="Job Title (e.g. Staff Backend Engineer)" 
              value={newJob.title}
              onChange={(e) => setNewJob({...newJob, title: e.target.value})}
              style={{ width: "100%", padding: "0.8rem", marginBottom: "1rem", background: "#000", border: "1px solid #333", color: "#fff", borderRadius: "8px" }}
            />
            <input 
              type="text" 
              placeholder="Company Name" 
              value={newJob.company}
              onChange={(e) => setNewJob({...newJob, company: e.target.value})}
              style={{ width: "100%", padding: "0.8rem", marginBottom: "1rem", background: "#000", border: "1px solid #333", color: "#fff", borderRadius: "8px" }}
            />
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <input 
                type="text" 
                placeholder="Remote Zone (e.g. US, Global, Europe)" 
                value={newJob.location}
                onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                style={{ flex: 1, padding: "0.8rem", background: "#000", border: "1px solid #333", color: "#fff", borderRadius: "8px" }}
              />
              <input 
                type="text" 
                placeholder="Salary (e.g. $120k–$150k)" 
                value={newJob.salary}
                onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                style={{ flex: 1, padding: "0.8rem", background: "#000", border: "1px solid #333", color: "#fff", borderRadius: "8px" }}
              />
            </div>
            <textarea 
              placeholder="Requirements / Technologies (comma separated)" 
              value={newJob.requirements}
              onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
              style={{ width: "100%", padding: "0.8rem", marginBottom: "1.5rem", background: "#000", border: "1px solid #333", color: "#fff", borderRadius: "8px", minHeight: "80px" }}
            />
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: "0.8rem", background: "#333", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
              <button onClick={handlePostJob} disabled={isUploading} style={{ flex: 1, padding: "0.8rem", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                {isUploading ? "Posting..." : "Post Job"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPLY MODAL */}
      {isApplyModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#111", padding: "2rem", borderRadius: "16px", border: "1px solid #333", width: "90%", maxWidth: "500px" }}>
            <h2 style={{ color: "#fff", marginBottom: "1.5rem" }}>Submit Remote Job Application</h2>
            
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
              placeholder="Cover Letter / Why do you want this role? (Optional)" 
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
