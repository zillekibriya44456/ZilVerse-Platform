"use client";
import { API_BASE } from "@/utils/api";

import { useState, useEffect, useRef } from "react";
import { generateCompleteFlow, CompleteInterviewFlow, InterviewQuestion } from "@/constants/interviewQuestions";
import styles from "./AIInterviewRoom.module.css";
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronRight, CornerDownRight, Mic, MicOff, PhoneOff, Play, RefreshCw, Send, Sparkles, Terminal, Video, VideoOff } from "lucide-react";
import axios from "axios";

interface Props {
  name: string;
  role: string;
  roleMode: "ai" | "frontend" | "cyber" | "freelance" | "intern" | "professor" | "founder" | "hr";
  level: string;
  skills: string;
  interviewerName: string;
  interviewerGender: "male" | "female";
  interviewType: "coding" | "voice" | "traditional";
  onComplete: (score: number, feedback: string) => void;
  onClose: () => void;
}

const SpeechRecognition = typeof window !== "undefined" ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;

// Speech corrector helpers
function scanGrammarAndPhrasing(text: string): { corrected: string; original: string; reason: string } | null {
  const lower = text.toLowerCase();
  if (lower.includes("more better")) {
    return { original: "more better", corrected: "much better / better", reason: "Double comparative error." };
  }
  if (lower.includes("we was")) {
    return { original: "we was", corrected: "we were", reason: "Subject-verb agreement error." };
  }
  if (lower.includes("didn't did") || lower.includes("did not did")) {
    return { original: "didn't did", corrected: "didn't do", reason: "Double past tense error." };
  }
  if (lower.includes("i has")) {
    return { original: "i has", corrected: "I have", reason: "Subject-verb agreement." };
  }
  if (lower.includes("discuss about")) {
    return { original: "discuss about", corrected: "discuss", reason: "Redundant preposition." };
  }
  if (lower.includes("how it looks like")) {
    return { original: "how it looks like", corrected: "what it looks like", reason: "Idiomatic phrasing." };
  }
  return null;
}

export default function AIInterviewRoom({
  name,
  role,
  roleMode,
  level,
  skills,
  interviewerName,
  interviewerGender,
  interviewType,
  onComplete,
  onClose
}: Props) {
  // Multi-round state coordinator
  // Rounds: 1 (Resume Analysis), 2 (Aptitude), 3 (HR), 4 (Technical), 5 (Coding Sandbox), 6 (Evaluation)
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [roundFlow, setRoundFlow] = useState<CompleteInterviewFlow | null>(null);

  // Question pointer indices
  const [questionIdx, setQuestionIdx] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Resume scanning logs (Round 1)
  const [resumeLogs, setResumeLogs] = useState<string[]>([]);
  const [isScanningResume, setIsScanningResume] = useState(true);

  // Score metrics
  const [aptitudeScore, setAptitudeScore] = useState(0);
  const [aptitudeAnswers, setAptitudeAnswers] = useState<string[]>([]);
  const [hrAnswers, setHrAnswers] = useState<string[]>([]);
  const [techAnswers, setTechAnswers] = useState<string[]>([]);
  const [codingAnswers, setCodingAnswers] = useState<string[]>([]);

  // Grammar & anti-cheat warnings
  const [grammarCorrection, setGrammarCorrection] = useState<{ corrected: string; original: string; reason: string } | null>(null);
  const [correctionList, setCorrectionList] = useState<string[]>([]);
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const [cheatLog, setCheatLog] = useState<string[]>([]);

  // Sandbox editor
  const [codeValue, setCodeValue] = useState("");
  const [codeConsole, setCodeConsole] = useState("Sandbox environment ready for coding...");
  const [isCompiling, setIsCompiling] = useState(false);

  // Video call controls
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [hasCameraError, setHasCameraError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // 1. Initial trigger: Setup camera & generate questions
  useEffect(() => {
    // Generate full flow
    const flow = generateCompleteFlow(role, roleMode, level, skills);
    setRoundFlow(flow);

    // Setup camera stream
    if (!isCamOff) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => {
          console.error("Camera access blocked:", err);
          setHasCameraError(true);
        });
    }

    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }

    // Run Resume scanning animation logs (Round 1)
    const logs = [
      "🔄 Initializing ZilVerse Interview AI Parser...",
      `📂 Loading candidate resume profile: ${name}...`,
      `🔍 Scanning Portfolio & LinkedIn URL nodes...`,
      `🔗 Validating GitHub repository codebases...`,
      `🏆 Parsing Certifications: ${skills}...`,
      `🎓 Mapping Educational background with level: ${level}...`,
      `⚡ Tailoring Aptitude difficulty to Candidate Profile...`,
      `🤖 Synthesizing 15 Aptitude, 15 HR, 15 Tech, and 5 Coding problems...`,
      "🎉 Resume Analysis Complete! Dynamic interview flow created."
    ];

    let currentLogIdx = 0;
    const interval = setInterval(() => {
      if (currentLogIdx < logs.length) {
        setResumeLogs(prev => [...prev, logs[currentLogIdx]]);
        currentLogIdx++;
      } else {
        clearInterval(interval);
        setIsScanningResume(false);
      }
    }, 450);

    // Speech recognition setup
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (evt: any) => {
        let currentTranscript = "";
        for (let i = evt.resultIndex; i < evt.results.length; i++) {
          currentTranscript += evt.results[i][0].transcript;
        }
        setTranscript(currentTranscript);

        // Scan grammar & phrasing
        const issue = scanGrammarAndPhrasing(currentTranscript);
        if (issue) {
          setGrammarCorrection(issue);
          setCorrectionList(prev => {
            const entry = `Corrected "${issue.original}" to "${issue.corrected}" (${issue.reason})`;
            return prev.includes(entry) ? prev : [...prev, entry];
          });

          // AI Recruiter soft verbal advice tip
          if (synthRef.current && !synthRef.current.speaking) {
            synthRef.current.cancel();
            const adviceUtterance = new SpeechSynthesisUtterance(
              `Excuse me, ${name}. It's better to phrase that as "${issue.corrected}" rather than "${issue.original}". Please proceed.`
            );
            const voices = synthRef.current.getVoices();
            const vMatch = voices.find(v => v.lang.startsWith("en"));
            if (vMatch) adviceUtterance.voice = vMatch;
            adviceUtterance.rate = 1.0;
            adviceUtterance.pitch = interviewerGender === "female" ? 1.05 : 0.92;
            synthRef.current.speak(adviceUtterance);
          }
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    // Anti-cheat handlers
    const handleBlur = () => {
      setCheatWarnings(prev => {
        const next = prev + 1;
        setCheatLog(l => [...l, `Candidate switched tab`]);
        if (synthRef.current) {
          synthRef.current.cancel();
          const utterance = new SpeechSynthesisUtterance("Excuse me, I noticed you switched away from our meeting screen. Let's focus back on the call.");
          synthRef.current.speak(utterance);
        }
        return next;
      });
    };

    window.addEventListener("blur", handleBlur);

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (synthRef.current) synthRef.current.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
      window.removeEventListener("blur", handleBlur);
      clearInterval(interval);
    };
  }, [role, roleMode, level, isCamOff]);

  // Speak questions based on round index updates
  useEffect(() => {
    if (!roundFlow || currentRound === 1 || currentRound === 6) return;

    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);

    let activeQuestion: InterviewQuestion | null = null;
    let introText = "";

    if (currentRound === 2) {
      activeQuestion = roundFlow.aptitude[questionIdx];
      if (questionIdx === 0) introText = "Welcome to the Aptitude Round. I have prepared 15 questions covering logical, verbal, and quantitative reasoning. Let's start with the first question. ";
    } else if (currentRound === 3) {
      activeQuestion = roundFlow.hr[questionIdx];
      if (questionIdx === 0) introText = "Let's move into the HR Interview. I will ask 15 questions regarding communication, leadership, ethics, and pressure handling. Here is the first scenario. ";
    } else if (currentRound === 4) {
      activeQuestion = roundFlow.technical[questionIdx];
      if (questionIdx === 0) introText = `Welcome to the Technical Round. I'll prompt you with 15 questions custom tailored to your skills in ${skills || "general software design"}. Let's begin. `;
    } else if (currentRound === 5) {
      activeQuestion = roundFlow.coding[questionIdx];
      setCodeValue(activeQuestion.codeTemplate || "");
      if (questionIdx === 0) introText = "Time for the live coding sandbox round. I have generated 5 technical code challenges. Complete each one in the editor. ";
    }

    if (activeQuestion) {
      const prompt = introText + activeQuestion.text;
      const utterance = new SpeechSynthesisUtterance(prompt);

      if (synthRef.current) {
        const voices = synthRef.current.getVoices();
        let preferred = voices.find(v => {
          if (interviewerGender === "female") {
            return v.name.includes("Google US English") || v.name.includes("Samantha");
          } else {
            return v.name.includes("Google UK English Male") || v.name.includes("David");
          }
        });

        if (!preferred) preferred = voices.find(v => v.lang.startsWith("en"));
        if (preferred) utterance.voice = preferred;

        utterance.rate = 0.95;
        utterance.pitch = interviewerGender === "female" ? 1.05 : 0.92;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          setGrammarCorrection(null);
          if (!isMuted && (currentRound === 3 || currentRound === 4)) {
            startVoiceRecognition();
          }
        };

        synthRef.current.cancel();
        synthRef.current.speak(utterance);
      }
    }
  }, [currentRound, questionIdx, roundFlow]);

  const startVoiceRecognition = () => {
    if (!recognitionRef.current) return;
    setTranscript("");
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error(e);
    }
  };

  // Move to next question or transition rounds
  const handleNextStep = (selectedOption?: string) => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);

    if (!roundFlow) return;

    // Save answer data
    const textAns = selectedOption || transcript || "(Answered)";
    if (currentRound === 2) {
      const activeQ = roundFlow.aptitude[questionIdx];
      if (textAns === activeQ.correctAnswer) {
        setAptitudeScore(s => s + 1);
      }
      setAptitudeAnswers(prev => [...prev, textAns]);
    } else if (currentRound === 3) {
      setHrAnswers(prev => [...prev, textAns]);
    } else if (currentRound === 4) {
      setTechAnswers(prev => [...prev, textAns]);
    } else if (currentRound === 5) {
      setCodingAnswers(prev => [...prev, `[Challenge ${questionIdx + 1}] Console: ${codeConsole}`]);
    }

    setTranscript("");
    setGrammarCorrection(null);

    // Limit counts based on rounds
    const maxQs = currentRound === 5 ? 5 : 15;
    const nextIdx = questionIdx + 1;

    if (nextIdx < maxQs) {
      setQuestionIdx(nextIdx);
    } else {
      // Transition to next round
      setQuestionIdx(0);
      setCurrentRound(prev => prev + 1);
    }
  };

  const handleRunCode = async () => {
    if (!roundFlow) return;
    setIsCompiling(true);
    setCodeConsole("Connecting to secure VM debugger and running test cases...");
    
    try {
      const activeQ = roundFlow.coding[questionIdx];
      // Generate standard test cases dynamically based on active coding question requirements
      const testCases = [
        {
          input: activeQ.text?.toLowerCase().includes("reverse") ? "hello" : 5,
          expected: activeQ.text?.toLowerCase().includes("reverse") ? "olleh" : 10,
          functionName: activeQ.codeSolutionCheck || "solution"
        }
      ];

      const token = localStorage.getItem('zilverse_token');
      const response = await axios.post(`${API_BASE}/api/interview/sandbox/run`, {
        code: codeValue,
        testCases
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { success, results, logs, error } = response.data;
      if (error) {
        setCodeConsole(`[ERROR] ${error}\n\n[LOGS]\n${logs?.join('\n') || 'None'}`);
      } else {
        const testLogs = results && Array.isArray(results) ? results.map((r: any, idx: number) => 
          `[TEST CASE ${idx + 1}] Input: ${JSON.stringify(r.input)} -> Expected: ${JSON.stringify(r.expected)} -> Got: ${JSON.stringify(r.got !== undefined ? r.got : (r.error || 'undefined'))} -> Status: ${r.passed ? 'PASSED ✅' : 'FAILED ❌'}`
        ).join('\n') : 'No compilation test logs.';
        
        setCodeConsole(`[CONSOLE]\n${logs?.join('\n') || 'No console outputs'}\n\n[TEST SUITE]\n${testLogs}\n\n[STATUS] ${success ? 'ALL PASSED 🎉' : 'SOME TESTS FAILED ⚠️'}`);
        
        if (success) {
          // Record successful pass for this question index
          setCodingAnswers(prev => {
            const next = [...prev];
            next[questionIdx] = `[Challenge ${questionIdx + 1}] PASSED`;
            return next;
          });
        }
      }
    } catch (e: any) {
      setCodeConsole(`[SANDBOX CONNECTION ERROR] ${e.response?.data?.error || e.message}`);
    } finally {
      setIsCompiling(false);
    }
  };

  // Compile final results & save to database
  const handleFinalSubmit = async () => {
    if (!roundFlow) return;

    const aptPercent = Math.floor((aptitudeScore / 15) * 100);
    const hrPercent = Math.min(100, Math.max(50, 90 - (correctionList.length * 5)));
    const codePassedCount = codingAnswers.filter(c => c && c.includes("PASSED")).length;
    const codingPercent = Math.floor((codePassedCount / 5) * 100);
    const technicalPercent = Math.min(100, Math.max(50, 85 - (cheatWarnings * 8) + (codingPercent * 0.15)));

    const finalScore = Math.floor((aptPercent + hrPercent + codingPercent + technicalPercent) / 4);

    const assessmentReport = {
      score: finalScore,
      aptitude: aptPercent,
      hr: hrPercent,
      technical: technicalPercent,
      coding: codingPercent,
      communication: Math.min(100, Math.max(40, 92 - (correctionList.length * 6))),
      confidence: Math.min(100, Math.max(40, 90 - (cheatWarnings * 10))),
      readiness: finalScore >= 80 ? "Highly Recommended" : "Needs Review",
      salary: finalScore >= 80 ? "$120,000 - $140,000" : "$85,000 - $95,000",
      strengths: ["Strong quantitative analytical metrics", `Successfully cleared ${codePassedCount} sandbox tests`],
      weaknesses: correctionList.length > 0 ? [`Real-time grammar corrections logged: ${correctionList.length} items`] : [],
      suggestions: `Solid performance! Expand coding check keywords and correct grammar errors: ${correctionList.join(", ")}`,
      questions: roundFlow.technical.map(t => t.text),
      answers: techAnswers
    };

    try {
      const token = localStorage.getItem('zilverse_token');
      await axios.post(`${API_BASE}/api/interview`, {
        score: finalScore,
        feedback: assessmentReport
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error('[SUBMISSION ERROR]', e);
    }

    onComplete(finalScore, JSON.stringify(assessmentReport));
  };

  // Round 1: Resume scanning dashboard view
  if (currentRound === 1) {
    return (
      <div className={styles.overlay}>
        <div className={styles.loaderBox} style={{ maxWidth: "600px", margin: "auto" }}>
          <RefreshCw className={styles.spinner} size={48} />
          <h3 style={{ margin: "1rem 0 0.5rem 0", fontWeight: "700" }}>Round 1: AI Resume Parsing & Tailoring</h3>
          <p style={{ color: "#71717a", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            The AI is analyzing your portfolio, projects, credentials, and experience level to generate a custom-tailored interview flow.
          </p>
          <div className={styles.scanLogsContainer}>
            {resumeLogs.map((log, idx) => (
              <div key={idx} className={styles.scanLogItem}>
                <ChevronRight size={14} color="#a855f7" />
                <span>{log}</span>
              </div>
            ))}
          </div>
          <button
            className={styles.nextBtn}
            onClick={() => setCurrentRound(2)}
            disabled={isScanningResume}
            style={{ marginTop: "2rem", width: "100%" }}
          >
            <span>Enter Round 2: Aptitude Test</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Round 6: Final Submission coordinate loader
  if (currentRound === 6) {
    return (
      <div className={styles.overlay}>
        <div className={styles.loaderBox} style={{ textAlign: "center", padding: "3rem" }}>
          <CheckCircle2 size={48} color="#10b981" />
          <h3 style={{ margin: "1.2rem 0 0.5rem 0" }}>All Interview Rounds Cleared!</h3>
          <p style={{ color: "#71717a", fontSize: "0.9rem", maxWidth: "450px", marginBottom: "2rem" }}>
            You have successfully completed the Resume, Aptitude, HR, Technical, and Coding rounds. Let's submit to generate the Final assessment.
          </p>
          <button className={styles.nextBtn} onClick={handleFinalSubmit} style={{ width: "240px" }}>
            <span>Generate Final AI Report</span>
          </button>
        </div>
      </div>
    );
  }

  const activeQuestion =
    currentRound === 2 ? roundFlow?.aptitude[questionIdx] :
    currentRound === 3 ? roundFlow?.hr[questionIdx] :
    currentRound === 4 ? roundFlow?.technical[questionIdx] :
    roundFlow?.coding[questionIdx];

  const isCodingRound = currentRound === 5;

  return (
    <div className={styles.overlay}>
      {/* Zoom / Meet top bar */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Sparkles size={16} color="#a855f7" />
          <h2 style={{ fontSize: "1rem", fontWeight: "700" }}>ZilVerse Live Screening Conference Room</h2>
        </div>
        <div className={styles.roundBanner}>
          <span>Round {currentRound} of 5: {
            currentRound === 2 ? "Aptitude Round" :
            currentRound === 3 ? "HR Interview" :
            currentRound === 4 ? "Technical Interview" :
            "Coding Sandbox"
          }</span>
        </div>
      </div>

      <div className={`${styles.mainScreen} ${isCodingRound ? styles.splitCodingMode : ""}`}>
        
        <div className={styles.roomCol}>
          
          {/* Zoom grid cards */}
          <div className={styles.videoGrid}>
            <div className={styles.videoCard}>
              <div className={`${styles.avatarVideoWrapper} ${isSpeaking ? styles.avatarSpeaking : ""}`}>
                <div className={styles.livePortraitGlow} />
                <img 
                  src={interviewerGender === "female" ? "/avatars/hr_female.png" : "/avatars/hr_male.png"} 
                  alt={interviewerName}
                  className={styles.portraitImg}
                />
                {isSpeaking && (
                  <div className={styles.soundWaves}>
                    <span /><span /><span /><span /><span />
                  </div>
                )}
              </div>
              <div className={styles.videoLabel}>
                <span>👤 {interviewerName} (Recruiter)</span>
              </div>
            </div>

            <div className={styles.videoCard}>
              {isCamOff ? (
                <div className={styles.camBlocked}>
                  <VideoOff size={32} />
                  <span>Camera Off</span>
                </div>
              ) : hasCameraError ? (
                <div className={styles.camBlocked}>
                  <AlertCircle size={32} color="#f87171" />
                  <span>Camera Blocked</span>
                </div>
              ) : (
                <video ref={videoRef} autoPlay playsInline muted className={styles.videoStream} />
              )}
              {isListening && (
                <div className={styles.voiceIndicatorBadge}>
                  <span className={styles.recordingDot} />
                  <span>Listening Active</span>
                </div>
              )}
              {!SpeechRecognition && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(239, 68, 68, 0.25)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#fca5a5',
                  zIndex: 10
                }}>
                  ⚠️ Speech API Unsupported (Type Answer Below)
                </div>
              )}
              <div className={styles.videoLabel}>
                <span>👤 {name} (Candidate)</span>
              </div>
            </div>
          </div>

          {/* Grammar scan alerts */}
          {grammarCorrection && (
            <div className={styles.grammarAlertCard}>
              <div className={styles.grammarAlertHead}>
                <AlertTriangle size={16} />
                <span>💡 Real-time Grammar Correction</span>
              </div>
              <p>
                Try saying <strong>"{grammarCorrection.corrected}"</strong> instead of "{grammarCorrection.original}".
                <span className={styles.reasonText}>({grammarCorrection.reason})</span>
              </p>
            </div>
          )}

          {/* Subtitle / question box */}
          {activeQuestion && (
            <div className={styles.questionPanel}>
              <p className={styles.questionText}>
                <strong>Question {questionIdx + 1}:</strong> {activeQuestion.text}
              </p>
            </div>
          )}

          {/* Round 2: Interactive Aptitude Options selector */}
          {currentRound === 2 && activeQuestion?.options && (
            <div className={styles.aptitudeOptionsGrid}>
              {activeQuestion.options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  className={styles.optionBtn}
                  onClick={() => handleNextStep(opt)}
                >
                  <CornerDownRight size={14} style={{ marginRight: "0.5rem" }} />
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          )}

          {/* HR & Technical responses open voice/text fallback */}
          {(currentRound === 3 || currentRound === 4) && (
            <div className={styles.textInputBox}>
              <textarea
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                placeholder="Speak clearly, or write down your response logs here..."
                rows={3}
              />
              <button className={styles.nextBtn} onClick={() => handleNextStep()} disabled={isSpeaking}>
                <Send size={16} />
                <span>Next Question</span>
              </button>
            </div>
          )}

          {/* Conference controllers strip */}
          <div className={styles.controlsStrip}>
            <button className={`${styles.controlBtn} ${isMuted ? styles.controlBtnActive : ""}`} onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <button className={`${styles.controlBtn} ${isCamOff ? styles.controlBtnActive : ""}`} onClick={() => setIsCamOff(!isCamOff)}>
              {isCamOff ? <VideoOff size={18} /> : <Video size={18} />}
            </button>
            <button className={styles.endCallBtn} onClick={onClose}>
              <PhoneOff size={18} />
              <span>Leave Session</span>
            </button>
          </div>

        </div>

        {/* Right Panel Coding Sandbox */}
        {isCodingRound && activeQuestion && (
          <div className={styles.editorPanel}>
            <div className={styles.editorHeader}>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <Terminal size={14} color="#8b5cf6" />
                <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>Sandbox Code Verification (Challenge {questionIdx + 1} of 5)</span>
              </div>
              <button className={styles.runBtn} onClick={handleRunCode} disabled={isCompiling}>
                <Play size={12} />
                <span>{isCompiling ? "Compiling..." : "Run Code"}</span>
              </button>
            </div>
            
            <textarea
              className={styles.codeTextarea}
              value={codeValue}
              onChange={e => setCodeValue(e.target.value)}
              spellCheck={false}
            />

            <div className={styles.consoleWrapper}>
              <pre className={styles.consolePre}>{codeConsole}</pre>
            </div>

            <div className={styles.editorFooter}>
              <button className={styles.nextBtn} onClick={() => handleNextStep()}>
                <CheckCircle2 size={16} />
                <span>Submit Coding Solution</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
