"use client";
import { API_BASE } from "@/utils/api";

import Image from "next/image";

import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./projects.module.css";
import TiltCard from "@/components/TiltCard";
import PaymentModal from "@/components/PaymentModal";
import { useAuth } from "@/context/AuthContext";

const CREATORS = [
  {
    id: 1,
    name: "Alex Mercer",
    role: "Senior Full-Stack Dev",
    pitch: "I've built a scalable SaaS boilerplate using Next.js 14 and Stripe. Watch how it can save you 100+ hours of setup time.",
    image: "/creators/creator_1.png",
    project: "SaaS Starter Boilerplate",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    id: 2,
    name: "Sarah Chen",
    role: "Lead UI/UX Designer",
    pitch: "My animated portfolio template uses Framer Motion to wow recruiters. Let me walk you through the codebase.",
    image: "/creators/creator_2.png",
    project: "Developer Portfolio Template",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    id: 3,
    name: "David Lee",
    role: "AI Systems Engineer",
    pitch: "Want to build AI apps? I'll show you how my Node.js backend handles rate limiting and LLM streaming securely.",
    image: "/creators/creator_3.png",
    project: "AI Backend Template",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }
];



const CATEGORIES = ["All", "E-Commerce", "Academic", "SaaS", "Mobile App", "Web App", "Portfolio"];
const SORT_OPTIONS = ["Popular", "Price: Low to High", "Price: High to Low", "Newest"];
const WA_LINK = "https://wa.me/917091780179?text=Hi!%20I'm%20interested%20in%20buying%20a%20project%20from%20ZilVerse.";

export default function ProjectsPage() {
  const { user, token } = useAuth();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Popular");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [detailsProject, setDetailsProject] = useState<any>(null);
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [dbSpotlights, setDbSpotlights] = useState<any[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSpotlightModalOpen, setIsSpotlightModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', price: 99, videoUrl: '' });
  const [newSpotlight, setNewSpotlight] = useState({ name: '', role: '', pitch: '', videoUrl: '', project: '' });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [spotlightFile, setSpotlightFile] = useState<File | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingSpotlight, setIsUploadingSpotlight] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [spotlightProgress, setSpotlightProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [activeSpotlightVideo, setActiveSpotlightVideo] = useState<string | null>(null);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [editPaymentForm, setEditPaymentForm] = useState({
    paymentMethods: [] as string[],
    upiId: "",
    bankName: "",
    bankAccount: "",
    ifscCode: "",
    razorpayEnabled: false
  });

  const handleViewDetails = (project: any) => {
    setDetailsProject(project);
    setIsEditingPayment(false);
    let parsedMethods: string[] = [];
    try {
      if (project.paymentMethods) {
        parsedMethods = typeof project.paymentMethods === 'string' ? JSON.parse(project.paymentMethods) : project.paymentMethods;
      }
    } catch (e) {
      parsedMethods = [];
    }
    setEditPaymentForm({
      paymentMethods: Array.isArray(parsedMethods) ? parsedMethods : [],
      upiId: project.upiId || "",
      bankName: project.bankName || "",
      bankAccount: project.bankAccount || "",
      ifscCode: project.ifscCode || "",
      razorpayEnabled: !!project.razorpayEnabled
    });
  };

  const handleSavePaymentInfo = async (projectId: string) => {
    try {
      const token = localStorage.getItem('zilverse_token');
      await axios.patch(`${API_BASE}/api/projects/${projectId}/payment-info`, editPaymentForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Payment details updated successfully!");
      setIsEditingPayment(false);
      
      setDetailsProject((prev: any) => ({
        ...prev,
        paymentMethods: JSON.stringify(editPaymentForm.paymentMethods),
        upiId: editPaymentForm.upiId,
        bankName: editPaymentForm.bankName,
        bankAccount: editPaymentForm.bankAccount,
        ifscCode: editPaymentForm.ifscCode,
        razorpayEnabled: editPaymentForm.razorpayEnabled
      }));

      const res = await axios.get(`${API_BASE}/api/projects`);
      const raw = res.data?.data ?? res.data;
      setDbProjects(Array.isArray(raw) ? raw : []);
    } catch (err: any) {
      alert("Failed to update payment info: " + (err.response?.data?.error || err.message));
    }
  };

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setVideoFile(file);
      setIsUploadingVideo(true);
      setVideoUploadProgress(0);
      
      try {
        const formData = new FormData();
        formData.append('video', file);
        
        const token = localStorage.getItem('zilverse_token');
        const response = await axios.post(`${API_BASE}/api/projects/upload-video`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const total = progressEvent.total || file.size;
            const progress = Math.round((progressEvent.loaded * 100) / total);
            setVideoUploadProgress(progress);
          }
        });
        
        const uploadedUrl = `${API_BASE}${response.data.videoUrl}`;
        setNewProject(prev => ({ ...prev, videoUrl: uploadedUrl }));
      } catch (err: any) {
        alert("Video upload failed: " + (err.response?.data?.error || err.message));
        setVideoFile(null);
      } finally {
        setIsUploadingVideo(false);
      }
    }
  };

  const handleSpotlightFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setSpotlightFile(file);
      setIsUploadingSpotlight(true);
      setSpotlightProgress(0);
      
      try {
        const formData = new FormData();
        formData.append('video', file);
        
        const token = localStorage.getItem('zilverse_token');
        const response = await axios.post(`${API_BASE}/api/projects/upload-video`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const total = progressEvent.total || file.size;
            const progress = Math.round((progressEvent.loaded * 100) / total);
            setSpotlightProgress(progress);
          }
        });
        
        const uploadedUrl = `${API_BASE}${response.data.videoUrl}`;
        setNewSpotlight(prev => ({ ...prev, videoUrl: uploadedUrl }));
      } catch (err: any) {
        alert("Spotlight video upload failed: " + (err.response?.data?.error || err.message));
        setSpotlightFile(null);
      } finally {
        setIsUploadingSpotlight(false);
      }
    }
  };

  const handleUploadProject = async () => {
    setIsUploading(true);
    try {
      const token = localStorage.getItem('zilverse_token');
      await axios.post(`${API_BASE}/api/projects`, {
        title: newProject.title,
        description: newProject.description,
        price: newProject.price,
        videoUrl: newProject.videoUrl || null,
        sellerId: user?.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Project Successfully Uploaded to Database!");
      setNewProject({ title: '', description: '', price: 99, videoUrl: '' });
      setVideoFile(null);
      setIsUploadModalOpen(false);
      const res = await axios.get(`${API_BASE}/api/projects`);
      const raw = res.data?.data ?? res.data;
      setDbProjects(Array.isArray(raw) ? raw : []);
    } catch (err: any) {
      alert("Error posting project: " + (err.response?.data?.error || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadSpotlight = async () => {
    try {
      const token = localStorage.getItem('zilverse_token');
      await axios.post(`${API_BASE}/api/spotlights`, {
        name: newSpotlight.name,
        role: newSpotlight.role,
        pitch: newSpotlight.pitch,
        videoUrl: newSpotlight.videoUrl,
        project: newSpotlight.project,
        userId: user?.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Spotlight Submitted Successfully!");
      setNewSpotlight({ name: '', role: '', pitch: '', videoUrl: '', project: '' });
      setSpotlightFile(null);
      setIsSpotlightModalOpen(false);
      const res = await axios.get(`${API_BASE}/api/spotlights`);
      const raw = res.data?.data ?? res.data;
      setDbSpotlights(Array.isArray(raw) ? raw : []);
    } catch (err: any) {
      alert("Error submitting spotlight: " + (err.response?.data?.error || err.message));
    }
  };

  useEffect(() => {
    axios.get(`${API_BASE}/api/projects`)
      .then(res => {
        const raw = res.data?.data ?? res.data;
        setDbProjects(Array.isArray(raw) ? raw : []);
      })
      .catch(err => console.error("Failed to load DB projects", err));

    axios.get(`${API_BASE}/api/spotlights`)
      .then(res => {
        const raw = res.data?.data ?? res.data;
        setDbSpotlights(Array.isArray(raw) ? raw : []);
      })
      .catch(err => console.error("Failed to load DB spotlights", err));
  }, []);

  const formattedDbProjects = dbProjects.map(p => ({
    id: p.id,
    title: p.title,
    category: p.category || "Software",
    desc: p.description,
    tech: p.tech ? (Array.isArray(p.tech) ? p.tech : p.tech.split(',').map((t: string) => t.trim())) : ["Custom Build"],
    price: p.price,
    originalPrice: Math.round(p.price * 1.5),
    inrPrice: true,
    license: "Commercial",
    seller: p.seller?.name || "Global Creator",
    sellerId: p.sellerId,
    rating: p.rating || 5.0,
    sales: ((p.id?.charCodeAt(0) || 65) % 50) + 1, // deterministic
    color: "linear-gradient(135deg, #10b981, #3b82f6)",
    badge: "Live on DB",
    icon: "💻",
    image: p.images?.[0] || "/projects/saas.png",
    videoUrl: p.videoUrl || null,
    paymentMethods: p.paymentMethods,
    upiId: p.upiId,
    bankName: p.bankName,
    bankAccount: p.bankAccount,
    ifscCode: p.ifscCode,
    razorpayEnabled: p.razorpayEnabled,
  }));


  const ALL_PROJECTS = [...formattedDbProjects];

  let filtered = ALL_PROJECTS.filter(p => {
    const matchCat = category === "All" || p.category === category || p.category === "Software";
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.desc.toLowerCase().includes(search.toLowerCase()) ||
      p.tech.some((t: string) => t.toLowerCase().includes(search.toLowerCase()));
    const matchPrice = p.price <= maxPrice;
    return matchCat && matchSearch && matchPrice;
  });

  if (sort === "Price: Low to High") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "Price: High to Low") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sort === "Popular") filtered = [...filtered].sort((a, b) => b.sales - a.sales);

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Project Marketplace</h1>
            <p className={styles.subtitle}>
              Ready-made source code, SaaS boilerplates, mobile apps & academic projects.<br />
              Buy instantly & download. All projects include full source code.
            </p>
            <button className="btn btn-primary" onClick={() => setIsUploadModalOpen(true)} style={{ marginTop: '1rem' }}>
              + Upload New Project
            </button>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.hStat}>
              <span className={styles.hNum}>{formattedDbProjects.length}+</span>
              <span className={styles.hLabel}>Projects</span>
            </div>
            <div className={styles.hStat}>
              <span className={styles.hNum}>₹799</span>
              <span className={styles.hLabel}>Starting at</span>
            </div>
            <div className={styles.hStat}>
              <span className={styles.hNum}>⚡ Instant</span>
              <span className={styles.hLabel}>Download</span>
            </div>
          </div>
        </div>

        {/* Creator Showcase */}
        {(() => {
          const formattedDbSpotlights = dbSpotlights.map(s => ({
            id: s.id,
            name: s.name,
            role: s.role,
            pitch: s.pitch,
            videoUrl: s.videoUrl,
            image: s.image || '/creators/creator_1.png',
            project: s.project
          }));
          const ALL_CREATORS = [...formattedDbSpotlights, ...CREATORS];

          return (
            <div className={styles.showcaseSection}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 className={styles.showcaseTitle} style={{ margin: 0 }}>
                  <span>🎥</span> Creator Spotlights
                </h2>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setIsSpotlightModalOpen(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.9rem', border: '1px solid #333' }}
                >
                  ✨ Submit Spotlight Pitch
                </button>
              </div>
              <div className={styles.showcaseGrid}>
                {ALL_CREATORS.map(c => (
                  <div 
                    key={c.id} 
                    className={styles.creatorCard} 
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      if (c.videoUrl) setActiveSpotlightVideo(c.videoUrl);
                      else alert("No video demo available for this creator spotlight.");
                    }}
                  >
                    <Image
                      src={c.image}
                      alt={c.name}
                      fill
                      className={styles.creatorImage}
                      sizes="(max-width: 768px) 280px, 280px"
                    />
                    <div className={styles.playOverlay}>
                      <div className={styles.playBtn}>▶</div>
                      <div className={styles.creatorInfo}>
                        <h3>{c.name}</h3>
                        <p>{c.role}</p>
                        <p className={styles.creatorPitch}>"{c.pitch}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Search + Sort */}
        <div className={styles.toolBar}>
          <input
            type="text"
            placeholder="🔍  Search by name, tech, category..."
            className={styles.searchInput}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className={styles.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        {/* Category Filters */}
        <div className={styles.filters}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`btn ${category === c ? "btn-primary" : "btn-secondary"} ${styles.filterBtn}`}
            >
              {c}
            </button>
          ))}
          <div className={styles.priceFilter}>
            <span>Max: ₹{maxPrice.toLocaleString()}</span>
            <input
              type="range"
              min={799}
              max={10000}
              step={200}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className={styles.priceRange}
            />
          </div>
        </div>

        {/* Results count */}
        <p className={styles.resultCount}>
          Showing <strong>{filtered.length}</strong> project{filtered.length !== 1 ? "s" : ""}
          {category !== "All" ? ` in ${category}` : ""}
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <span>🔍</span>
            <p>No projects found. Try a different search or filter.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(p => (
              <TiltCard key={p.id}>
                <div className={styles.card}>
                {/* Cover */}
                <div className={styles.cover}>
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className={styles.coverImg}
                    sizes="(max-width: 768px) 100vw, 350px"
                  />
                  <div className={styles.coverOverlay} style={{ background: p.color.replace("linear-gradient", "linear-gradient").replace("135deg,", "135deg, ") + "88" }} />
                  {p.badge && <span className={styles.badge}>{p.badge}</span>}
                  <span className={styles.categoryTag}>{p.category}</span>
                  <span className={styles.coverIcon}>{p.icon}</span>
                </div>

                {/* Body */}
                <div className={styles.body}>
                  <h3 className={styles.cardTitle}>{p.title}</h3>
                  <p className={styles.seller}>by {p.seller}</p>

                  {/* Rating */}
                  <div className={styles.ratingRow}>
                    <span className={styles.stars}>{"⭐".repeat(Math.floor(p.rating))}</span>
                    <span className={styles.ratingNum}>{p.rating} ({p.sales} sold)</span>
                  </div>

                  <p className={styles.desc}>{p.desc}</p>

                  {/* Tech stack */}
                  <div className={styles.techRow}>
                    {p.tech.map((t: string) => <span key={t} className={styles.techTag}>{t}</span>)}
                  </div>

                  {/* Price row */}
                  <div className={styles.priceRow}>
                    <div>
                      <span className={styles.price}>₹{p.price.toLocaleString()}</span>
                      <span className={styles.originalPrice}>₹{p.originalPrice.toLocaleString()}</span>
                      <span className={styles.discount}>
                        {Math.round((1 - p.price / p.originalPrice) * 100)}% OFF
                      </span>
                    </div>
                    <span className={`${styles.license} ${styles[p.license.toLowerCase()]}`}>
                      {p.license}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className={styles.actions}>
                    <button
                      onClick={() => handleViewDetails(p)}
                      className="btn btn-secondary"
                    >
                      📺 Details & Demo
                    </button>
                  </div>
                </div>
              </div>
              </TiltCard>
            ))}
          </div>
        )}

        {/* Custom Project CTA */}
        <div className={styles.customCta}>
          <div className={`glass-panel ${styles.ctaBox}`}>
            <span className={styles.ctaEmoji}>🚀</span>
            <div>
              <h3>Monetize Your Code: Sell Your Project</h3>
              <p>Are you a developer? Turn your side projects into passive income. Join ZilVerse as a Creator and sell to thousands of buyers worldwide.</p>
            </div>
            <a href="https://wa.me/917091780179?text=Hi!%20I%20want%20to%20sell%20my%20project%20on%20ZilVerse." target="_blank" rel="noreferrer" className="btn btn-primary">
              ✨ Apply as Creator
            </a>
          </div>
        </div>
      </div>

      {selectedProject && (
        <PaymentModal
          projectTitle={selectedProject.title}
          price={selectedProject.price}
          sellerId={selectedProject.sellerId || selectedProject.userId}
          onClose={() => setSelectedProject(null)}
          onSuccess={() => {
            alert(`Download link for ${selectedProject.title} has been sent to your email!`);
            setSelectedProject(null);
          }}
        />
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', padding: '2rem', borderRadius: '16px', border: '1px solid #333', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Sell Your Project</h2>
            <input 
              type="text" 
              placeholder="Project Title" 
              value={newProject.title}
              onChange={(e) => setNewProject({...newProject, title: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
            />
            <textarea 
              placeholder="Project Description" 
              value={newProject.description}
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px', minHeight: '100px' }}
            />
            <input 
              type="number" 
              placeholder="Price (₹)" 
              value={newProject.price}
              onChange={(e) => setNewProject({...newProject, price: parseInt(e.target.value)})}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
            />

            {/* Optional Demo Video URL */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Demo Video Link (Optional)</label>
              <input 
                type="text" 
                placeholder="YouTube, Loom, or Drive URL" 
                value={newProject.videoUrl || ''}
                onChange={(e) => setNewProject({...newProject, videoUrl: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
              />
            </div>

            {/* Optional Demo Video File */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Or Upload Demo Video File (Optional)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px dashed #444', borderRadius: '8px', padding: '0.8rem', background: '#070707' }}>
                <label style={{ cursor: 'pointer', background: '#222', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid #333', fontWeight: 'bold' }}>
                  🎥 Select Video
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={handleVideoFileChange}
                    style={{ display: 'none' }} 
                  />
                </label>
                <span style={{ color: '#888', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {videoFile ? `✅ ${videoFile.name}` : 'No file selected'}
                </span>
                {videoFile && (
                  <button 
                    type="button" 
                    onClick={() => { setVideoFile(null); setNewProject({...newProject, videoUrl: ''}); }}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}
                  >
                    ✕
                  </button>
                )}
              </div>
              {isUploadingVideo && (
                <div style={{ width: '100%', height: '4px', background: '#222', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: `${videoUploadProgress}%`, height: '100%', background: '#3b82f6', transition: 'width 0.2s' }}></div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setIsUploadModalOpen(false)} style={{ flex: 1, padding: '0.8rem', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleUploadProject} disabled={isUploading} style={{ flex: 1, padding: '0.8rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                {isUploading ? 'Posting...' : 'Post Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details & Demo Modal */}
      {detailsProject && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#111', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', width: '90%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button 
              onClick={() => setDetailsProject(null)} 
              style={{ position: 'absolute', top: '1rem', right: '1.2rem', background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
            >
              ✕
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2rem' }}>{detailsProject.icon || '💻'}</span>
              <div>
                <h2 style={{ color: '#fff', margin: 0, fontSize: '1.6rem' }}>{detailsProject.title}</h2>
                <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>Published by <strong>{detailsProject.seller}</strong></p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '0.8rem 0' }}>
              <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>{detailsProject.category}</span>
              <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>⭐ {detailsProject.rating} ({detailsProject.sales} sold)</span>
              <span style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>{detailsProject.license} License</span>
            </div>

            <p style={{ color: '#ccc', lineHeight: '1.6', fontSize: '0.95rem', margin: '1rem 0' }}>{detailsProject.desc}</p>
            
            <div style={{ marginBottom: '1.2rem' }}>
              <h4 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '0.95rem' }}>Technology Stack</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {detailsProject.tech?.map((t: string) => (
                  <span key={t} style={{ background: '#222', border: '1px solid #333', color: '#e4e4e7', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem' }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Video Demo Section */}
            {detailsProject.videoUrl ? (
              <div style={{ marginBottom: '1.5rem', background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', padding: '1rem', overflow: 'hidden' }}>
                <h4 style={{ color: '#fff', margin: '0 0 0.8rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  🎥 Project Demo Video
                </h4>
                {detailsProject.videoUrl.startsWith('http') && (detailsProject.videoUrl.includes('youtube.com') || detailsProject.videoUrl.includes('youtu.be')) ? (
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
                    <iframe 
                      src={detailsProject.videoUrl.replace('watch?v=', 'embed/')} 
                      frameBorder="0" 
                      allowFullScreen 
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '8px' }}
                    />
                  </div>
                ) : detailsProject.videoUrl.startsWith('http') && detailsProject.videoUrl.includes('uploads/videos') ? (
                  <video 
                    controls 
                    style={{ width: '100%', borderRadius: '8px', border: '1px solid #333' }}
                  >
                    <source src={detailsProject.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div style={{ padding: '1rem', background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                      <span style={{ color: '#3b82f6', textDecoration: 'underline', fontSize: '0.9rem', cursor: 'pointer' }} onClick={() => window.open(detailsProject.videoUrl, '_blank')}>
                        {detailsProject.videoUrl}
                      </span>
                    </div>
                    <button 
                      onClick={() => window.open(detailsProject.videoUrl, '_blank')} 
                      style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Open Demo ↗
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ marginBottom: '1.5rem', background: '#111', border: '1px dashed #222', borderRadius: '12px', padding: '1rem', textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>
                ℹ️ No demo video uploaded for this project.
              </div>
            )}

            {/* Payment Info Section */}
            <div style={{ marginBottom: '1.5rem', background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ color: '#fff', margin: 0, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  💳 Seller Payment Information
                </h4>
                {detailsProject.sellerId === user?.id && (
                  <button 
                    onClick={() => setIsEditingPayment(!isEditingPayment)} 
                    style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                  >
                    {isEditingPayment ? 'Cancel' : '⚙️ Edit Info'}
                  </button>
                )}
              </div>

              {isEditingPayment ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div>
                    <label style={{ color: '#aaa', fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Accepted Payment Methods</label>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {['UPI', 'Bank', 'Razorpay'].map(method => {
                        const isChecked = editPaymentForm.paymentMethods.includes(method);
                        return (
                          <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff', fontSize: '0.85rem', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={(e) => {
                                let updated = [...editPaymentForm.paymentMethods];
                                if (e.target.checked) {
                                  if (!updated.includes(method)) updated.push(method);
                                } else {
                                  updated = updated.filter(m => m !== method);
                                }
                                setEditPaymentForm({ ...editPaymentForm, paymentMethods: updated });
                              }}
                            />
                            {method}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {editPaymentForm.paymentMethods.includes('UPI') && (
                    <div>
                      <input 
                        type="text" 
                        placeholder="UPI ID (e.g. user@okaxis)" 
                        value={editPaymentForm.upiId}
                        onChange={e => setEditPaymentForm({ ...editPaymentForm, upiId: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem 0.8rem', background: '#09090b', border: '1px solid #27272a', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}
                      />
                    </div>
                  )}

                  {editPaymentForm.paymentMethods.includes('Bank') && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        placeholder="Bank Name" 
                        value={editPaymentForm.bankName}
                        onChange={e => setEditPaymentForm({ ...editPaymentForm, bankName: e.target.value })}
                        style={{ padding: '0.6rem 0.8rem', background: '#09090b', border: '1px solid #27272a', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}
                      />
                      <input 
                        type="text" 
                        placeholder="IFSC Code" 
                        value={editPaymentForm.ifscCode}
                        onChange={e => setEditPaymentForm({ ...editPaymentForm, ifscCode: e.target.value })}
                        style={{ padding: '0.6rem 0.8rem', background: '#09090b', border: '1px solid #27272a', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}
                      />
                      <input 
                        type="text" 
                        placeholder="Account Number" 
                        value={editPaymentForm.bankAccount}
                        onChange={e => setEditPaymentForm({ ...editPaymentForm, bankAccount: e.target.value })}
                        style={{ gridColumn: 'span 2', padding: '0.6rem 0.8rem', background: '#09090b', border: '1px solid #27272a', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <input 
                      type="checkbox" 
                      id="rzpToggle"
                      checked={editPaymentForm.razorpayEnabled}
                      onChange={e => setEditPaymentForm({ ...editPaymentForm, razorpayEnabled: e.target.checked })}
                    />
                    <label htmlFor="rzpToggle" style={{ color: '#fff', fontSize: '0.85rem', cursor: 'pointer' }}>Enable Razorpay Gateway Direct checkout</label>
                  </div>

                  <button 
                    onClick={() => handleSavePaymentInfo(detailsProject.id)}
                    style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.6rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', marginTop: '0.25rem' }}
                  >
                    Save Payment Options
                  </button>
                </div>
              ) : (
                <div>
                  {(() => {
                    let methods: string[] = [];
                    try {
                      if (detailsProject.paymentMethods) {
                        methods = typeof detailsProject.paymentMethods === 'string' ? JSON.parse(detailsProject.paymentMethods) : detailsProject.paymentMethods;
                      }
                    } catch (e) {}

                    if (!methods || methods.length === 0) {
                      return <span style={{ color: '#71717a', fontSize: '0.85rem' }}>No direct payment options listed by seller. Use standard checkout.</span>;
                    }

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {methods.map(m => (
                            <span key={m} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                              {m === 'Bank' ? '🏦 Bank Transfer' : m === 'UPI' ? '📱 UPI Pay' : '💳 Razorpay'}
                            </span>
                          ))}
                        </div>

                        {methods.includes('UPI') && detailsProject.upiId && (
                          <div style={{ background: '#09090b', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{ color: '#71717a', fontSize: '0.75rem', display: 'block' }}>UPI ID</span>
                              <code style={{ color: '#e4e4e7', fontSize: '0.85rem' }}>{detailsProject.upiId}</code>
                            </div>
                            <button 
                              onClick={() => { navigator.clipboard.writeText(detailsProject.upiId); alert('UPI ID Copied!'); }}
                              style={{ background: '#222', border: '1px solid #333', color: '#fff', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Copy
                            </button>
                          </div>
                        )}

                        {methods.includes('Bank') && detailsProject.bankName && (
                          <div style={{ background: '#09090b', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #27272a' }}>
                            <span style={{ color: '#71717a', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Bank Account Details</span>
                            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.25rem', fontSize: '0.8rem', color: '#e4e4e7' }}>
                              <span style={{ color: '#71717a' }}>Bank Name:</span>
                              <strong>{detailsProject.bankName}</strong>
                              <span style={{ color: '#71717a' }}>Account No:</span>
                              <strong>{detailsProject.bankAccount}</strong>
                              <span style={{ color: '#71717a' }}>IFSC Code:</span>
                              <strong>{detailsProject.ifscCode}</strong>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #222', paddingTop: '1.2rem', marginTop: '1rem' }}>
              <div>
                <span style={{ color: '#888', fontSize: '0.85rem' }}>Instant Download Price</span>
                <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold' }}>₹{detailsProject.price.toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button onClick={() => setDetailsProject(null)} style={{ background: '#222', color: '#fff', border: '1px solid #333', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>Close</button>
                <button 
                  onClick={() => {
                    setDetailsProject(null);
                    setSelectedProject(detailsProject);
                  }} 
                  style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  🛒 Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Creator Spotlight Modal */}
      {isSpotlightModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', padding: '2rem', borderRadius: '16px', border: '1px solid #333', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Submit Creator Spotlight</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Your Name</label>
              <input 
                type="text" 
                placeholder="e.g. Alex Mercer" 
                value={newSpotlight.name}
                onChange={(e) => setNewSpotlight({...newSpotlight, name: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Your Role / Title</label>
              <input 
                type="text" 
                placeholder="e.g. Senior Full-Stack Dev" 
                value={newSpotlight.role}
                onChange={(e) => setNewSpotlight({...newSpotlight, role: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Project Name</label>
              <input 
                type="text" 
                placeholder="e.g. SaaS Starter Boilerplate" 
                value={newSpotlight.project}
                onChange={(e) => setNewSpotlight({...newSpotlight, project: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Your Spotlight Pitch / Intro</label>
              <textarea 
                placeholder="Describe your project, expertise, or what makes you unique..." 
                value={newSpotlight.pitch}
                onChange={(e) => setNewSpotlight({...newSpotlight, pitch: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px', minHeight: '80px' }}
              />
            </div>

            {/* Optional Spotlight Video URL */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Spotlight Video Link</label>
              <input 
                type="text" 
                placeholder="YouTube or Loom URL" 
                value={newSpotlight.videoUrl}
                onChange={(e) => setNewSpotlight({...newSpotlight, videoUrl: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
              />
            </div>

            {/* Optional Spotlight Video File */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Or Upload Video File</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px dashed #444', borderRadius: '8px', padding: '0.8rem', background: '#070707' }}>
                <label style={{ cursor: 'pointer', background: '#222', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid #333', fontWeight: 'bold' }}>
                  🎥 Select Video
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={handleSpotlightFileChange}
                    style={{ display: 'none' }} 
                  />
                </label>
                <span style={{ color: '#888', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {spotlightFile ? `✅ ${spotlightFile.name}` : 'No file selected'}
                </span>
                {spotlightFile && (
                  <button 
                    type="button" 
                    onClick={() => { setSpotlightFile(null); setNewSpotlight({...newSpotlight, videoUrl: ''}); }}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}
                  >
                    ✕
                  </button>
                )}
              </div>
              {isUploadingSpotlight && (
                <div style={{ width: '100%', height: '4px', background: '#222', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: `${spotlightProgress}%`, height: '100%', background: '#3b82f6', transition: 'width 0.2s' }}></div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setIsSpotlightModalOpen(false)} style={{ flex: 1, padding: '0.8rem', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button 
                onClick={handleUploadSpotlight} 
                disabled={isUploadingSpotlight || !newSpotlight.name || !newSpotlight.role || !newSpotlight.pitch} 
                style={{ flex: 1, padding: '0.8rem', background: '#a855f7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Submit Pitch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spotlight Video Overlay Modal */}
      {activeSpotlightVideo && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }} onClick={() => setActiveSpotlightVideo(null)}>
          <div style={{ position: 'relative', width: '90%', maxWidth: '800px', background: '#000', borderRadius: '16px', overflow: 'hidden', border: '1px solid #333' }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setActiveSpotlightVideo(null)} 
              style={{ position: 'absolute', top: '1rem', right: '1.2rem', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10, width: '36px', height: '36px', borderRadius: '50%' }}
            >
              ✕
            </button>
            {activeSpotlightVideo.startsWith('http') && (activeSpotlightVideo.includes('youtube.com') || activeSpotlightVideo.includes('youtu.be')) ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                <iframe 
                  src={activeSpotlightVideo.replace('watch?v=', 'embed/')} 
                  frameBorder="0" 
                  allowFullScreen 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                />
              </div>
            ) : (
              <video 
                controls 
                autoPlay 
                style={{ width: '100%', display: 'block' }}
              >
                <source src={activeSpotlightVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
