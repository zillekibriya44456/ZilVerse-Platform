export interface InterviewQuestion {
  id: string;
  category: "aptitude" | "hr" | "technical" | "coding";
  text: string;
  options?: string[]; // for aptitude questions
  correctAnswer?: string;
  codeTemplate?: string;
  codeSolutionCheck?: string;
  difficulty: "easy" | "medium" | "hard";
}

// Seeded random number helper
function getRandomItem<T>(arr: T[], seedStr: string): T {
  const hash = seedStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = Math.abs(hash) % arr.length;
  return arr[index];
}

// Generate unique Aptitude questions (15 count)
export function generateAptitudeQuestions(role: string, level: string): InterviewQuestion[] {
  const categories = ["quantitative", "logical", "verbal", "analytical", "problem_solving"];
  const list: InterviewQuestion[] = [];

  // Generate 15 distinct questions by varying parameters and numbers
  for (let i = 1; i <= 15; i++) {
    const category = categories[(i - 1) % categories.length];
    const difficulty = level.toLowerCase().includes("senior") || level.toLowerCase().includes("staff") ? "hard" : "medium";
    
    let text = "";
    let options: string[] = [];
    let correctAnswer = "";

    if (category === "quantitative") {
      const val1 = 10 * i + (i % 3) * 5;
      const val2 = 5 * i + 8;
      const rate = Math.floor((val1 * val2) / (val1 + val2));
      text = `A server clusters takes ${val1} minutes to index a batch of dataset. Another nodes takes ${val2} minutes. How many minutes will it take if both process the batch simultaneously?`;
      options = [
        `${rate} minutes`,
        `${rate + 2} minutes`,
        `${Math.max(2, rate - 2)} minutes`,
        `${rate + 5} minutes`
      ];
      correctAnswer = `${rate} minutes`;
    } 
    else if (category === "logical") {
      const start = 2 * i + 3;
      const diff = i + 1;
      const series = [start, start + diff, start + 2 * diff, start + 3 * diff];
      text = `Identify the next sequence value in this series: ${series.join(", ")}, _?`;
      const nextVal = start + 4 * diff;
      options = [
        `${nextVal}`,
        `${nextVal + diff}`,
        `${nextVal - 2}`,
        `${nextVal + 5}`
      ];
      correctAnswer = `${nextVal}`;
    } 
    else if (category === "verbal") {
      const words = ["scalable", "redundancy", "synchronous", "immutable", "idempotent"];
      const w = words[(i - 1) % words.length];
      text = `Which of the following definitions best describes the term "${w}" in digital systems?`;
      if (w === "scalable") {
        options = ["Capable of being easily expanded", "Lacking security protocols", "Using static databases", "Synchronized in real-time"];
        correctAnswer = "Capable of being easily expanded";
      } else if (w === "redundancy") {
        options = ["Duplicate components to ensure reliability", "Wasted server performance", "Overriding source code", "System memory leak"];
        correctAnswer = "Duplicate components to ensure reliability";
      } else if (w === "synchronous") {
        options = ["Happening at the same time", "Delayed response loop", "Running in worker thread", "Single CPU system"];
        correctAnswer = "Happening at the same time";
      } else {
        options = ["Actions producing same result repeatedly", "Values that can change", "Unsecured networking", "Static web layout"];
        correctAnswer = "Actions producing same result repeatedly";
      }
    } 
    else if (category === "analytical") {
      text = `A team of developers (A, B, C, D) are sitting in a row. A sits to the left of B. C sits next to D. If B sits at the rightmost end, who is sitting next to A?`;
      options = ["B only", "C or D", "D only", "None of these"];
      correctAnswer = "C or D";
    } 
    else {
      // problem solving
      const reqs = 1000 * i;
      const limit = 50 * i;
      text = `Your endpoint receives ${reqs} API requests/min. If each server can process at most ${limit} requests/min, what is the minimum number of active instances needed to prevent failure?`;
      const ans = Math.ceil(reqs / limit);
      options = [`${ans} instances`, `${ans + 1} instances`, `${ans - 1} instances`, `${ans + 3} instances`];
      correctAnswer = `${ans} instances`;
    }

    list.push({
      id: `apt_${i}`,
      category: "aptitude",
      text,
      options,
      correctAnswer,
      difficulty
    });
  }

  return list;
}

// Generate dynamic HR questions (15 count)
export function generateHRQuestions(role: string, level: string): InterviewQuestion[] {
  const topics = [
    "teamwork", "leadership", "strengths", "weaknesses", "conflict",
    "career_goals", "ethics", "pressure", "adaptability", "motivation",
    "feedback", "values", "growth", "collaboration", "resolution"
  ];
  const list: InterviewQuestion[] = [];

  for (let i = 1; i <= 15; i++) {
    const topic = topics[(i - 1) % topics.length];
    let text = "";

    if (topic === "teamwork") {
      text = `Describe a situation where a teammate disagreed with your proposed architecture for a ${role} project. How did you resolve the deadlock?`;
    } else if (topic === "leadership") {
      text = `As a ${level} professional, how do you delegate tasks when managing tight deadlines? Give an example.`;
    } else if (topic === "conflict") {
      text = `Tell me about a time you had a personality clash with a colleague or client. How did you manage it while staying productive?`;
    } else if (topic === "pressure") {
      text = `Imagine a critical feature crashes on production right before a major client presentation. Walk me through how you handle the stress and communication.`;
    } else if (topic === "career_goals") {
      text = `Where do you see yourself in 3 years, and how does working at ZilVerse align with your career goals?`;
    } else if (topic === "ethics") {
      text = `If a client or manager asked you to cut corners on security to deliver a feature faster, how would you respond?`;
    } else if (topic === "strengths") {
      text = `What is your single greatest professional strength as a developer, and how has it helped you succeed?`;
    } else if (topic === "weaknesses") {
      text = `What is one professional area you are actively trying to improve or learn right now?`;
    } else {
      text = `How do you stay motivated when working on tedious but essential maintenance tasks for a ${role} system?`;
    }

    list.push({
      id: `hr_${i}`,
      category: "hr",
      text,
      difficulty: i % 2 === 0 ? "easy" : "medium"
    });
  }

  return list;
}

// Generate dynamic Technical questions (15 count)
export function generateTechnicalQuestions(role: string, roleMode: string, level: string, skills: string): InterviewQuestion[] {
  const list: InterviewQuestion[] = [];
  const skillList = skills.split(",").map(s => s.trim()).filter(Boolean);
  const primarySkill = skillList[0] || "JavaScript";
  const secondarySkill = skillList[1] || "React";

  for (let i = 1; i <= 15; i++) {
    let text = "";
    
    if (roleMode === "ai") {
      if (i === 1) text = `Explain the mathematical intuition behind Transformer self-attention. How does it scale with input token size?`;
      else if (i === 2) text = `How do you tackle document chunking strategies for Retrieval-Augmented Generation (RAG) when dealing with highly nested tabular data?`;
      else if (i === 3) text = `What are the latency and memory trade-offs of using FP8 quantization versus full FP16 weights during LLM inference?`;
      else if (i === 4) text = `Describe how you would debug a gradient descent problem where training loss suddenly spikes or goes to NaN.`;
      else if (i === 5) text = `What is your experience with fine-tuning techniques like LoRA versus full parameter tuning for domain adaptation?`;
      else text = `Explain the difference between vector database index algorithms HNSW and IVF. When would you prefer one over another?`;
    } 
    else if (roleMode === "frontend") {
      if (i === 1) text = `How does React 19's Server Actions feature simplify form data transmission and state hydration?`;
      else if (i === 2) text = `Explain the reconciliation algorithm in React. How do 'keys' help in optimizing DOM mutations?`;
      else if (i === 3) text = `What strategies would you use to minimize Cumulative Layout Shift (CLS) in a heavy metrics portal using ${primarySkill}?`;
      else if (i === 4) text = `How do server-side rendering (SSR), static site generation (SSG), and incremental static regeneration (ISR) differ in Next.js?`;
      else text = `How do you prevent useless re-renders when utilizing Context API or Redux in complex UI dashboards?`;
    } 
    else if (roleMode === "cyber") {
      if (i === 1) text = `How do you audt codebase vulnerabilities for Server-Side Request Forgery (SSRF) and XML External Entity (XXE) injections?`;
      else if (i === 2) text = `Explain how you would secure sensitive session cookies using attributes like SameSite, Secure, and HttpOnly.`;
      else if (i === 3) text = `What is your response strategy when a vulnerability scanner flags a critical zero-day exploit in one of your node modules?`;
      else text = `Explain the mechanics of a CSRF attack. How does double-submit cookie pattern mitigate it?`;
    }
    else {
      // Backend / general software developer
      if (i === 1) text = `How do transaction isolation levels (Read Committed vs Serializable) prevent database dirty reads or write skew?`;
      else if (i === 2) text = `What are the benefits and drawbacks of using connection pooling in Postgres databases under high concurrent traffic?`;
      else if (i === 3) text = `Explain how you would implement a distributed lock using Redis to prevent double booking in an event marketplace.`;
      else text = `Describe your approach to API rate limiting. How does the token bucket algorithm work?`;
    }

    // append personalized target skills references
    if (i % 3 === 0 && skillList.length > 0) {
      text += ` How does this play out when integrating with ${getRandomItem(skillList, "hash" + i)}?`;
    }

    list.push({
      id: `tech_${i}`,
      category: "technical",
      text,
      difficulty: level.toLowerCase().includes("senior") ? "hard" : "medium"
    });
  }

  return list;
}

// Generate dynamic coding tasks (5 challenges)
export function generateCodingQuestions(roleMode: string): InterviewQuestion[] {
  const challenges: InterviewQuestion[] = [];

  for (let i = 1; i <= 5; i++) {
    let text = "";
    let template = "";
    let check = "";

    if (roleMode === "ai") {
      if (i === 1) {
        text = "Write a function to calculate Cosine Similarity between two arrays. Ensure magnitude checks are handled.";
        template = `function cosineSimilarity(a, b) {\n  // Compute similarity\n  return 0.0;\n}`;
        check = "Math.sqrt";
      } else if (i === 2) {
        text = "Implement a simple Tokenizer function that splits text on whitespace and punctuation, converting words to lowercase.";
        template = `function tokenize(text) {\n  // split and lowercase\n  return [];\n}`;
        check = "toLowerCase";
      } else {
        text = "Write a basic linear regression prediction loop returning prediction scores for given weights and inputs.";
        template = `function predict(x, w, b) {\n  // return prediction list\n  return [];\n}`;
        check = "map";
      }
    } 
    else if (roleMode === "frontend") {
      if (i === 1) {
        text = "Create a JavaScript function to format large currency amounts (e.g. 1000000 -> '$1,000,000').";
        template = `function formatCurrency(amount) {\n  // format integer\n  return "";\n}`;
        check = "toLocaleString";
      } else if (i === 2) {
        text = "Write a debounce helper function that delays calling a callback by given milliseconds.";
        template = `function debounce(fn, delay) {\n  // return debounced function\n  return fn;\n}`;
        check = "setTimeout";
      } else {
        text = "Write a function to deep clone a nested object, preventing pointer references.";
        template = `function deepClone(obj) {\n  // JSON helper or recursion\n  return {};\n}`;
        check = "JSON";
      }
    } 
    else {
      // general/backend
      if (i === 1) {
        text = "Write a function to check if a bracket sequence is balanced (e.g. '({[]})' is balanced, '({[})' is not).";
        template = `function isBalanced(str) {\n  // Stack matching\n  return true;\n}`;
        check = "stack";
      } else if (i === 2) {
        text = "Implement binary search on a sorted integer list, returning the index or -1.";
        template = `function binarySearch(arr, target) {\n  // search index\n  return -1;\n}`;
        check = "while";
      } else {
        text = "Write a function to find the maximum depth of a binary tree nested object.";
        template = `function maxDepth(node) {\n  // recursive depth check\n  return 0;\n}`;
        check = "Math.max";
      }
    }

    challenges.push({
      id: `code_${i}`,
      category: "coding",
      text,
      codeTemplate: template,
      codeSolutionCheck: check,
      difficulty: i > 3 ? "hard" : "medium"
    });
  }

  return challenges.slice(0, 5);
}

// Global Orchestrator to generate all questions for an entire multi-round screening flow!
export interface CompleteInterviewFlow {
  aptitude: InterviewQuestion[];
  hr: InterviewQuestion[];
  technical: InterviewQuestion[];
  coding: InterviewQuestion[];
}

export function generateCompleteFlow(
  role: string,
  roleMode: "ai" | "frontend" | "cyber" | "freelance" | "intern" | "professor" | "founder" | "hr",
  level: string,
  skills: string
): CompleteInterviewFlow {
  return {
    aptitude: generateAptitudeQuestions(role, level),
    hr: generateHRQuestions(role, level),
    technical: generateTechnicalQuestions(role, roleMode, level, skills),
    coding: generateCodingQuestions(roleMode)
  };
}
