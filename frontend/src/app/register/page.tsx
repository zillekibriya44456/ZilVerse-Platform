"use client";
import { API_BASE } from "@/utils/api";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { GraduationCap, Building2, Briefcase, UserCircle, CheckCircle2, Volume2, VolumeX, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// -- CULTURES & DATA --
const COUNTRIES = [
  { code: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
  { code: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
  { code: "PK", name: "Pakistan", dial: "+92", flag: "🇵🇰" },
  { code: "AE", name: "United Arab Emirates", dial: "+971", flag: "🇦🇪" },
  { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Other"
];

const PROFESSIONS = [
  "Student", "Teacher", "Professor", "Researcher", "Founder", "Freelancer", "Developer", "Designer", "Business Owner", "Other"
];

const STATE_GREETINGS: Record<string, string> = {
  "Karnataka": "ನಮಸ್ಕಾರ",
  "Maharashtra": "नमस्कार",
  "Tamil Nadu": "வணக்கம்",
  "West Bengal": "নমস্কার",
  "Gujarat": "નમસ્તે",
  "Kerala": "നമസ്കാരം",
  "Punjab": "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ",
  "Telangana": "నమస్కారం",
  "Andhra Pradesh": "నమస్కారం",
  "Delhi": "नमस्ते",
  "DEFAULT": "नमस्ते"
};

const CULTURES: Record<string, any> = {
  US: { greetings: { morning: "Good Morning", afternoon: "Good Afternoon", evening: "Good Evening" }, elements: ["🗽", "🦅", "🍔", "🏈", "✨"], bg: "linear-gradient(135deg, #1e3a8a, #7f1d1d)" },
  IN: { greetings: { morning: "शुभ प्रभात", afternoon: "शुभ दोपहर", evening: "शुभ संध्या" }, elements: ["🪷", "🛕", "🥻", "🪔", "✨"], bg: "linear-gradient(135deg, #9a3412, #14532d)" },
  GB: { greetings: { morning: "Good Morning", afternoon: "Good Afternoon", evening: "Good Evening" }, elements: ["👑", "☕", "🏰", "🚌", "✨"], bg: "linear-gradient(135deg, #1e3a8a, #7f1d1d)" },
  DEFAULT: { greetings: { morning: "Good Morning", afternoon: "Good Afternoon", evening: "Good Evening" }, elements: ["🌍", "🚀", "🎉", "🌟", "✨"], bg: "linear-gradient(135deg, #4c1d95, #0f172a)" }
};

const ROLES = [
  { id: "STUDENT",    label: "Student",        icon: GraduationCap, desc: "Learn & grow"            },
  { id: "FREELANCER", label: "Freelancer",      icon: Briefcase,     desc: "Offer services"          },
  { id: "DEVELOPER",  label: "Developer",       icon: Sparkles,      desc: "Build products"          },
  { id: "DESIGNER",   label: "Designer",        icon: Sparkles,      desc: "Create visuals"          },
  { id: "STARTUP",    label: "Startup Founder", icon: Building2,     desc: "Build companies"         },
  { id: "RESEARCHER", label: "Researcher",      icon: GraduationCap, desc: "Publish & collaborate"   },
  { id: "MENTOR",     label: "Mentor",          icon: UserCircle,    desc: "Guide others"            },
  { id: "EMPLOYER",   label: "Employer",        icon: Building2,     desc: "Hire talent"             },
  { id: "CREATOR",    label: "Creator",         icon: Sparkles,      desc: "Share content & reels"   },
];

// -- CUSTOM ANIMATED CURSOR --
const CustomCursor = () => {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      const target = e.target as HTMLElement;
      const isInteractable = target.tagName.toLowerCase() === 'button' || 
                             target.tagName.toLowerCase() === 'a' || 
                             target.tagName.toLowerCase() === 'input' || 
                             target.tagName.toLowerCase() === 'select' || 
                             target.closest('button') || target.closest('a');
                             
      setIsHovering(!!isInteractable);
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <motion.div
        animate={{
          x: mousePos.x - 4,
          y: mousePos.y - 4,
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
        style={{
          position: "fixed", top: 0, left: 0, width: "8px", height: "8px",
          backgroundColor: "#a78bfa", borderRadius: "50%", pointerEvents: "none", zIndex: 999999,
          boxShadow: "0 0 10px #a78bfa, 0 0 20px #a78bfa"
        }}
      />
      <motion.div
        animate={{
          x: mousePos.x - 20,
          y: mousePos.y - 20,
          scale: isHovering ? 1.3 : 1,
          opacity: isHovering ? 0.8 : 0.4
        }}
        transition={{ type: "tween", ease: "circOut", duration: 0.3 }}
        style={{
          position: "fixed", top: 0, left: 0, width: "40px", height: "40px",
          border: "2px solid rgba(167, 139, 250, 0.8)", borderRadius: "50%",
          pointerEvents: "none", zIndex: 999998,
        }}
      />
    </>
  );
};

// -- WELCOME EXPERIENCE COMPONENT --
const WelcomeExperience = ({ name, countryCode, stateName, onContinue }: { name: string, countryCode: string, stateName: string, onContinue: () => void }) => {
  const [isMuted, setIsMuted] = useState(false);
  const bgmRef = useRef<HTMLAudioElement>(null);
  const sfxRef = useRef<HTMLAudioElement>(null);

  const culture = CULTURES[countryCode] || CULTURES.DEFAULT;
  const hour = new Date().getHours();
  let timeOfDay = "evening";
  if (hour >= 5 && hour < 12) timeOfDay = "morning";
  else if (hour >= 12 && hour < 17) timeOfDay = "afternoon";

  let localGreeting = culture.greetings[timeOfDay];
  const englishGreeting = CULTURES.DEFAULT.greetings[timeOfDay];

  // Override greeting if Indian state matches
  if (countryCode === "IN" && stateName) {
    localGreeting = STATE_GREETINGS[stateName] || STATE_GREETINGS.DEFAULT;
  }

  useEffect(() => {
    if (sfxRef.current) {
      sfxRef.current.volume = 0.6;
      sfxRef.current.play().catch(() => {});
    }
    if (bgmRef.current) {
      bgmRef.current.volume = 0.3;
      bgmRef.current.play().catch(() => {});
    }
  }, []);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (bgmRef.current) bgmRef.current.muted = !isMuted;
    if (sfxRef.current) sfxRef.current.muted = !isMuted;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 99999, background: culture.bg,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        overflow: "hidden", color: "#fff", fontFamily: "system-ui, sans-serif"
      }}
    >
      <audio ref={bgmRef} loop src="https://assets.mixkit.co/active_storage/sfx/133/133-preview.mp3" />
      <audio ref={sfxRef} src="https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3" />

      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: "100vh", x: (Math.random() - 0.5) * window.innerWidth, opacity: 0, rotate: 0 }}
          animate={{ y: "-20vh", x: (Math.random() - 0.5) * window.innerWidth, opacity: [0, 1, 1, 0], rotate: 360 }}
          transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 5, ease: "linear" }}
          style={{ position: "absolute", fontSize: `${Math.max(1.5, Math.random() * 3)}rem`, filter: "drop-shadow(0 0 10px rgba(255,255,255,0.3))" }}
        >
          {culture.elements[Math.floor(Math.random() * culture.elements.length)]}
        </motion.div>
      ))}

      <button
        onClick={toggleMute}
        style={{
          position: "absolute", top: "2rem", right: "2rem", background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", padding: "0.8rem",
          cursor: "pointer", color: "#fff", backdropFilter: "blur(10px)", zIndex: 10
        }}
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>

      <motion.div
        initial={{ scale: 0, rotate: -45, y: 100 }}
        animate={{ scale: 1, rotate: 0, y: [0, -20, 0] }}
        transition={{ scale: { type: "spring", damping: 12, stiffness: 100 }, y: { repeat: Infinity, duration: 4, ease: "easeInOut" } }}
        style={{ fontSize: "10rem", marginBottom: "1rem", filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.5))" }}
      >
        🧑‍🚀
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
        style={{ fontSize: "4.5rem", fontWeight: 900, textAlign: "center", marginBottom: "0.5rem", textShadow: "0 10px 30px rgba(0,0,0,0.5)", lineHeight: 1.1 }}
      >
        {localGreeting}
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.8 }}
        style={{ fontSize: "1.8rem", fontWeight: 400, color: "rgba(255,255,255,0.8)", marginBottom: "1rem" }}
      >
        {englishGreeting}
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5, duration: 0.8 }}
        style={{ fontSize: "2.5rem", fontWeight: 600, color: "#e0e7ff", marginTop: "1rem", textAlign: "center", padding: "0 1rem" }}
      >
        Welcome to ZilVerse, <span style={{ color: "#a78bfa" }}>{name.split(" ")[0]}</span>!
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 0.8 }}
        style={{ fontSize: "1.2rem", color: "rgba(255,255,255,0.7)", marginTop: "1.5rem", maxWidth: "600px", textAlign: "center", lineHeight: 1.6 }}
      >
        Your premium world-class journey starts here. Discover talent, build the future, and connect globally.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3 }}
        whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(167, 139, 250, 0.8)" }} whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        style={{
          marginTop: "3rem", padding: "1.2rem 3rem", fontSize: "1.2rem", fontWeight: 700,
          background: "linear-gradient(135deg, #7c3aed, #ec4899)", border: "none", borderRadius: "99px",
          color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.8rem",
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
        }}
      >
        Continue to Dashboard <ArrowRight size={24} />
      </motion.button>
    </motion.div>
  );
};

// -- FOCUS INPUT WRAPPER --
const AnimatedInput = ({ children, isFocused }: { children: React.ReactNode, isFocused: boolean }) => (
  <motion.div
    animate={{ boxShadow: isFocused ? "0 0 0 2px rgba(167,139,250,0.5), 0 0 20px rgba(167,139,250,0.2)" : "0 0 0 0px rgba(167,139,250,0)" }}
    style={{ borderRadius: "10px", transition: "all 0.2s" }}
  >
    {children}
  </motion.div>
);

// -- MAIN REGISTRATION PAGE --
export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "", email: "", phoneDial: "+91", phoneNum: "", countryCode: "IN",
    stateName: "Delhi", profession: "Student", password: "", confirmPassword: "", role: "STUDENT", agreeTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isClicking, setIsClicking] = useState(false);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      window.location.href = "/dashboard";
    }
  }, [user]);

  const clickSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    clickSoundRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3");
    clickSoundRef.current.volume = 0.4;
    
    // Disable default body cursor
    document.body.style.cursor = "none";
    
    axios.get("https://ipapi.co/json/")
      .then(res => {
        if (res.data?.country_code) {
          const code = res.data.country_code;
          const found = COUNTRIES.find(c => c.code === code);
          const region = res.data.region || "Delhi";
          setFormData(prev => ({ 
            ...prev, countryCode: code, phoneDial: found ? found.dial : prev.phoneDial,
            stateName: code === "IN" ? region : "Other"
          }));
        }
      })
      .catch(() => {});
      
    return () => {
      document.body.style.cursor = "auto";
    };
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const playClickSound = () => {
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play().catch(()=>{});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 500);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (!formData.agreeTerms) {
      return setError("You must agree to the Terms & Conditions and Privacy Policy.");
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/register`, {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        profession: formData.profession,
        countryCode: formData.countryCode,
        stateName: formData.stateName,
        phoneDial: formData.phoneDial,
        phoneNum: formData.phoneNum,
      });

      setShowWelcome(true);
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const inputStyles = {
    width: "100%", padding: "0.85rem 1rem", background: "rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff",
    fontSize: "0.95rem", outline: "none", transition: "all 0.2s", 
    caretColor: "#a78bfa", cursor: "none"
  };
  const labelStyles = { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#a1a1aa", marginBottom: "0.4rem", cursor: "none" };

  return (
    <>
      <CustomCursor />
      <AnimatePresence>
        {showWelcome && (
          <WelcomeExperience name={formData.name} countryCode={formData.countryCode} stateName={formData.stateName} onContinue={() => window.location.href = "/login?registered=true"} />
        )}
      </AnimatePresence>

      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        padding: "3rem 1rem", background: "url('/images/bg-glow.jpg') center/cover, #09090b",
        fontFamily: "system-ui, sans-serif", cursor: "none"
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{
            width: "100%", maxWidth: "860px", background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)",
            border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "24px",
            boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255,255,255,0.1)",
            padding: "3rem", position: "relative", overflow: "hidden"
          }}
        >
          <div style={{ position: "absolute", top: "-150px", right: "-150px", width: "400px", height: "400px", background: "rgba(124, 58, 237, 0.15)", filter: "blur(100px)", borderRadius: "50%", zIndex: 0, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-150px", left: "-150px", width: "400px", height: "400px", background: "rgba(14, 165, 233, 0.15)", filter: "blur(100px)", borderRadius: "50%", zIndex: 0, pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <Link href="/" style={{ fontSize: "1.5rem", fontWeight: 800, textDecoration: "none", color: "#fff", cursor: "none" }}>
                Zil<span style={{ color: "#a78bfa" }}>Verse</span>
              </Link>
              <h1 style={{ fontSize: "2.2rem", fontWeight: 700, margin: "1rem 0 0.5rem", color: "#fff" }}>Create your Account</h1>
              <p style={{ color: "#a1a1aa", fontSize: "1rem" }}>Join the world's most premium platform.</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", padding: "1rem", borderRadius: "12px", marginBottom: "2rem", textAlign: "center", fontSize: "0.9rem" }}>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div>
                  <label style={labelStyles}>Full Name</label>
                  <AnimatedInput isFocused={focusedField === "name"}>
                    <input type="text" placeholder="John Doe" value={formData.name} onChange={e => handleChange("name", e.target.value)} onFocus={() => setFocusedField("name")} onBlur={() => setFocusedField(null)} required style={inputStyles} />
                  </AnimatedInput>
                </div>
                <div>
                  <label style={labelStyles}>Email Address</label>
                  <AnimatedInput isFocused={focusedField === "email"}>
                    <input type="email" placeholder="you@example.com" value={formData.email} onChange={e => handleChange("email", e.target.value)} onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} required style={inputStyles} />
                  </AnimatedInput>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div>
                  <label style={labelStyles}>Phone Number</label>
                  <AnimatedInput isFocused={focusedField === "phone"}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <select value={formData.phoneDial} onChange={e => handleChange("phoneDial", e.target.value)} style={{ ...inputStyles, width: "110px", padding: "0.85rem 0.5rem" }}>
                        {COUNTRIES.map(c => <option key={c.code} value={c.dial} style={{ background: "#09090b" }}>{c.flag} {c.dial}</option>)}
                      </select>
                      <input type="tel" placeholder="234 567 8900" value={formData.phoneNum} onChange={e => handleChange("phoneNum", e.target.value)} onFocus={() => setFocusedField("phone")} onBlur={() => setFocusedField(null)} required style={inputStyles} />
                    </div>
                  </AnimatedInput>
                </div>
                <div>
                  <label style={labelStyles}>Country</label>
                  <AnimatedInput isFocused={focusedField === "country"}>
                    <select value={formData.countryCode} onChange={e => { handleChange("countryCode", e.target.value); const found = COUNTRIES.find(c => c.code === e.target.value); if (found) handleChange("phoneDial", found.dial); }} onFocus={() => setFocusedField("country")} onBlur={() => setFocusedField(null)} style={{ ...inputStyles }}>
                      {COUNTRIES.map(c => <option key={c.code} value={c.code} style={{ background: "#09090b" }}>{c.flag} {c.name}</option>)}
                      <option value="OTHER" style={{ background: "#09090b" }}>🌍 Other</option>
                    </select>
                  </AnimatedInput>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div>
                  <label style={labelStyles}>State / Region</label>
                  <AnimatedInput isFocused={focusedField === "state"}>
                    {formData.countryCode === "IN" ? (
                      <select value={formData.stateName} onChange={e => handleChange("stateName", e.target.value)} onFocus={() => setFocusedField("state")} onBlur={() => setFocusedField(null)} style={{ ...inputStyles }}>
                        {INDIAN_STATES.map(s => <option key={s} value={s} style={{ background: "#09090b" }}>{s}</option>)}
                      </select>
                    ) : (
                      <input type="text" placeholder="Your State" value={formData.stateName} onChange={e => handleChange("stateName", e.target.value)} onFocus={() => setFocusedField("state")} onBlur={() => setFocusedField(null)} style={inputStyles} />
                    )}
                  </AnimatedInput>
                </div>
                <div>
                  <label style={labelStyles}>Profession</label>
                  <AnimatedInput isFocused={focusedField === "profession"}>
                    <select value={formData.profession} onChange={e => handleChange("profession", e.target.value)} onFocus={() => setFocusedField("profession")} onBlur={() => setFocusedField(null)} style={{ ...inputStyles }}>
                      {PROFESSIONS.map(p => <option key={p} value={p} style={{ background: "#09090b" }}>{p}</option>)}
                    </select>
                  </AnimatedInput>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div>
                  <label style={labelStyles}>Password</label>
                  <AnimatedInput isFocused={focusedField === "pass"}>
                    <div style={{ position: "relative" }}>
                      <input type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={formData.password} onChange={e => handleChange("password", e.target.value)} onFocus={() => setFocusedField("pass")} onBlur={() => setFocusedField(null)} required minLength={6} style={{ ...inputStyles, paddingRight: "2.5rem" }} />
                      <button type="button" onClick={() => { playClickSound(); setShowPassword(!showPassword); }} style={{ position: "absolute", right: "0.8rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#a1a1aa", cursor: "none" }}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </AnimatedInput>
                </div>
                <div>
                  <label style={labelStyles}>Confirm Password</label>
                  <AnimatedInput isFocused={focusedField === "cpass"}>
                    <div style={{ position: "relative" }}>
                      <input type={showConfirmPassword ? "text" : "password"} placeholder="Repeat password" value={formData.confirmPassword} onChange={e => handleChange("confirmPassword", e.target.value)} onFocus={() => setFocusedField("cpass")} onBlur={() => setFocusedField(null)} required minLength={6} style={{ ...inputStyles, paddingRight: "2.5rem" }} />
                      <button type="button" onClick={() => { playClickSound(); setShowConfirmPassword(!showConfirmPassword); }} style={{ position: "absolute", right: "0.8rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#a1a1aa", cursor: "none" }}>
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </AnimatedInput>
                </div>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <label style={{ ...labelStyles, marginBottom: "0.8rem" }}>I am joining as a...</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem" }}>
                  {ROLES.map((r) => {
                    const Icon = r.icon;
                    const isActive = formData.role === r.id;
                    return (
                      <motion.div
                        key={r.id} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                        onClick={() => { playClickSound(); handleChange("role", r.id); }}
                        style={{
                          padding: "1.2rem 1rem", borderRadius: "16px",
                          border: `2px solid ${isActive ? "#a78bfa" : "rgba(255,255,255,0.05)"}`,
                          background: isActive ? "rgba(167, 139, 250, 0.15)" : "rgba(0,0,0,0.3)",
                          cursor: "none", display: "flex", flexDirection: "column", gap: "0.8rem",
                          position: "relative", transition: "all 0.2s ease", textAlign: "center", alignItems: "center",
                          boxShadow: isActive ? "0 0 20px rgba(167,139,250,0.2)" : "none"
                        }}
                      >
                        {isActive && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: "absolute", top: "0.5rem", right: "0.5rem", color: "#a78bfa" }}>
                            <CheckCircle2 size={18} />
                          </motion.div>
                        )}
                        <div style={{ color: isActive ? "#a78bfa" : "#a1a1aa", padding: "0.5rem", background: isActive ? "rgba(167, 139, 250, 0.2)" : "rgba(255,255,255,0.05)", borderRadius: "12px" }}>
                          <Icon size={28} strokeWidth={isActive ? 2 : 1.5} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: isActive ? "#fff" : "#d4d4d8", fontSize: "0.95rem" }}>{r.label}</div>
                          <div style={{ fontSize: "0.75rem", color: "#71717a", marginTop: "4px" }}>{r.desc}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginTop: "1rem" }}>
                <input type="checkbox" id="terms" checked={formData.agreeTerms} onChange={e => { playClickSound(); handleChange("agreeTerms", e.target.checked); }} style={{ width: "18px", height: "18px", cursor: "none", accentColor: "#a78bfa" }} />
                <label htmlFor="terms" style={{ color: "#a1a1aa", fontSize: "0.9rem", cursor: "none" }}>
                  I agree to the <Link href="/terms" style={{ color: "#a78bfa", textDecoration: "none", cursor: "none" }}>Terms & Conditions</Link> and <Link href="/privacy" style={{ color: "#a78bfa", textDecoration: "none", cursor: "none" }}>Privacy Policy</Link>.
                </label>
              </div>

              <div style={{ position: "relative", marginTop: "1.5rem" }}>
                <AnimatePresence>
                  {isClicking && (
                    <motion.div
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 2, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      style={{ position: "absolute", inset: 0, background: "#a78bfa", borderRadius: "12px", zIndex: 0 }}
                    />
                  )}
                </AnimatePresence>
                
                <motion.button
                  type="submit" disabled={loading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                  style={{
                    width: "100%", padding: "1.1rem", fontSize: "1.1rem", fontWeight: 700, position: "relative", zIndex: 1,
                    background: loading ? "rgba(167, 139, 250, 0.5)" : "linear-gradient(135deg, #7c3aed, #ec4899)",
                    color: "#fff", border: "none", borderRadius: "12px", cursor: "none",
                    boxShadow: "0 10px 30px -5px rgba(124, 58, 237, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
                  }}
                >
                  {loading ? "Processing..." : <><Sparkles size={20} /> Create Account</>}
                </motion.button>
              </div>
            </form>

            <p style={{ textAlign: "center", marginTop: "2.5rem", color: "#a1a1aa", fontSize: "0.95rem" }}>
              Already have an account? <Link href="/login" onClick={playClickSound} style={{ color: "#a78bfa", fontWeight: 600, textDecoration: "none", cursor: "none" }}>Sign in →</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
