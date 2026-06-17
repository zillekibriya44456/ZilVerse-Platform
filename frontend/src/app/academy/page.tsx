"use client";
import { API_BASE } from "@/utils/api";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useCountry } from "@/context/CountryContext";
import { ACADEMY_COURSES, Course } from "@/data/academy";
import PaymentModal from "@/components/PaymentModal";
import styles from "./academy.module.css";
import countriesList from "@/constants/countries";

type Tab = "Learn" | "Teach" | "Earn";

export default function AcademyPage() {
  const { selectedCountry, setSelectedCountry } = useCountry();
  const [activeTab, setActiveTab] = useState<Tab>("Learn");
  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [buyingCourse, setBuyingCourse] = useState<any | null>(null);

  // Course Creation State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    instructor: "",
    price: "",
    category: "Development",
    language: "English",
    level: "Beginner",
    duration: "2 Hours",
    description: "",
    countryCode: "US"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [coursesLoading, setCoursesLoading] = useState(true);

  // Load backend courses — handles both flat array and paginated {data,...} response
  useEffect(() => {
    setCoursesLoading(true);
    axios.get(`${API_BASE}/api/academy`)
      .then(res => {
        const raw = res.data?.data ?? res.data;
        setDbCourses(Array.isArray(raw) ? raw : []);
      })
      .catch(err => console.error("Failed to load courses from DB", err))
      .finally(() => setCoursesLoading(false));
  }, []);

  // Sync state with selected country
  const handleCountrySwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    if (code === "ALL") {
      const found = countriesList.find((c) => c.code === "US");
      if (found) setSelectedCountry(found);
    } else {
      const found = countriesList.find((c) => c.code === code);
      if (found) {
        setSelectedCountry(found);
      }
    }
  };

  // Merge and Filter courses
  const displayedCourses = useMemo(() => {
    const formattedDbCourses = dbCourses.map(c => ({
      id: c.id,
      title: c.title,
      instructor: c.instructor,
      countryCode: c.countryCode || 'US',
      language: c.language || 'English',
      price: c.price || 0,
      students: c.students || 0,
      rating: c.rating || 5.0,
      image: c.image || '/avatars/avatar_1.png',
      category: (c.category || 'Development') as any
    }));

    const combined = [...formattedDbCourses, ...ACADEMY_COURSES];

    // If country code filter is active
    const local = combined.filter(c => c.countryCode === selectedCountry.code);
    return local.length > 0 ? local : combined;
  }, [dbCourses, selectedCountry]);

  const handleCreateCourse = async () => {
    if (!newCourse.title || !newCourse.instructor) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...newCourse,
        price: parseFloat(newCourse.price) || 0,
        students: 0,
        rating: 5.0,
        image: `/avatars/avatar_1.png`
      };
      await axios.post(`${API_BASE}/api/academy/create`, payload);
      setIsCreateModalOpen(false);
      setNewCourse({
        title: "", instructor: "", price: "",
        category: "Development", language: "English", level: "Beginner",
        duration: "2 Hours", description: "",
        countryCode: selectedCountry.code || "US"
      });
      // Reload courses
      const res = await axios.get(`${API_BASE}/api/academy`);
      const raw = res.data?.data ?? res.data;
      setDbCourses(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <h1>ZilVerse Academy</h1>
          <p>Your unified ecosystem to Learn, Teach, and Earn globally.</p>
          
          <div className={styles.tabContainer}>
            {(["Learn", "Teach", "Earn"] as Tab[]).map((tab) => (
              <button
                key={tab}
                className={`${styles.tabBtn} ${activeTab === tab ? styles.activeTab : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        {activeTab === "Learn" && (
          <div className={styles.learnSection}>
            <div className={styles.learnToolbar}>
              <div className={styles.toolbarInfo}>
                <span className={styles.flag}>{selectedCountry.flag}</span>
                <span>
                  Showing courses for <strong>{selectedCountry.name}</strong> in local languages.
                </span>
              </div>
              <select className={styles.countrySelect} onChange={handleCountrySwitch} value={selectedCountry.code}>
                <option value="ALL">🌐 Explore Global Courses</option>
                {countriesList.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.coursesGrid}>
              {coursesLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
                    <div className="skeleton" style={{ height: 160 }} />
                    <div style={{ padding: '1rem' }}>
                      <div className="skeleton skeleton-text" style={{ width: '80%', marginBottom: '0.5rem' }} />
                      <div className="skeleton skeleton-text" style={{ width: '50%' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                        <div className="skeleton" style={{ width: 60, height: 24, borderRadius: 6 }} />
                        <div className="skeleton" style={{ width: 100, height: 36, borderRadius: 10 }} />
                      </div>
                    </div>
                  </div>
                ))
              ) : displayedCourses.map((course) => (
                <div key={course.id} className={`glass-panel ${styles.courseCard}`}>
                  <div className={styles.courseImageWrapper}>
                    <div className={styles.courseCategory}>{course.category}</div>
                    <Image src={course.image} alt={course.instructor} fill className={styles.courseImage} />
                  </div>
                  <div className={styles.courseContent}>
                    <h3>{course.title}</h3>
                    <p className={styles.instructor}>By {course.instructor}</p>
                    <div className={styles.courseMeta}>
                      <span>🌐 {course.language}</span>
                      <span>⭐ {course.rating}</span>
                      <span>👥 {course.students.toLocaleString()} students</span>
                    </div>
                    <div className={styles.courseFooter}>
                      <span className={styles.price}>₹{course.price.toLocaleString()}</span>
                      <button className="btn btn-primary" onClick={() => setBuyingCourse(course)}>Enroll Now</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {displayedCourses.length === 0 && (
              <div className={styles.emptyState}>
                <p>No local courses found for {selectedCountry.name}. Be the first to teach!</p>
                <button className="btn btn-secondary" onClick={() => setActiveTab("Teach")}>Become an Instructor</button>
              </div>
            )}
          </div>
        )}

        {activeTab === "Teach" && (
          <div className={styles.teachSection}>
            <div className={styles.teachHero}>
              <h2>Share Your Knowledge With The World</h2>
              <p>Create verified courses, sell e-books, or offer 1-on-1 mentorship. Keep up to 90% of your earnings.</p>
              <div className={styles.teachStats}>
                <div className={styles.statBox}>
                  <h4>150+</h4>
                  <span>Countries Reached</span>
                </div>
                <div className={styles.statBox}>
                  <h4>$2M+</h4>
                  <span>Paid to Instructors</span>
                </div>
                <div className={styles.statBox}>
                  <h4>0</h4>
                  <span>Upfront Fees</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                <button className={`btn btn-primary ${styles.ctaLarge}`} onClick={() => setIsCreateModalOpen(true)}>Create Course Listing</button>
                <button className="btn btn-secondary">Apply as Partner</button>
              </div>
            </div>
            
            <div className={styles.teachSteps}>
              <div className={styles.step}>
                <div className={styles.stepNum}>1</div>
                <h3>Verify Profile</h3>
                <p>Pass our quick KYC & skill verification process.</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNum}>2</div>
                <h3>Upload Content</h3>
                <p>Use our built-in studio to upload courses and materials.</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNum}>3</div>
                <h3>Start Earning</h3>
                <p>Get paid directly via Crypto, PayPal, or Local Bank.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Earn" && (
          <div className={styles.earnSection}>
            <div className={styles.earnPipeline}>
              <h2>The ZilVerse Pipeline</h2>
              <p>Don't just learn. Apply your skills immediately through our integrated ecosystem.</p>
              
              <div className={styles.pipelineSteps}>
                <div className={styles.pipeStep}>
                  <div className={styles.pipeIcon}>🎓</div>
                  <h3>1. Get Certified</h3>
                  <p>Complete Academy courses and earn blockchain-verified certificates.</p>
                </div>
                <div className={styles.pipeArrow}>→</div>
                <div className={styles.pipeStep}>
                  <div className={styles.pipeIcon}>💼</div>
                  <h3>2. Apply for Internships</h3>
                  <p>Your certificates unlock exclusive job and internship opportunities.</p>
                  <Link href="/jobs" className={styles.pipeLink}>View Jobs</Link>
                </div>
                <div className={styles.pipeArrow}>→</div>
                <div className={styles.pipeStep}>
                  <div className={styles.pipeIcon}>🚀</div>
                  <h3>3. Start Freelancing</h3>
                  <p>Build your portfolio and offer your services to global clients.</p>
                  <Link href="/freelancers" className={styles.pipeLink}>View Marketplace</Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {buyingCourse && (
        <PaymentModal
          onClose={() => setBuyingCourse(null)}
          onSuccess={() => setBuyingCourse(null)}
          price={buyingCourse.price}
          projectTitle={buyingCourse.title}
        />
      )}

      {/* CREATE COURSE MODAL */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ background: '#09090b', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(139, 92, 246, 0.4)', width: '90%', maxWidth: '600px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ color: '#fff', marginBottom: '1.5rem', fontWeight: 800, background: 'linear-gradient(90deg, #c4b5fd, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Publish a Course Listing</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#a1a1aa', fontSize: '.8rem', marginBottom: '.3rem' }}>Course Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Next.js Architecture" 
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#a1a1aa', fontSize: '.8rem', marginBottom: '.3rem' }}>Instructor Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sarah Jenkins" 
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#a1a1aa', fontSize: '.8rem', marginBottom: '.3rem' }}>Price (INR equivalent)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 4999" 
                  value={newCourse.price}
                  onChange={(e) => setNewCourse({...newCourse, price: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#a1a1aa', fontSize: '.8rem', marginBottom: '.3rem' }}>Country (Code)</label>
                <select 
                  value={newCourse.countryCode}
                  onChange={(e) => setNewCourse({...newCourse, countryCode: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', outline: 'none' }}
                >
                  {countriesList.map(c => (
                    <option key={c.code} value={c.code} style={{ color: '#000' }}>{c.flag} {c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#a1a1aa', fontSize: '.8rem', marginBottom: '.3rem' }}>Category</label>
                <select 
                  value={newCourse.category}
                  onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', outline: 'none' }}
                >
                  <option value="Development" style={{ color: '#000' }}>Development</option>
                  <option value="Design" style={{ color: '#000' }}>Design</option>
                  <option value="Business" style={{ color: '#000' }}>Business</option>
                  <option value="AI" style={{ color: '#000' }}>AI</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: '#a1a1aa', fontSize: '.8rem', marginBottom: '.3rem' }}>Language</label>
                <input 
                  type="text" 
                  placeholder="e.g. English / Hindi" 
                  value={newCourse.language}
                  onChange={(e) => setNewCourse({...newCourse, language: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', color: '#a1a1aa', fontSize: '.8rem', marginBottom: '.3rem' }}>Level</label>
                <select 
                  value={newCourse.level}
                  onChange={(e) => setNewCourse({...newCourse, level: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', outline: 'none' }}
                >
                  <option value="Beginner" style={{ color: '#000' }}>Beginner</option>
                  <option value="Intermediate" style={{ color: '#000' }}>Intermediate</option>
                  <option value="Advanced" style={{ color: '#000' }}>Advanced</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: '#a1a1aa', fontSize: '.8rem', marginBottom: '.3rem' }}>Duration</label>
                <input 
                  type="text" 
                  placeholder="e.g. 5 Hours" 
                  value={newCourse.duration}
                  onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#a1a1aa', fontSize: '.8rem', marginBottom: '.3rem' }}>Course Description</label>
              <textarea 
                placeholder="Describe what students will learn in this course..." 
                value={newCourse.description}
                onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', outline: 'none', minHeight: '80px', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ flex: 1, padding: '0.8rem', background: 'rgba(255,255,255,0.06)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleCreateCourse} disabled={isSubmitting} style={{ flex: 1, padding: '0.8rem', background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
                {isSubmitting ? 'Publishing...' : 'Publish Course →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
