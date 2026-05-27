export interface InnovationChallenge {
  id: string;
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  reward: string;
  deadline: string;
  status: "Open" | "In Progress" | "Closed";
}

export interface ImpactShowcase {
  id: string;
  title: string;
  solver: string;
  company: string;
  impactMetrics: string;
  description: string;
  image: string;
}

export interface SkillProof {
  id: string;
  skillName: string;
  proficiency: "Beginner" | "Intermediate" | "Expert";
  verifiedBy: string; // The challenge or company that verified it
  dateVerified: string;
  verificationLink: string;
}

export const ACTIVE_CHALLENGES: InnovationChallenge[] = [
  {
    id: "chal-1",
    title: "Optimize Cold-Chain Logistics Routing",
    company: "PharmaGlobal Logistics",
    description: "We are losing 4% of temperature-sensitive medicine due to inefficient routing in developing regions. We need an AI model to optimize delivery paths considering live traffic and temperature data.",
    requiredSkills: ["Python", "Machine Learning", "Graph Algorithms"],
    reward: "$15,000 + Contract Opportunity",
    deadline: "Nov 30, 2025",
    status: "Open"
  },
  {
    id: "chal-2",
    title: "Decentralized Micro-Grid Energy Trading",
    company: "GreenVolt Africa",
    description: "Build a smart contract system that allows rural villages with solar panels to trade excess energy securely with neighbors without a central utility.",
    requiredSkills: ["Solidity", "Blockchain", "Next.js"],
    reward: "$20,000 Bounties",
    deadline: "Jan 15, 2026",
    status: "Open"
  },
  {
    id: "chal-3",
    title: "Accessible UI for Visually Impaired Seniors",
    company: "SilverCare Tech",
    description: "Redesign our health-tracking mobile app's core interface to meet WCAG 2.2 AAA standards specifically for users over 70 with severe macular degeneration.",
    requiredSkills: ["UI/UX Design", "Accessibility", "Figma"],
    reward: "Paid Internship",
    deadline: "Oct 10, 2025",
    status: "Open"
  }
];

export const IMPACT_SHOWCASES: ImpactShowcase[] = [
  {
    id: "show-1",
    title: "AI-Powered Wildlife Poaching Prediction",
    solver: "Zille Kibriya", // To make it personal to the user's platform
    company: "Global Wildlife Fund",
    impactMetrics: "Poaching reduced by 42% in test reserves.",
    description: "Developed a predictive model using edge-computed acoustic sensors to identify and predict poaching paths before events occurred.",
    image: "/avatars/avatar_1.png"
  },
  {
    id: "show-2",
    title: "Low-Bandwidth Video Education Portal",
    solver: "Maria Sanchez",
    company: "EduForAll NGO",
    impactMetrics: "Reached 12,000+ students in low-connectivity areas.",
    description: "Engineered a custom video streaming protocol that aggressively compresses educational content without losing whiteboard legibility.",
    image: "/avatars/hr_2.png"
  }
];

export const USER_SKILL_PROOFS: SkillProof[] = [
  {
    id: "sp-1",
    skillName: "Machine Learning (Python)",
    proficiency: "Expert",
    verifiedBy: "Global Wildlife Fund (Innovation Challenge #42)",
    dateVerified: "August 12, 2025",
    verificationLink: "https://zillekibriya.in/verify/sp-1"
  },
  {
    id: "sp-2",
    skillName: "React / Next.js",
    proficiency: "Intermediate",
    verifiedBy: "ZilVerse Academy (Certificate #83492X)",
    dateVerified: "October 15, 2025",
    verificationLink: "https://zillekibriya.in/verify/sp-2"
  }
];
