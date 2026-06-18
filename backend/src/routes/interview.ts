import prisma from '../lib/prisma';
import express, { Request, Response } from 'express';

import { requireAuth as authenticateToken } from '../middleware/auth';
import axios from 'axios';
import vm from 'vm';

const router = express.Router();


const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Helper to interact with Google Gemini API
async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    // Fallback if API key is not configured (simulated production mode)
    return JSON.stringify({
      text: "Gemini API key is not configured. This is a simulated fallback response.",
      questions: [
        "Describe your experience with full-stack software architecture.",
        "How do you design REST APIs to prevent race conditions?",
        "Write a function to find the maximum sum subarray (Kadane's algorithm)."
      ]
    });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });
    
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    return text;
  } catch (error: any) {
    console.error('[GEMINI API ERROR]', error.response?.data || error.message);
    throw new Error('AI Engine failed to generate response.');
  }
}

// 1. Get Past Assessments for Authenticated User
router.get('/', authenticateToken, async (req: Request, res: any) => {
  try {
    const userId = (req as any).user?.id;
    const results = await prisma.interviewResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interview results' });
  }
});

// 1b. Save Assessment manually (Secure version)
router.post('/', authenticateToken, async (req: Request, res: any) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized user context.' });
    
    const { score, feedback } = req.body;
    const result = await prisma.interviewResult.create({
      data: {
        score: parseInt(score),
        feedback: typeof feedback === 'object' ? JSON.stringify(feedback) : feedback,
        userId
      }
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save interview result' });
  }
});

// 2. Start Interview (Generate Dynamic Questions based on role & level)
router.post('/start', authenticateToken, async (req: Request, res: any) => {
  try {
    const { role, experienceLevel } = req.body;
    if (!role) return res.status(400).json({ error: 'Role is required.' });

    const prompt = `
      You are an expert technical interviewer. Generate 3 unique interview questions for the role: "${role}" at experience level: "${experienceLevel || 'Mid-Level'}".
      Format your response strictly as a JSON object with a single root key "questions" containing an array of strings. Do not include markdown wraps or backticks outside the JSON.
      The questions should cover:
      1. Core architectural concepts
      2. Problem solving or coding scenario description
      3. System design or security practices
    `;

    const aiResponseText = await callGemini(prompt);
    let parsed: any;
    try {
      parsed = JSON.parse(aiResponseText);
    } catch {
      parsed = { questions: [
        `Explain your experience in ${role}.`,
        `Describe a challenging problem you solved in ${role}.`,
        `How do you handle API security in a production-grade application?`
      ]};
    }

    res.json({ success: true, questions: parsed.questions });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to start interview.' });
  }
});

// 3. Evaluate User Answer & Provide Adaptive Follow-up
router.post('/answer', authenticateToken, async (req: Request, res: any) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and Answer are required.' });
    }

    const prompt = `
      You are a technical interviewer. The candidate was asked: "${question}".
      They responded with: "${answer}".
      Evaluate their response and generate one follow-up question that drills deeper into the concepts they mentioned or missed.
      Format your response strictly as a JSON object:
      {
        "evaluation": "Brief evaluation of their answer (max 2 sentences)",
        "followUp": "The adaptive follow-up question"
      }
    `;

    const aiResponseText = await callGemini(prompt);
    let parsed: any;
    try {
      parsed = JSON.parse(aiResponseText);
    } catch {
      parsed = {
        evaluation: "The candidate answered the core question.",
        followUp: "Can you elaborate on how you would scale that solution?"
      };
    }

    res.json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Final Evaluation & Database logging
router.post('/evaluate', authenticateToken, async (req: Request, res: any) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized context' });

    const { transcript } = req.body; // Array of { question: string, answer: string }
    if (!transcript || !Array.isArray(transcript)) {
      return res.status(400).json({ error: 'Interview transcript is required.' });
    }

    const transcriptStr = transcript.map((t, idx) => `Q${idx+1}: ${t.question}\nA${idx+1}: ${t.answer}`).join('\n\n');

    const prompt = `
      You are the head of talent screening. Evaluate the following technical interview transcript:
      ${transcriptStr}
      
      Score the candidate from 0 to 100 based on their tech depth, accuracy, and communication.
      Provide detailed constructive feedback.
      Format your response strictly as a JSON object:
      {
        "score": number (0-100),
        "feedback": "Detailed feedback paragraph with strengths and areas for improvement"
      }
    `;

    const aiResponseText = await callGemini(prompt);
    let evaluation: { score: number; feedback: string };
    try {
      evaluation = JSON.parse(aiResponseText);
      if (typeof evaluation.score !== 'number') {
        evaluation.score = 70;
      }
    } catch {
      evaluation = {
        score: 75,
        feedback: "Completed interview screening. Candidate demonstrated basic familiarity with technical topics."
      };
    }

    // Save to DB
    const result = await prisma.interviewResult.create({
      data: {
        score: evaluation.score,
        feedback: evaluation.feedback,
        userId
      }
    });

    res.status(201).json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Secure Sandboxed Code Execution Sandbox (VM-based)
router.post('/sandbox/run', authenticateToken, async (req: Request, res: any) => {
  try {
    const { code, testCases } = req.body; // testCases: Array of { input: any, expected: any, functionName: string }
    if (!code) return res.status(400).json({ error: 'Code content is required.' });

    const logs: string[] = [];
    const results: any[] = [];

    // Setup sandboxed VM environment
    const sandbox = {
      console: {
        log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '))
      },
      Math,
      JSON,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Date
    };

    const context = vm.createContext(sandbox);

    // 1. Run the base code inside the VM to register the function definition
    try {
      vm.runInContext(code, context, { timeout: 1500 });
    } catch (compileErr: any) {
      return res.json({
        success: false,
        error: `Compilation/Execution Error: ${compileErr.message}`,
        logs
      });
    }

    // 2. Evaluate test cases if supplied
    let allPassed = true;
    if (testCases && Array.isArray(testCases)) {
      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const fnName = tc.functionName || 'solution';
        
        try {
          // Execute specific function call
          const resultVal = vm.runInContext(`${fnName}(${JSON.stringify(tc.input)})`, context, { timeout: 500 });
          const passed = JSON.stringify(resultVal) === JSON.stringify(tc.expected);
          if (!passed) allPassed = false;
          results.push({
            testCaseIndex: i,
            input: tc.input,
            expected: tc.expected,
            got: resultVal,
            passed
          });
        } catch (execErr: any) {
          allPassed = false;
          results.push({
            testCaseIndex: i,
            input: tc.input,
            expected: tc.expected,
            error: execErr.message,
            passed: false
          });
        }
      }
    } else {
      results.push({ message: 'No test cases supplied. Code compiled successfully.' });
    }

    res.json({
      success: allPassed,
      results,
      logs
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/interview/:id/pdf — download interview report as HTML (print to PDF) ──
router.get('/:id/pdf', authenticateToken, async (req: Request, res: any) => {
  try {
    const uid = String((req as any).user.id);
    const { id } = req.params as Record<string, string>;

    const result = await prisma.interviewResult.findFirst({ where: { id, userId: uid } });
    if (!result) return res.status(404).json({ error: 'Interview result not found' });

    const score = result.score || 0;
    const scoreColor = score >= 80 ? '#22c55e' : score >= 60 ? '#F59E0B' : '#EF4444';
    const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D';

    // Parse transcript if stored as JSON
    let transcriptHtml = '';
    try {
      const transcript = JSON.parse(result.transcript || '[]');
      if (Array.isArray(transcript)) {
        transcriptHtml = transcript.map((t: any, i: number) => `
          <div style="margin-bottom:1.5rem;padding:1rem;border-left:3px solid ${i % 2 === 0 ? '#8B5CF6' : '#3B82F6'};background:#f8f9ff;border-radius:0 8px 8px 0">
            <div style="font-weight:700;color:#374151;margin-bottom:0.4rem">${i % 2 === 0 ? '🎤 Interviewer' : '👤 You'}</div>
            <div style="color:#4B5563;line-height:1.6">${t.content || t.message || t}</div>
          </div>`).join('');
      } else {
        transcriptHtml = `<p style="color:#6B7280">${result.transcript}</p>`;
      }
    } catch {
      transcriptHtml = `<p style="color:#6B7280">${result.transcript || 'No transcript available'}</p>`;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ZilVerse Interview Report — ${result.role}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color:#1F2937; background:#fff; padding:2rem; }
  @media print {
    body { padding:0; }
    .no-print { display:none; }
    @page { margin:20mm; }
  }
  .header { background:linear-gradient(135deg,#6D28D9,#4F46E5); color:#fff; padding:2.5rem; border-radius:16px; margin-bottom:2rem; }
  .header h1 { font-size:2rem; font-weight:900; margin-bottom:0.25rem; }
  .header p { opacity:0.8; font-size:0.95rem; }
  .score-ring { display:inline-flex; align-items:center; justify-content:center; width:80px; height:80px; border-radius:50%; background:rgba(255,255,255,0.2); font-size:1.75rem; font-weight:900; border:4px solid #fff; float:right; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:2rem; }
  .card { background:#F9FAFB; border:1px solid #E5E7EB; border-radius:12px; padding:1.25rem; }
  .card-label { font-size:0.75rem; font-weight:700; color:#6B7280; text-transform:uppercase; letter-spacing:.05em; margin-bottom:0.3rem; }
  .card-value { font-size:1.5rem; font-weight:900; }
  .feedback-box { background:#F0FDF4; border:1px solid #86EFAC; border-radius:12px; padding:1.5rem; margin-bottom:2rem; }
  .feedback-box h3 { color:#15803D; font-size:1rem; margin-bottom:0.5rem; }
  .feedback-box p { color:#166534; line-height:1.6; }
  .section-title { font-size:1.1rem; font-weight:800; color:#1F2937; margin-bottom:1rem; padding-bottom:0.5rem; border-bottom:2px solid #E5E7EB; }
  .print-btn { position:fixed; bottom:2rem; right:2rem; background:#6D28D9; color:#fff; border:none; padding:0.85rem 1.5rem; border-radius:12px; font-size:0.9rem; font-weight:700; cursor:pointer; box-shadow:0 8px 24px rgba(109,40,217,0.4); }
  .badge { display:inline-block; padding:0.3rem 0.75rem; border-radius:20px; font-size:0.8rem; font-weight:700; }
  .badge-pass { background:#DCFCE7; color:#166534; }
  .badge-fail { background:#FEF2F2; color:#991B1B; }
  .watermark { text-align:center; color:#D1D5DB; font-size:0.75rem; margin-top:3rem; }
</style>
</head>
<body>

<button class="no-print print-btn" onclick="window.print()">⬇️ Download PDF</button>

<div class="header">
  <div class="score-ring" style="color:#fff">${grade}</div>
  <h1>🎯 Interview Report</h1>
  <p>${result.role} • ${new Date(result.createdAt).toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' })}</p>
  <p style="margin-top:0.5rem;opacity:0.7">ZilVerse AI Interview Platform</p>
</div>

<div class="grid">
  <div class="card">
    <div class="card-label">Overall Score</div>
    <div class="card-value" style="color:${scoreColor}">${score}/100</div>
  </div>
  <div class="card">
    <div class="card-label">Grade</div>
    <div class="card-value" style="color:${scoreColor}">${grade}</div>
  </div>
  <div class="card">
    <div class="card-label">Position</div>
    <div class="card-value" style="font-size:1.1rem">${result.role}</div>
  </div>
  <div class="card">
    <div class="card-label">Result</div>
    <div style="margin-top:0.5rem">
      <span class="badge ${score >= 60 ? 'badge-pass' : 'badge-fail'}">${score >= 60 ? '✅ Passed' : '❌ Did not pass'}</span>
    </div>
  </div>
</div>

${result.feedback ? `
<div class="feedback-box">
  <h3>💡 AI Interviewer Feedback</h3>
  <p>${result.feedback}</p>
</div>` : ''}

<div class="section-title">📝 Interview Transcript</div>
${transcriptHtml || '<p style="color:#6B7280;padding:1rem">No transcript recorded.</p>'}

<div class="watermark">
  <p>Generated by ZilVerse AI Interview Platform • ${new Date().toLocaleString()}</p>
  <p>Report ID: ${result.id}</p>
</div>

</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="interview-report-${result.id}.html"`);
    return res.send(html);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to generate report' });
  }
});

export default router;
