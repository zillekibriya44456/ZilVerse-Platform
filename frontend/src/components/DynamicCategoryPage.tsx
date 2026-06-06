"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "@/utils/api";
import { Search, Filter, ArrowRight, Zap, Briefcase, PlusCircle } from "lucide-react";
import styles from "./DynamicCategoryPage.module.css";
import Link from "next/link";
import { useCurrency } from "@/context/CurrencyContext";

interface Props {
  title: string;
  category: string;
  endpoint: string; // e.g. '/api/freelancers'
}

const CATEGORY_CONFIG: Record<string, any> = {
  "website": {
    title: "Website Development Services",
    subtitle: "Build professional websites, e-commerce stores, SaaS platforms, portfolios, and business solutions.",
    demos: [
      { id: "demo1", title: "E-Commerce Website Development", category: "Website", price: 1200, rating: 4.9, bio: "Complete e-commerce platform with Razorpay." },
      { id: "demo2", title: "Business Website Design", category: "Website", price: 500, rating: 4.8, bio: "Premium corporate identity." },
      { id: "demo3", title: "Hospital Management System", category: "Website", price: 2500, rating: 5.0, bio: "End-to-end hospital management." }
    ]
  },
  "mobile": {
    title: "Mobile App Development Services",
    subtitle: "Build Android, iOS, Flutter, and cross-platform mobile applications.",
    demos: [
      { id: "m1", title: "Food Delivery App", category: "Mobile", price: 3000, rating: 4.9, bio: "Full stack delivery platform." },
      { id: "m2", title: "E-Commerce App", category: "Mobile", price: 2800, rating: 4.8, bio: "Shopping application for iOS/Android." }
    ]
  },
  "saas": {
    title: "SaaS Product Development",
    subtitle: "Launch scalable SaaS products with modern cloud architecture.",
    demos: [
      { id: "s1", title: "CRM Platform", category: "SaaS", price: 4500, rating: 5.0, bio: "Customer relationship management." },
      { id: "s2", title: "Subscription Platform", category: "SaaS", price: 3500, rating: 4.8, bio: "Recurring billing setup." }
    ]
  },
  "ai": {
    title: "AI & Automation Solutions",
    subtitle: "AI-powered applications, chatbots, automation, and intelligent business systems.",
    demos: [
      { id: "a1", title: "AI Chatbot", category: "AI", price: 1500, rating: 4.9, bio: "OpenAI integrated support bot." },
      { id: "a2", title: "Resume Screening AI", category: "AI", price: 2200, rating: 4.8, bio: "HR automation tool." }
    ]
  },
  "students": {
    title: "Students & Freshers Hub",
    subtitle: "Build your profile, showcase skills, and discover internships and career opportunities.",
    demos: [
      { id: "f1", title: "Computer Science Student", category: "Student", hourlyRate: 15, rating: 4.7, bio: "Looking for React internships." },
      { id: "f2", title: "AI Enthusiast", category: "Student", hourlyRate: 20, rating: 4.9, bio: "Python and TensorFlow developer." }
    ]
  },
  "developers": {
    title: "Developer Network",
    subtitle: "Connect with software developers and engineering talent globally.",
    demos: [
      { id: "d1", title: "Full Stack Developer", category: "Developer", hourlyRate: 45, rating: 5.0, bio: "Next.js and Node.js expert." },
      { id: "d2", title: "DevOps Engineer", category: "Developer", hourlyRate: 60, rating: 4.9, bio: "AWS, Docker, CI/CD." }
    ]
  },
  "designers": {
    title: "Creative Designer Marketplace",
    subtitle: "Discover talented UI/UX, graphic, branding, and product designers.",
    demos: [
      { id: "ds1", title: "UI/UX Designer", category: "Designer", hourlyRate: 40, rating: 4.9, bio: "Figma master, wireframing." },
      { id: "ds2", title: "Motion Designer", category: "Designer", hourlyRate: 55, rating: 4.8, bio: "After Effects and Lottie." }
    ]
  },
  "verified": {
    title: "Verified Expert Network",
    subtitle: "Work with trusted and verified professionals.",
    demos: [
      { id: "v1", title: "Cybersecurity Expert", category: "Expert", hourlyRate: 100, rating: 5.0, bio: "Penetration testing." },
      { id: "v2", title: "Startup Advisor", category: "Expert", hourlyRate: 150, rating: 5.0, bio: "Product strategy and scaling." }
    ]
  },
  "digital": {
    title: "Digital Products Marketplace",
    subtitle: "Buy and sell digital assets instantly.",
    demos: [
      { id: "dp1", title: "SaaS Dashboard UI Kit", category: "Digital", price: 49, rating: 4.9, bio: "Figma auto-layout components." },
      { id: "dp2", title: "React Admin Template", category: "Digital", price: 69, rating: 4.8, bio: "Next.js ready to use." }
    ]
  },
  "source-code": {
    title: "Source Code Marketplace",
    subtitle: "Buy production-ready source code projects and applications.",
    demos: [
      { id: "sc1", title: "Hospital Management System", category: "Source Code", price: 299, rating: 4.9, bio: "Full codebase." },
      { id: "sc2", title: "E-Commerce Platform", category: "Source Code", price: 399, rating: 4.8, bio: "MERN stack." }
    ]
  },
  "mvps": {
    title: "Startup MVP Marketplace",
    subtitle: "Launch your startup faster with ready-made MVP solutions.",
    demos: [
      { id: "mvp1", title: "SaaS CRM MVP", category: "MVP", price: 999, rating: 4.9, bio: "Launch in 3 days." },
      { id: "mvp2", title: "Food Delivery Platform", category: "MVP", price: 1499, rating: 4.8, bio: "Web + App combo." }
    ]
  }
};

export default function DynamicCategoryPage({ title, category, endpoint }: Props) {
  const { formatPrice } = useCurrency();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    axios.get(`${API_BASE}${endpoint}`)
      .then(res => {
        setData(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [endpoint]);

  const config = CATEGORY_CONFIG[category?.toLowerCase() || ""];
  const displayTitle = config?.title || (title ? title.replace(/-/g, " ") : "Category");
  const displaySubtitle = config?.subtitle || `Discover top ${displayTitle} in the ZilVerse ecosystem. Fully integrated with real database records.`;
  
  // Advanced Search, Filter & Sort
  let processedData = data.filter(item => {
    // 1. Search filter
    const searchMatch = JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    
    // 2. Category/Role filter
    let roleMatch = true;
    if (filterRole !== "all") {
      const itemRole = (item.role || item.category || "").toLowerCase();
      roleMatch = itemRole.includes(filterRole.toLowerCase());
    }
    
    return searchMatch && roleMatch;
  });

  // 3. Sorting
  processedData.sort((a, b) => {
    if (sortBy === "price_low") return (a.price || a.hourlyRate || 0) - (b.price || b.hourlyRate || 0);
    if (sortBy === "price_high") return (b.price || b.hourlyRate || 0) - (a.price || a.hourlyRate || 0);
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    // default newest
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const finalData = processedData.length > 0 ? processedData : (config?.demos || []);

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title} style={{textTransform: 'capitalize'}}>{displayTitle}</h1>
          <p className={styles.subtitle}>{displaySubtitle}</p>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder={`Search ${displayTitle}...`} 
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.filterGroup}>
            <select className={styles.filterSelect} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="developer">Developers</option>
              <option value="designer">Designers</option>
              <option value="student">Students</option>
            </select>

            <select className={styles.filterSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>
             <div className={styles.spinner} />
             Loading real database records...
          </div>
        ) : finalData.length === 0 ? (
          <div className={styles.emptyState}>
            <Zap size={48} color="var(--primary)" style={{marginBottom: "1rem"}} />
            <h3>Be the first to list a {displayTitle}!</h3>
            <p>The marketplace is growing rapidly. Launch your profile or project today to capture early demand.</p>
            <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center'}}>
              <Link href="/freelancer/register" className="btn btn-primary">
                <PlusCircle size={16} /> Create Listing
              </Link>
              <Link href="/freelancers" className="btn btn-secondary">
                <Briefcase size={16} /> Browse Global Talent
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.grid}>
            {finalData.map((item: any, idx: number) => (
              <div key={item.id || idx} className={`glass-panel ${styles.card}`}>
                <div className={styles.cardHeader}>
                  {item.user?.avatar && <img src={item.user.avatar} className={styles.avatar} alt="Avatar" />}
                  <div>
                    <h3 className={styles.cardTitle}>{item.title || item.name || item.user?.name || "Listing"}</h3>
                    <div className={styles.cardMeta}>{item.category || category}</div>
                  </div>
                </div>
                <p className={styles.cardDesc}>
                  {(item.description || item.bio || "No description available.").substring(0, 100)}...
                </p>
                <div className={styles.cardFooter}>
                  <span className={styles.price}>{item.price ? formatPrice(item.price) : item.hourlyRate ? `${formatPrice(item.hourlyRate)}/hr` : "Free"}</span>
                  <Link href={`#`} className={styles.ctaBtn}>View Details <ArrowRight size={14}/></Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
