"use client";

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

const PROJECTS = [
  // E-commerce
  {
    id: 1, title: "Full E-Commerce Platform", category: "E-Commerce",
    desc: "Complete online store with product management, cart, payment gateway (Razorpay/Stripe), admin dashboard, and order tracking.",
    tech: ["Next.js", "Node.js", "MongoDB", "Razorpay"],
    price: 4999, originalPrice: 8000, inrPrice: true,
    license: "Commercial", seller: "TechIlahi", rating: 4.9, sales: 42,
    color: "linear-gradient(135deg, #A855F7, #3b82f6)",
    badge: "Bestseller", icon: "🛒",
    image: "/projects/ecommerce.png",
  },
  {
    id: 2, title: "Multi-Vendor Marketplace", category: "E-Commerce",
    desc: "Amazon-style multi-vendor platform with seller registration, product listing, commission system, and buyer checkout.",
    tech: ["React", "Express", "PostgreSQL", "Stripe"],
    price: 6999, originalPrice: 12000, inrPrice: true,
    license: "Commercial", seller: "TechIlahi", rating: 4.8, sales: 18,
    color: "linear-gradient(135deg, #10b981, #3b82f6)",
    badge: "New", icon: "🏪",
    image: "/projects/ecommerce.png",
  },
  // Academic / Final Year
  {
    id: 3, title: "Hospital Management System", category: "Academic",
    desc: "Complete HMS with patient records, doctor appointments, billing, lab reports, and pharmacy management. Includes documentation + PPT.",
    tech: ["PHP", "MySQL", "Bootstrap", "jQuery"],
    price: 1499, originalPrice: 3000, inrPrice: true,
    license: "Academic", seller: "DevStudent", rating: 4.9, sales: 156,
    color: "linear-gradient(135deg, #ef4444, #f97316)",
    badge: "Top Rated", icon: "🏥",
    image: "/projects/hospital.png",
  },
  {
    id: 4, title: "Student Result Management System", category: "Academic",
    desc: "Web app to manage student marks, generate report cards, track attendance and export PDF results. With PPT and viva support.",
    tech: ["Python", "Django", "SQLite", "Bootstrap"],
    price: 999, originalPrice: 2000, inrPrice: true,
    license: "Academic", seller: "CodeHelper", rating: 4.7, sales: 98,
    color: "linear-gradient(135deg, #f59e0b, #ef4444)",
    badge: null, icon: "📊",
    image: "/projects/hospital.png",
  },
  {
    id: 5, title: "Online Food Ordering App", category: "Academic",
    desc: "Restaurant food ordering system with menu management, cart, real-time order tracking, and admin panel. Perfect final year project.",
    tech: ["React", "Node.js", "MongoDB", "Socket.io"],
    price: 1999, originalPrice: 4000, inrPrice: true,
    license: "Academic", seller: "DevStudent", rating: 4.8, sales: 74,
    color: "linear-gradient(135deg, #f97316, #eab308)",
    badge: "Popular", icon: "🍔",
    image: "/projects/food_app.png",
  },
  {
    id: 6, title: "Library Management System", category: "Academic",
    desc: "Book issue/return tracking, fine calculation, member management, and reports. Simple and complete for college submissions.",
    tech: ["Java", "MySQL", "Swing UI"],
    price: 799, originalPrice: 1500, inrPrice: true,
    license: "Academic", seller: "CodeHelper", rating: 4.5, sales: 63,
    color: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
    badge: null, icon: "📚",
    image: "/projects/hospital.png",
  },
  // SaaS / Boilerplates
  {
    id: 7, title: "SaaS Starter Boilerplate", category: "SaaS",
    desc: "Production-ready SaaS template with Next.js 14, Stripe billing, user authentication, dashboard layout, and Prisma ORM.",
    tech: ["Next.js", "TypeScript", "Stripe", "Prisma"],
    price: 7999, originalPrice: 15000, inrPrice: true,
    license: "Commercial", seller: "TechIlahi", rating: 5.0, sales: 31,
    color: "linear-gradient(135deg, #6366f1, #A855F7)",
    badge: "Premium", icon: "🚀",
    image: "/projects/saas.png",
  },
  {
    id: 8, title: "Admin Dashboard Template", category: "SaaS",
    desc: "Beautiful dark-mode admin dashboard with charts, data tables, user management, and real-time notifications. React + TailwindCSS.",
    tech: ["React", "TailwindCSS", "Recharts", "REST API"],
    price: 2499, originalPrice: 4500, inrPrice: true,
    license: "Commercial", seller: "UILabs", rating: 4.8, sales: 87,
    color: "linear-gradient(135deg, #3b82f6, #10b981)",
    badge: "Bestseller", icon: "📈",
    image: "/projects/saas.png",
  },
  // Mobile Apps
  {
    id: 9, title: "Grocery Delivery Flutter App", category: "Mobile App",
    desc: "Full-featured grocery delivery app with customer app, delivery boy app, admin panel, Firebase backend and real-time tracking.",
    tech: ["Flutter", "Firebase", "Google Maps", "Dart"],
    price: 8999, originalPrice: 18000, inrPrice: true,
    license: "Commercial", seller: "AppWorks", rating: 4.9, sales: 22,
    color: "linear-gradient(135deg, #10b981, #06b6d4)",
    badge: "Premium", icon: "🛵",
    image: "/projects/food_app.png",
  },
  {
    id: 10, title: "Chat App with React Native", category: "Mobile App",
    desc: "Real-time chat app like WhatsApp. Features: group chat, media sharing, voice messages, online presence, and push notifications.",
    tech: ["React Native", "Firebase", "Expo", "Redux"],
    price: 4499, originalPrice: 8000, inrPrice: true,
    license: "Commercial", seller: "AppWorks", rating: 4.7, sales: 35,
    color: "linear-gradient(135deg, #A855F7, #ec4899)",
    badge: "New", icon: "💬",
    image: "/projects/food_app.png",
  },
  // Web Apps
  {
    id: 11, title: "Job Portal Website", category: "Web App",
    desc: "LinkedIn-style job portal with employer/candidate profiles, job postings, applications tracking, and resume builder.",
    tech: ["React", "Node.js", "PostgreSQL", "Cloudinary"],
    price: 5499, originalPrice: 9000, inrPrice: true,
    license: "Commercial", seller: "TechIlahi", rating: 4.8, sales: 29,
    color: "linear-gradient(135deg, #f59e0b, #ef4444)",
    badge: null, icon: "💼",
    image: "/projects/saas.png",
  },
  {
    id: 12, title: "Online Learning Platform (LMS)", category: "Web App",
    desc: "Complete LMS with course creation, video hosting, quizzes, certificates, student dashboard, and Razorpay enrollment payment.",
    tech: ["Next.js", "Mux", "Prisma", "Razorpay"],
    price: 9999, originalPrice: 20000, inrPrice: true,
    license: "Commercial", seller: "TechIlahi", rating: 5.0, sales: 15,
    color: "linear-gradient(135deg, #6366f1, #3b82f6)",
    badge: "Premium", icon: "🎓",
    image: "/projects/lms.png",
  },
  {
    id: 13, title: "Hotel Booking System", category: "Web App",
    desc: "Full hotel management system with room booking, availability calendar, POS billing, guest profiles, and PDF invoices.",
    tech: ["PHP", "Laravel", "MySQL", "Bootstrap"],
    price: 3499, originalPrice: 6000, inrPrice: true,
    license: "Commercial", seller: "WebMakers", rating: 4.6, sales: 41,
    color: "linear-gradient(135deg, #06b6d4, #3b82f6)",
    badge: null, icon: "🏨",
    image: "/projects/ecommerce.png",
  },
  // Portfolio / Blog
  {
    id: 14, title: "Developer Portfolio Template", category: "Portfolio",
    desc: "Stunning animated portfolio for developers with dark/light mode, project showcase, blog section, and contact form.",
    tech: ["Next.js", "Framer Motion", "TailwindCSS"],
    price: 999, originalPrice: 2000, inrPrice: true,
    license: "Personal", seller: "UILabs", rating: 4.9, sales: 203,
    color: "linear-gradient(135deg, #A855F7, #ec4899)",
    badge: "Bestseller", icon: "🎨",
    image: "/projects/portfolio.png",
  },
  {
    id: 15, title: "Blog + CMS Platform", category: "Web App",
    desc: "Self-hosted blog platform with Markdown editor, tag management, SEO optimization, newsletter signup, and dark mode.",
    tech: ["Next.js", "MDX", "Prisma", "SendGrid"],
    price: 2999, originalPrice: 5000, inrPrice: true,
    license: "Commercial", seller: "TechIlahi", rating: 4.7, sales: 56,
    color: "linear-gradient(135deg, #10b981, #6366f1)",
    badge: null, icon: "✍️",
    image: "/projects/portfolio.png",
  },
  {
    id: 16, title: "Inventory Management System", category: "Academic",
    desc: "Stock management system for shops and small businesses with purchase orders, sales reports, and low-stock alerts.",
    tech: ["React", "Node.js", "MySQL", "Chart.js"],
    price: 1799, originalPrice: 3500, inrPrice: true,
    license: "Academic", seller: "CodeHelper", rating: 4.6, sales: 48,
    color: "linear-gradient(135deg, #f97316, #A855F7)",
    badge: null, icon: "📦",
    image: "/projects/saas.png",
  },
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
        const response = await axios.post('http://localhost:5002/api/projects/upload-video', formData, {
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
        
        const uploadedUrl = `http://localhost:5002${response.data.videoUrl}`;
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
        const response = await axios.post('http://localhost:5002/api/projects/upload-video', formData, {
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
        
        const uploadedUrl = `http://localhost:5002${response.data.videoUrl}`;
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
      await axios.post('http://localhost:5002/api/projects', {
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
      const res = await axios.get('http://localhost:5002/api/projects');
      setDbProjects(res.data);
    } catch (err: any) {
      alert("Error posting project: " + (err.response?.data?.error || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadSpotlight = async () => {
    try {
      const token = localStorage.getItem('zilverse_token');
      await axios.post('http://localhost:5002/api/spotlights', {
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
      const res = await axios.get('http://localhost:5002/api/spotlights');
      setDbSpotlights(res.data);
    } catch (err: any) {
      alert("Error submitting spotlight: " + (err.response?.data?.error || err.message));
    }
  };

  useEffect(() => {
    axios.get('http://localhost:5002/api/projects')
      .then(res => setDbProjects(res.data))
      .catch(err => console.error("Failed to load DB projects", err));

    axios.get('http://localhost:5002/api/spotlights')
      .then(res => setDbSpotlights(res.data))
      .catch(err => console.error("Failed to load DB spotlights", err));
  }, []);

  const formattedDbProjects = dbProjects.map(p => ({
      id: p.id,
      title: p.title,
      category: "Software", 
      desc: p.description,
      tech: ["Custom DB"],
      price: p.price,
      originalPrice: p.price * 1.5,
      inrPrice: true,
      license: "Commercial",
      seller: p.seller?.name || "Global Creator",
      rating: 5.0,
      sales: Math.floor(Math.random() * 50),
      color: "linear-gradient(135deg, #10b981, #3b82f6)",
      badge: "New Database",
      icon: "💻",
      image: "/projects/saas.png",
      videoUrl: p.videoUrl || null,
  }));

  const ALL_PROJECTS = [...formattedDbProjects, ...PROJECTS];

  let filtered = ALL_PROJECTS.filter(p => {
    const matchCat = category === "All" || p.category === category || p.category === "Software";
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.desc.toLowerCase().includes(search.toLowerCase()) ||
      p.tech.some(t => t.toLowerCase().includes(search.toLowerCase()));
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
              <span className={styles.hNum}>{PROJECTS.length}+</span>
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
                    {p.tech.map(t => <span key={t} className={styles.techTag}>{t}</span>)}
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
                      onClick={() => setDetailsProject(p)}
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
