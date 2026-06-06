"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./AIAssistant.module.css";

interface Message {
  role: "user" | "ai";
  text: string;
}

const GREETINGS = [
  "👋 Hi! I'm ZilVerse AI. How can I help you today?",
  "I can help you find freelancers, explore projects, check job listings, or learn about our services.",
  "Just type your question below!",
];

const AUTO_RESPONSES: Record<string, string> = {
  "freelancer": "We have 2,400+ verified freelancers across 150+ countries! Visit the **Freelancers** page to browse developers, designers, and creators. Would you like me to guide you?",
  "project": "Our **Project Marketplace** has 800+ ready-made projects — SaaS boilerplates, academic projects, mobile apps, and more. Check them out in the Projects section!",
  "job": "Looking for work? We have 1,200+ active job postings across full-time, remote, and internship roles. Head over to **Jobs** to apply in one click!",
  "price": "Our services start from as low as ₹4,999 for a basic website. For custom quotes, visit the **Services** page or contact us on WhatsApp!",
  "service": "We offer Website Development, App Development, E-Commerce, SEO, and more. Visit the **Services** page for detailed packages and pricing!",
  "contact": "You can reach us on **WhatsApp**: +91 7091780179, or visit the **Contact** page. We're based in Bengaluru, India but serve clients globally!",
  "hello": "Hello! 👋 Welcome to ZilVerse. How can I assist you today? Ask me about freelancers, projects, jobs, or services!",
  "hi": "Hey there! 😊 I'm ZilVerse AI, your digital assistant. What would you like to know?",
};

function getAIResponse(msg: string): string {
  const lower = msg.toLowerCase();
  for (const [key, val] of Object.entries(AUTO_RESPONSES)) {
    if (lower.includes(key)) return val;
  }
  return "That's a great question! While I'm still learning, I recommend checking out our **Services**, **Freelancers**, or **Jobs** pages for more info. You can also reach us on WhatsApp for personalized help! 💬";
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !greeted) {
      setGreeted(true);
      setTyping(true);
      setTimeout(() => {
        setMessages(GREETINGS.map((t) => ({ role: "ai" as const, text: t })));
        setTyping(false);
      }, 800);
    }
  }, [open, greeted]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", text: getAIResponse(trimmed) }]);
      setTyping(false);
    }, 600 + Math.random() * 800);
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-label="AI Assistant"
        id="ai-assistant-btn"
      >
        <div className={styles.triggerCore}>
          <div className={styles.triggerPulse} />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={styles.triggerIcon}>
            <path d="M12 2a4 4 0 014 4v1a1 1 0 001 1h1a4 4 0 010 8h-1a1 1 0 00-1 1v1a4 4 0 01-8 0v-1a1 1 0 00-1-1H6a4 4 0 010-8h1a1 1 0 001-1V6a4 4 0 014-4z" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        </div>
        <span className={styles.triggerLabel}>AI</span>
      </button>

      {/* Chat window */}
      {open && (
        <div className={styles.window}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.aiDot} />
              <div>
                <div className={styles.headerTitle}>ZilVerse AI</div>
                <div className={styles.headerStatus}>Online · Ready to help</div>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className={styles.messages}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.msg} ${m.role === "user" ? styles.msgUser : styles.msgAI}`}>
                {m.role === "ai" && <div className={styles.msgAvatar}>🤖</div>}
                {m.role === "ai" ? (
                  <div className={styles.msgBubble} dangerouslySetInnerHTML={{
                    __html: m.text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  }} />
                ) : (
                  <div className={styles.msgBubble}>{m.text}</div>
                )}
              </div>
            ))}
            {typing && (
              <div className={`${styles.msg} ${styles.msgAI}`}>
                <div className={styles.msgAvatar}>🤖</div>
                <div className={styles.msgBubble}>
                  <span className={styles.typingDots}>
                    <span /><span /><span />
                  </span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className={styles.inputRow}>
            <input
              className={styles.input}
              placeholder="Ask ZilVerse AI anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button className={styles.sendBtn} onClick={send} disabled={!input.trim()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="18" height="18">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
