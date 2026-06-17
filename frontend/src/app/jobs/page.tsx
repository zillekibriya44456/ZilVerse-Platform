"use client";
import { API_BASE } from "@/utils/api";
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import styles from "./jobs.module.css";
import { useAuth } from "@/context/AuthContext";
import { Search, Briefcase, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

const TYPES = ["All", "Full-Time", "Freelance", "Internship", "Contract"];
const PAGE_SIZE = 12;

export default function JobsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dbJobs, setDbJobs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', company: '', location: 'Remote', salary: '', type: 'Full-Time', description: '', requirements: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState({ resumeUrl: '', coverLetter: '' });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchJobs = useCallback((q: string, type: string, pg: number) => {
    setJobsLoading(true);
    const params: any = { page: pg, limit: PAGE_SIZE };
    if (q.trim()) params.q = q.trim();
    if (type !== "All") params.type = type;
    axios.get(`${API_BASE}/api/jobs`, { params })
      .then(res => {
        // Handle both paginated {data,total} and legacy flat array
        if (res.data?.data) {
          setDbJobs(res.data.data);
          setTotal(res.data.total || 0);
          setTotalPages(res.data.totalPages || 1);
        } else {
          setDbJobs(Array.isArray(res.data) ? res.data : []);
          setTotal(Array.isArray(res.data) ? res.data.length : 0);
          setTotalPages(1);
        }
      })
      .catch(err => console.error("Failed to load jobs:", err))
      .finally(() => setJobsLoading(false));
  }, []);

  // Initial load
  useEffect(() => { fetchJobs("", "All", 1); }, [fetchJobs]);

  // Debounced search + filter
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchJobs(search, filter, 1);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, filter, fetchJobs]);

  const goToPage = (pg: number) => {
    setPage(pg);
    fetchJobs(search, filter, pg);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePostJob = async () => {
    setIsUploading(true);
    try {
      await axios.post(`${API_BASE}/api/jobs/create`, newJob);
      setIsModalOpen(false);
      const res = await axios.get(`${API_BASE}/api/jobs`);
      const raw = res.data?.data ?? res.data;
      setDbJobs(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
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
      setApplicationData({ resumeUrl: '', coverLetter: '' });
      setResumeFile(null);
    } catch (err: any) {
      console.error(err);
      setToastMessage("Failed to submit application: " + (err.response?.data?.error || err.message));
    } finally {
      setIsApplying(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const formattedDbJobs = dbJobs.map(j => ({
    id: j.id,
    title: j.title,
    company: j.company || "Company",
    location: j.location || "Remote",
    salary: j.salary || "Competitive",
    type: j.type || "Full-Time",
    description: j.description || "",
    tags: (j.requirements || "").split(',').map((t: string) => t.trim()).filter(Boolean),
    posted: new Date(j.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    logo: (j.company || "ZV").substring(0, 2).toUpperCase(),
    employer: j.employer,
  }));

  return (
    <div className={styles.page}>
      {/* Toast */}
      {toastMessage && (
        <div className={`toast ${toastMessage.includes('Failed') ? 'toast-error' : 'toast-success'}`}
          style={{ position: 'fixed', top: '88px', right: '20px', zIndex: 9999999 }}>
          {toastMessage}
        </div>
      )}

      <div className="container">
        <div className={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className={styles.title}>Job Board</h1>
              <p className={styles.subtitle}>
                {jobsLoading ? 'Loading...' : `${total.toLocaleString()} opportunities found`}
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Post a Job</button>
          </div>

          {/* Search */}
          <div className={styles.searchRow} style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#71717a', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search by title, company, skill, or location..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Type filters */}
          <div className={styles.filters}>
            {TYPES.map(t => (
              <button key={t}
                className={`btn ${filter === t ? "btn-primary" : "btn-secondary"} ${styles.filterBtn}`}
                onClick={() => { setFilter(t); setPage(1); }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Job list */}
        <div className={styles.jobsList}>
          {jobsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-text" style={{ width: '50%', marginBottom: '0.5rem' }} />
                  <div className="skeleton skeleton-text" style={{ width: '35%' }} />
                </div>
                <div className="skeleton" style={{ width: 90, height: 36, borderRadius: 10 }} />
              </div>
            ))
          ) : formattedDbJobs.length === 0 ? (
            <div className={styles.empty}>
              <Briefcase size={48} color="#52525b" style={{ marginBottom: '1rem' }} />
              <p>No jobs found{search ? ` for "${search}"` : ''}.</p>
              {search && <button className="btn btn-secondary" onClick={() => setSearch('')}>Clear search</button>}
            </div>
          ) : (
            formattedDbJobs.map(job => (
              <div key={job.id} className={`glass-panel ${styles.jobCard}`}>
                <div className={styles.jobLogo}>{job.logo}</div>
                <div className={styles.jobInfo}>
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                  <p className={styles.jobMeta}>
                    <span>{job.company}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}><MapPin size={12} /> {job.location}</span>
                    <span>{job.posted}</span>
                  </p>
                  <div className={styles.tags}>
                    {job.tags.slice(0, 4).map((tag: string) => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className={styles.jobRight}>
                  <span className={`${styles.typeBadge} ${styles[job.type?.toLowerCase().replace(/[^a-z]/g,'')]}`}>
                    {job.type}
                  </span>
                  <p className={styles.salary}>{job.salary}</p>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleApplyClick(String(job.id))}>Apply Now</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!jobsLoading && totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '2rem 0' }}>
            <button
              onClick={() => goToPage(page - 1)} disabled={page <= 1}
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: page <= 1 ? '#52525b' : '#e4e4e7', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => goToPage(p)}
                style={{ width: 36, height: 36, borderRadius: 8, background: page === p ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${page === p ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.08)'}`, color: page === p ? '#c084fc' : '#a1a1aa', cursor: 'pointer', fontWeight: page === p ? 700 : 400 }}>
                {p}
              </button>
            ))}
            <button
              onClick={() => goToPage(page + 1)} disabled={page >= totalPages}
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: page >= totalPages ? '#52525b' : '#e4e4e7', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', padding: '2rem', borderRadius: '16px', border: '1px solid #333', width: '90%', maxWidth: '500px' }}>
            <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Post a Tech Job</h2>
            <input 
              type="text" 
              placeholder="Job Title" 
              value={newJob.title}
              onChange={(e) => setNewJob({...newJob, title: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
            />
            <input 
              type="text" 
              placeholder="Company Name" 
              value={newJob.company}
              onChange={(e) => setNewJob({...newJob, company: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
            />
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <select
                value={newJob.type}
                onChange={(e) => setNewJob({...newJob, type: e.target.value})}
                style={{ flex: 1, padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
              >
                <option>Full-Time</option>
                <option>Internship</option>
                <option>Freelance</option>
              </select>
              <input 
                type="text" 
                placeholder="Salary (e.g. $80k)" 
                value={newJob.salary}
                onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                style={{ flex: 1, padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
              />
            </div>
            <textarea 
              placeholder="Requirements / Tags (comma separated)" 
              value={newJob.requirements}
              onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1.5rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px', minHeight: '80px' }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.8rem', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handlePostJob} disabled={isUploading} style={{ flex: 1, padding: '0.8rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                {isUploading ? 'Posting...' : 'Post Job'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {isApplyModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', padding: '2rem', borderRadius: '16px', border: '1px solid #333', width: '90%', maxWidth: '500px' }}>
            <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Submit Application</h2>
            
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
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', background: '#000', border: '1px solid #333', color: !!resumeFile ? '#555' : '#fff', borderRadius: '8px' }}
            />
            
            <textarea 
              placeholder="Cover Letter (Optional)" 
              value={applicationData.coverLetter}
              onChange={(e) => setApplicationData({...applicationData, coverLetter: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1.5rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px', minHeight: '120px' }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => { setIsApplyModalOpen(false); setResumeFile(null); }} style={{ flex: 1, padding: '0.8rem', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleApplySubmit} disabled={isApplying} style={{ flex: 1, padding: '0.8rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                {isApplying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
