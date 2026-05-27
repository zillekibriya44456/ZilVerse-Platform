"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./jobs.module.css";
import { useAuth } from "@/context/AuthContext";

const MOCK_JOBS = [
  { id: 1, title: "Senior React Developer", company: "TechCorp", location: "Remote", salary: "$80k–$120k/yr", type: "Full-Time", tags: ["React", "TypeScript", "Node.js"], posted: "2 days ago", logo: "TC" },
  { id: 2, title: "Flutter Mobile Developer", company: "AppWorks", location: "Karachi, PK", salary: "$40k–$70k/yr", type: "Full-Time", tags: ["Flutter", "Dart", "Firebase"], posted: "1 day ago", logo: "AW" },
  { id: 3, title: "UI/UX Design Intern", company: "DesignHive", location: "Remote", salary: "$800/mo", type: "Internship", tags: ["Figma", "Adobe XD", "Prototyping"], posted: "3 hours ago", logo: "DH" },
  { id: 4, title: "Backend Engineer (Node.js)", company: "CloudBase", location: "Lahore, PK", salary: "$50k–$80k/yr", type: "Full-Time", tags: ["Node.js", "PostgreSQL", "AWS"], posted: "5 days ago", logo: "CB" },
  { id: 5, title: "Next.js Freelance Project", company: "StartupX", location: "Remote", salary: "$2,000 fixed", type: "Freelance", tags: ["Next.js", "Tailwind", "Prisma"], posted: "12 hours ago", logo: "SX" },
  { id: 6, title: "Machine Learning Engineer", company: "DataMinds", location: "Remote", salary: "$100k–$150k/yr", type: "Full-Time", tags: ["Python", "TensorFlow", "PyTorch"], posted: "4 days ago", logo: "DM" },
];

const TYPES = ["All", "Full-Time", "Freelance", "Internship"];

export default function JobsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dbJobs, setDbJobs] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', company: '', location: 'Remote', salary: '', type: 'Full-Time', description: '', requirements: '' });
  const [isUploading, setIsUploading] = useState(false);

  // Apply Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState({ resumeUrl: '', coverLetter: '' });
  const [isApplying, setIsApplying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    axios.get('http://localhost:5002/api/jobs')
      .then(res => setDbJobs(res.data))
      .catch(err => console.error("Failed to load DB jobs", err));
  }, []);

  const handlePostJob = async () => {
    setIsUploading(true);
    try {
      await axios.post('http://localhost:5002/api/jobs/create', newJob);
      setIsModalOpen(false);
      const res = await axios.get('http://localhost:5002/api/jobs');
      setDbJobs(res.data);
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
      await axios.post('http://localhost:5002/api/jobs/apply', {
        jobId: selectedJobId,
        resumeUrl: applicationData.resumeUrl,
        coverLetter: applicationData.coverLetter
      });
      setIsApplyModalOpen(false);
      setToastMessage("Application submitted successfully!");
      setApplicationData({ resumeUrl: '', coverLetter: '' });
    } catch (err) {
      console.error(err);
      setToastMessage("Failed to submit application.");
    } finally {
      setIsApplying(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const formattedDbJobs = dbJobs.map(j => ({
    id: j.id,
    title: j.title,
    company: j.company,
    location: j.location,
    salary: j.salary,
    type: j.type,
    tags: j.requirements.split(','),
    posted: "Just now",
    logo: j.company.substring(0, 2).toUpperCase()
  }));

  const JOBS = [...formattedDbJobs, ...MOCK_JOBS];

  const filtered = JOBS.filter(j => {
    const matchType = filter === "All" || j.type === filter;
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchSearch;
  });

  return (
    <div className={styles.page}>
      {toastMessage && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#10b981', color: '#fff', padding: '1rem', borderRadius: '8px', zIndex: 9999999 }}>
          {toastMessage}
        </div>
      )}
      <div className="container">
        <div className={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className={styles.title}>Job Board</h1>
              <p className={styles.subtitle}>Find remote jobs, local tech positions, and internships.</p>
            </div>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Post a Job</button>
          </div>

          <div className={styles.searchRow}>
            <input
              type="text"
              placeholder="Search by title, company, or skill..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.filters}>
            {TYPES.map(t => (
              <button
                key={t}
                className={`btn ${filter === t ? "btn-primary" : "btn-secondary"} ${styles.filterBtn}`}
                onClick={() => setFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.jobsList}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>No jobs found matching your search.</div>
          ) : (
            filtered.map(job => (
              <div key={job.id} className={`glass-panel ${styles.jobCard}`}>
                <div className={styles.jobLogo}>{job.logo}</div>
                <div className={styles.jobInfo}>
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                  <p className={styles.jobMeta}>{job.company} • {job.location} • {job.posted}</p>
                  <div className={styles.tags}>
                    {job.tags.map((tag: string) => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className={styles.jobRight}>
                  <span className={`${styles.typeBadge} ${styles[job.type.toLowerCase().replace("-","")]}`}>
                    {job.type}
                  </span>
                  <p className={styles.salary}>{job.salary}</p>
                  <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => handleApplyClick(String(job.id))}>Apply Now</button>
                </div>
              </div>
            ))
          )}
        </div>
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
            <input 
              type="text" 
              placeholder="Portfolio / Resume URL" 
              value={applicationData.resumeUrl}
              onChange={(e) => setApplicationData({...applicationData, resumeUrl: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
            />
            <textarea 
              placeholder="Cover Letter (Optional)" 
              value={applicationData.coverLetter}
              onChange={(e) => setApplicationData({...applicationData, coverLetter: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1.5rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px', minHeight: '120px' }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setIsApplyModalOpen(false)} style={{ flex: 1, padding: '0.8rem', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
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
