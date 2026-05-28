"use client";
import { API_BASE } from "@/utils/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import styles from "./freelancer.module.css";

const SKILL_OPTIONS = [
  "React","Next.js","Vue.js","Angular","Node.js","Express","Python","Django","FastAPI",
  "Flutter","React Native","Android","iOS","Java","Spring Boot","PHP","Laravel",
  "MySQL","PostgreSQL","MongoDB","Firebase","AWS","Docker","Git",
  "UI/UX Design","Figma","WordPress","SEO","Content Writing",
  "Data Science","Machine Learning","C/C++","TypeScript",
];

const STEPS = ["Account","Profile","Skills & Rates","Portfolio","Review"];

export default function FreelancerRegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState("1");
  const [hourlyRate, setHourlyRate] = useState("500");
  const [availability, setAvailability] = useState("Full-Time");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [resume, setResume] = useState<File | null>(null);

  const toggleSkill = (s: string) =>
    setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setProfilePhoto(file); setPhotoPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      await axios.post(`${API_BASE}/api/auth/register`, { name, email, password, role: "FREELANCER" });
      const loginRes = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      login(loginRes.data.user, loginRes.data.token);
      const fd = new FormData();
      fd.append("phone", phone); fd.append("city", city); fd.append("bio", bio);
      fd.append("skills", JSON.stringify(skills)); fd.append("experience", experience);
      fd.append("hourlyRate", hourlyRate); fd.append("availability", availability);
      fd.append("github", github); fd.append("linkedin", linkedin); fd.append("portfolio", portfolio);
      if (profilePhoto) fd.append("profilePhoto", profilePhoto);
      if (resume) fd.append("resume", resume);
      await axios.post(`${API_BASE}/api/profiles/freelancer`, fd, {
        headers: { "Authorization": `Bearer ${loginRes.data.token}`, "Content-Type": "multipart/form-data" },
      }).catch(() => {});
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally { setLoading(false); }
  };

  const canNext = () => {
    if (step === 0) return name && email && password.length >= 6;
    if (step === 1) return city && bio.length >= 30;
    if (step === 2) return skills.length >= 1;
    return true;
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.progressBar}>
          {STEPS.map((s, i) => (
            <div key={s} className={`${styles.step} ${i <= step ? styles.stepActive : ""}`}>
              <div className={styles.stepDot}>{i < step ? "✓" : i + 1}</div>
              <span className={styles.stepLabel}>{s}</span>
            </div>
          ))}
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1>🚀 Freelancer Registration</h1>
            <p>Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
          </div>
          {error && <div className={styles.error}>{error}</div>}

          {step === 0 && (
            <div className={styles.fields}>
              <div className={styles.field}><label>Full Name *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" /></div>
              <div className={styles.field}><label>Email Address *</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div>
              <div className={styles.field}><label>Password * (min 6 chars)</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a strong password" /></div>
              <div className={styles.infoBox}>Already have an account? <Link href="/login">Sign in →</Link></div>
            </div>
          )}

          {step === 1 && (
            <div className={styles.fields}>
              <div className={styles.photoUpload}>
                <div className={styles.photoPreview} style={{ backgroundImage: photoPreview ? `url(${photoPreview})` : undefined }}>
                  {!photoPreview && <span>👤</span>}
                </div>
                <div>
                  <label className="btn btn-secondary" style={{ cursor: "pointer", fontSize: "0.875rem" }}>
                    📷 Upload Profile Photo
                    <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
                  </label>
                  <p className={styles.hint}>JPG, PNG – Max 5MB</p>
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}><label>Phone / WhatsApp *</label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXXXXXXX" /></div>
                <div className={styles.field}><label>City / Location *</label><input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Bengaluru" /></div>
              </div>
              <div className={styles.field}>
                <label>Professional Bio * (min 30 chars)</label>
                <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)} placeholder="Describe your expertise and what makes you unique..." />
                <span className={styles.charCount}>{bio.length} chars</span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>Skills * (select all that apply)</label>
                <div className={styles.skillGrid}>
                  {SKILL_OPTIONS.map(s => (
                    <button key={s} type="button" onClick={() => toggleSkill(s)}
                      className={`${styles.skillTag} ${skills.includes(s) ? styles.skillSelected : ""}`}>{s}</button>
                  ))}
                </div>
                <p className={styles.hint}>{skills.length} selected</p>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Experience</label>
                  <select value={experience} onChange={e => setExperience(e.target.value)}>
                    <option value="0">Fresher</option><option value="1">1 year</option>
                    <option value="2">2 years</option><option value="3">3 years</option>
                    <option value="5">5+ years</option><option value="10">10+ years</option>
                  </select>
                </div>
                <div className={styles.field}><label>Hourly Rate (₹/hr)</label><input type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} min="100" /></div>
              </div>
              <div className={styles.field}>
                <label>Availability</label>
                <div className={styles.radioGroup}>
                  {["Full-Time","Part-Time","Weekends Only","Project-Based"].map(a => (
                    <label key={a} className={`${styles.radioBtn} ${availability === a ? styles.radioBtnActive : ""}`}>
                      <input type="radio" name="avail" value={a} checked={availability === a} onChange={() => setAvailability(a)} />{a}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.fields}>
              <div className={styles.field}><label>GitHub Profile</label><input value={github} onChange={e => setGithub(e.target.value)} placeholder="https://github.com/username" /></div>
              <div className={styles.field}><label>LinkedIn Profile</label><input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/profile" /></div>
              <div className={styles.field}><label>Portfolio Website</label><input value={portfolio} onChange={e => setPortfolio(e.target.value)} placeholder="https://yourportfolio.com" /></div>
              <div className={styles.field}>
                <label>Upload Resume / CV * (PDF, DOC)</label>
                <div className={styles.fileUpload}>
                  <label className={styles.fileLabel}>
                    📄 {resume ? resume.name : "Choose Resume File"}
                    <input type="file" accept=".pdf,.doc,.docx" onChange={e => setResume(e.target.files?.[0] || null)} style={{ display: "none" }} />
                  </label>
                </div>
                {resume && <span className={styles.hint}>✅ {resume.name} ({(resume.size/1024).toFixed(0)} KB)</span>}
                <p className={styles.hint}>PDF or Word. Max 10MB.</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className={styles.fields}>
              <div className={styles.reviewGrid}>
                <div className={styles.reviewItem}><span>👤 Name</span><strong>{name}</strong></div>
                <div className={styles.reviewItem}><span>📧 Email</span><strong>{email}</strong></div>
                <div className={styles.reviewItem}><span>📍 City</span><strong>{city||"—"}</strong></div>
                <div className={styles.reviewItem}><span>📞 Phone</span><strong>{phone||"—"}</strong></div>
                <div className={styles.reviewItem}><span>💼 Role</span><strong>Freelancer</strong></div>
                <div className={styles.reviewItem}><span>⏱ Rate</span><strong>₹{hourlyRate}/hr</strong></div>
                <div className={styles.reviewItem}><span>📅 Exp</span><strong>{experience} yr(s)</strong></div>
                <div className={styles.reviewItem}><span>🕐 Avail</span><strong>{availability}</strong></div>
                {resume && <div className={styles.reviewItem}><span>📄 Resume</span><strong>{resume.name}</strong></div>}
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Skills Selected</span>
                <div className={styles.skillGrid} style={{ marginTop: "0.5rem" }}>
                  {skills.map(s => <span key={s} className={`${styles.skillTag} ${styles.skillSelected}`}>{s}</span>)}
                </div>
              </div>
              <div className={styles.infoBox}>By submitting you agree to our Terms of Service and Privacy Policy.</div>
            </div>
          )}

          <div className={styles.navBtns}>
            {step > 0 && <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>← Back</button>}
            {step < STEPS.length - 1
              ? <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canNext()}>Continue →</button>
              : <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? "Submitting..." : "🚀 Submit & Join ZilVerse"}</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
