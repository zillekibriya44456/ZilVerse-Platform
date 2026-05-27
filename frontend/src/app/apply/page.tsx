"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "./apply.module.css";
import AIInterviewRoom from "@/components/AIInterviewRoom";
import InterviewResults from "@/components/InterviewResults";

const STEPS = ["Personal Info","Education","Experience","Resume & Links","Submit"];

export default function ApplyPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showInterviewPrompt, setShowInterviewPrompt] = useState(false);
  const [startInterview, setStartInterview] = useState(false);
  const [interviewScore, setInterviewScore] = useState<number | null>(null);
  const [interviewFeedback, setInterviewFeedback] = useState("");
  const [interviewerGender, setInterviewerGender] = useState<"female" | "male" | null>(null);
  const [applyType, setApplyType] = useState<"job" | "internship">("job");

  // Step 0
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [dob, setDob] = useState("");

  // Step 1
  const [degree, setDegree] = useState("B.Tech");
  const [branch, setBranch] = useState("");
  const [college, setCollege] = useState("");
  const [year, setYear] = useState("2025");
  const [cgpa, setCgpa] = useState("");

  // Step 2
  const [hasExp, setHasExp] = useState("no");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [duration, setDuration] = useState("");
  const [skills, setSkills] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  // Step 3
  const [resume, setResume] = useState<File | null>(null);
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");

  const canNext = () => {
    if (step === 0) return name && email && phone && city;
    if (step === 1) return degree && college && year;
    return true;
  };

  const handleSubmit = () => {
    setShowInterviewPrompt(true);
  };

  const skipInterview = () => {
    setShowInterviewPrompt(false);
    setSubmitted(true);
  };

  const handleInterviewComplete = (score: number, feedback: string) => {
    setStartInterview(false);
    setInterviewScore(score);
    setInterviewFeedback(feedback);
  };

  if (interviewScore !== null) {
    return (
      <InterviewResults 
        score={interviewScore} 
        feedback={interviewFeedback}
        name={name}
        role={role}
        onClose={() => {
          setInterviewScore(null);
          setSubmitted(true);
        }}
      />
    );
  }

  if (startInterview && interviewerGender) {
    return (
      <AIInterviewRoom 
        name={name}
        role={role || "Software Developer"}
        roleMode={applyType === "internship" ? "intern" : "frontend"}
        level={hasExp === "yes" ? "Junior" : "Entry Level"}
        skills={skills || "React, Javascript, CSS"}
        interviewerName={interviewerGender === "female" ? "Sarah" : "Alex"}
        interviewerGender={interviewerGender}
        interviewType="coding"
        onComplete={handleInterviewComplete}
        onClose={() => setStartInterview(false)}
      />
    );
  }

  if (startInterview && !interviewerGender) {
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <h1>Choose Your Interviewer</h1>
          <p>Select an HR representative to conduct your interview.</p>
          <div className={styles.interviewerSelection}>
            <div className={styles.interviewerCard} onClick={() => setInterviewerGender("female")}>
              <img src="/avatars/hr_female.png" alt="Sarah Jenkins" />
              <h3>Sarah Jenkins</h3>
              <p>Lead HR</p>
            </div>
            <div className={styles.interviewerCard} onClick={() => setInterviewerGender("male")}>
              <img src="/avatars/hr_male.png" alt="David Lee" />
              <h3>David Lee</h3>
              <p>Technical Recruiter</p>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ marginTop: "2rem" }} onClick={() => setStartInterview(false)}>
            Back
          </button>
        </div>
      </div>
    );
  }

  if (showInterviewPrompt) {
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.aiPromptIcon}>🤖</div>
          <h1>Fast-Track Your Application!</h1>
          <p>
            You can complete a short, 5-question AI video interview right now to boost your profile and skip the initial screening round.
          </p>
          <div className={styles.successActions}>
            <button className="btn btn-primary" onClick={() => setStartInterview(true)}>
              🎥 Start AI Interview
            </button>
            <button className="btn btn-secondary" onClick={skipInterview}>
              Skip for Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>🎉</div>
          <h1>Application Submitted!</h1>
          <p>Thank you <strong>{name}</strong>! Your {applyType} application has been received.</p>
          <p className={styles.muted}>We'll review your profile and get back to you within 3–5 business days via <strong>{email}</strong> or WhatsApp.</p>
          <div className={styles.successActions}>
            <a href={`https://wa.me/917091780179?text=Hi! I just applied for a ${applyType} on ZilVerse. My name is ${name}.`}
              target="_blank" rel="noreferrer" className="btn btn-primary">
              💬 Follow Up on WhatsApp
            </a>
            <Link href="/jobs" className="btn btn-secondary">Browse More Jobs</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Type selector */}
        <div className={styles.typeSelector}>
          <button className={`${styles.typeBtn} ${applyType === "job" ? styles.typeBtnActive : ""}`} onClick={() => setApplyType("job")}>
            💼 Apply for Job
          </button>
          <button className={`${styles.typeBtn} ${applyType === "internship" ? styles.typeBtnActive : ""}`} onClick={() => setApplyType("internship")}>
            🎓 Apply for Internship
          </button>
        </div>

        {/* Progress */}
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
            <h1>{applyType === "job" ? "💼 Job Application" : "🎓 Internship Application"}</h1>
            <p>Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
          </div>

          {/* Step 0 — Personal */}
          {step === 0 && (
            <div className={styles.fields}>
              <div className={styles.row}>
                <div className={styles.field}><label>Full Name *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="As per official ID" /></div>
                <div className={styles.field}><label>Date of Birth</label><input type="date" value={dob} onChange={e => setDob(e.target.value)} /></div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}><label>Email Address *</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div>
                <div className={styles.field}><label>WhatsApp Number *</label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXXXXXXX" /></div>
              </div>
              <div className={styles.field}><label>Current City *</label><input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Bengaluru, Karnataka" /></div>
              <div className={styles.field}>
                <label>Applying for {applyType === "job" ? "Position" : "Internship Role"}</label>
                <input value={role} onChange={e => setRole(e.target.value)} placeholder={applyType === "job" ? "e.g. Full Stack Developer" : "e.g. Frontend Intern"} />
              </div>
            </div>
          )}

          {/* Step 1 — Education */}
          {step === 1 && (
            <div className={styles.fields}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Degree *</label>
                  <select value={degree} onChange={e => setDegree(e.target.value)}>
                    <option>B.Tech / B.E.</option><option>B.Sc</option><option>BCA</option>
                    <option>MCA</option><option>M.Tech / M.E.</option><option>MBA</option>
                    <option>Diploma</option><option>12th (HSC)</option><option>Other</option>
                  </select>
                </div>
                <div className={styles.field}><label>Branch / Specialization</label><input value={branch} onChange={e => setBranch(e.target.value)} placeholder="e.g. Computer Science" /></div>
              </div>
              <div className={styles.field}><label>College / University *</label><input value={college} onChange={e => setCollege(e.target.value)} placeholder="Full name of your college" /></div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Graduation Year *</label>
                  <select value={year} onChange={e => setYear(e.target.value)}>
                    {["2024","2025","2026","2027","2028"].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div className={styles.field}><label>CGPA / Percentage</label><input value={cgpa} onChange={e => setCgpa(e.target.value)} placeholder="e.g. 8.5 / 85%" /></div>
              </div>
            </div>
          )}

          {/* Step 2 — Experience */}
          {step === 2 && (
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>Do you have prior work experience?</label>
                <div className={styles.radioGroup}>
                  {["yes","no"].map(v => (
                    <label key={v} className={`${styles.radioBtn} ${hasExp === v ? styles.radioBtnActive : ""}`}>
                      <input type="radio" name="hasExp" value={v} checked={hasExp === v} onChange={() => setHasExp(v)} />
                      {v === "yes" ? "Yes, I have experience" : "No, I am a fresher"}
                    </label>
                  ))}
                </div>
              </div>
              {hasExp === "yes" && (
                <>
                  <div className={styles.row}>
                    <div className={styles.field}><label>Company / Organization</label><input value={company} onChange={e => setCompany(e.target.value)} placeholder="Previous company" /></div>
                    <div className={styles.field}><label>Role / Title</label><input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Junior Developer" /></div>
                  </div>
                  <div className={styles.field}><label>Duration</label><input value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. Jan 2024 – Dec 2024" /></div>
                </>
              )}
              <div className={styles.field}>
                <label>Key Skills (comma separated)</label>
                <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. React, Node.js, Python, MySQL" />
              </div>
              <div className={styles.field}>
                <label>Cover Letter / Why should we hire you?</label>
                <textarea rows={5} value={coverLetter} onChange={e => setCoverLetter(e.target.value)} placeholder="Tell us about yourself, your passion, and why you're the right fit..." />
              </div>
            </div>
          )}

          {/* Step 3 — Resume */}
          {step === 3 && (
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>Upload Resume / CV * (PDF preferred)</label>
                <div className={styles.fileUpload}>
                  <label className={styles.fileLabel}>
                    📄 {resume ? resume.name : "Click to Choose Resume"}
                    <input type="file" accept=".pdf,.doc,.docx" onChange={e => setResume(e.target.files?.[0] || null)} style={{ display: "none" }} />
                  </label>
                </div>
                {resume && <p className={styles.hint}>✅ {resume.name} ({(resume.size/1024).toFixed(0)} KB)</p>}
                <p className={styles.hint}>PDF or Word document. Max 10MB. Make sure it includes your contact details.</p>
              </div>
              <div className={styles.field}><label>LinkedIn Profile</label><input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourprofile" /></div>
              <div className={styles.field}><label>GitHub Profile</label><input value={github} onChange={e => setGithub(e.target.value)} placeholder="https://github.com/yourusername" /></div>
              <div className={styles.field}><label>Portfolio / Website</label><input value={portfolio} onChange={e => setPortfolio(e.target.value)} placeholder="https://yourportfolio.com (optional)" /></div>
            </div>
          )}

          {/* Step 4 — Review */}
          {step === 4 && (
            <div className={styles.fields}>
              <div className={styles.reviewGrid}>
                <div className={styles.reviewItem}><span>👤 Name</span><strong>{name}</strong></div>
                <div className={styles.reviewItem}><span>📧 Email</span><strong>{email}</strong></div>
                <div className={styles.reviewItem}><span>📞 Phone</span><strong>{phone}</strong></div>
                <div className={styles.reviewItem}><span>📍 City</span><strong>{city}</strong></div>
                <div className={styles.reviewItem}><span>🎓 Degree</span><strong>{degree}</strong></div>
                <div className={styles.reviewItem}><span>🏫 College</span><strong>{college}</strong></div>
                <div className={styles.reviewItem}><span>📅 Year</span><strong>{year}</strong></div>
                <div className={styles.reviewItem}><span>📊 CGPA</span><strong>{cgpa||"—"}</strong></div>
                {resume && <div className={styles.reviewItem}><span>📄 Resume</span><strong>{resume.name}</strong></div>}
              </div>
              <div className={styles.infoBox}>
                ✅ By submitting this form you consent to ZilVerse processing your data for recruitment purposes.
                We will contact you via email or WhatsApp within 3–5 business days.
              </div>
            </div>
          )}

          <div className={styles.navBtns}>
            {step > 0 && <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>← Back</button>}
            {step < STEPS.length - 1
              ? <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canNext()}>Continue →</button>
              : <button className="btn btn-primary" onClick={handleSubmit}>🚀 Submit Application</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
