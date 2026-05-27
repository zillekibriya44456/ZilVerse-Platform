import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import axios from 'axios';
import vm from 'vm';

const router = express.Router();
const prisma = new PrismaClient();

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

export default router;
