export interface MicroGrant {
  id: string;
  startupName: string;
  title: string;
  description: string;
  sustainabilityScore: "A+" | "A" | "B" | "C";
  fundingGoal: number;
  currentFunding: number;
  upvotes: number;
  category: string;
}

export interface ProgressMilestone {
  id: string;
  startupName: string;
  projectTitle: string;
  status: "On Track" | "At Risk" | "Completed";
  lastUpdate: string;
  milestoneDesc: string;
  progressPercent: number;
}

export interface Mentor {
  id: string;
  name: string;
  expertise: string[];
  company: string;
  availability: "High" | "Medium" | "Low";
  image: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  author: string;
  date: string;
  type: "Research Paper" | "Summit Announcement" | "Impact Report";
  excerpt: string;
}

export const MOCK_GRANTS: MicroGrant[] = [
  {
    id: "g-1",
    startupName: "OceanClean AI",
    title: "Autonomous Micro-Plastic Collection Drones",
    description: "Developing solar-powered aquatic drones that use computer vision to identify and collect micro-plastics in coastal regions.",
    sustainabilityScore: "A+",
    fundingGoal: 50000,
    currentFunding: 34500,
    upvotes: 1240,
    category: "Environment"
  },
  {
    id: "g-2",
    startupName: "EduBlock",
    title: "Decentralized Immutable Academic Records",
    description: "A blockchain protocol enabling refugees and displaced students to securely store and transport their academic credentials globally.",
    sustainabilityScore: "A",
    fundingGoal: 25000,
    currentFunding: 25000,
    upvotes: 890,
    category: "Social Impact"
  },
  {
    id: "g-3",
    startupName: "AgriSense",
    title: "Low-Cost Soil Moisture IoT Sensors",
    description: "Manufacturing sub-$5 IoT sensors to help small-holder farmers optimize water usage during droughts.",
    sustainabilityScore: "B",
    fundingGoal: 15000,
    currentFunding: 4200,
    upvotes: 430,
    category: "Agriculture"
  }
];

export const MOCK_PROGRESS: ProgressMilestone[] = [
  {
    id: "p-1",
    startupName: "EduBlock",
    projectTitle: "Decentralized Immutable Academic Records",
    status: "Completed",
    lastUpdate: "Oct 12, 2025",
    milestoneDesc: "Successfully launched the TestNet and onboarded 3 NGO partners.",
    progressPercent: 100
  },
  {
    id: "p-2",
    startupName: "OceanClean AI",
    projectTitle: "Autonomous Micro-Plastic Collection Drones",
    status: "On Track",
    lastUpdate: "Nov 05, 2025",
    milestoneDesc: "Completed hull design and waterproof testing for the camera housing.",
    progressPercent: 65
  }
];

export const MOCK_MENTORS: Mentor[] = [
  {
    id: "m-1",
    name: "Dr. Sarah Jenkins",
    expertise: ["AI/ML", "Climate Tech", "Grant Writing"],
    company: "EarthScale Labs",
    availability: "Medium",
    image: "/avatars/hr_1.png"
  },
  {
    id: "m-2",
    name: "David Chen",
    expertise: ["Blockchain Architecture", "FinTech", "Startups"],
    company: "BlockVentures",
    availability: "High",
    image: "/avatars/avatar_1.png"
  },
  {
    id: "m-3",
    name: "Aisha Patel",
    expertise: ["Hardware Supply Chain", "IoT", "Sustainable Manufacturing"],
    company: "Global Hardware Co.",
    availability: "Low",
    image: "/creators/creator_1.png"
  }
];

export const MOCK_JOURNAL: JournalEntry[] = [
  {
    id: "j-1",
    title: "Global Innovation Summit 2026 Announced",
    author: "ZilVerse Foundation",
    date: "Dec 01, 2025",
    type: "Summit Announcement",
    excerpt: "Join us in Geneva this summer as the world's top innovators present their funded projects to global leaders."
  },
  {
    id: "j-2",
    title: "The Impact of Edge AI on Rural Agriculture",
    author: "Dr. Elena Rostova",
    date: "Nov 18, 2025",
    type: "Research Paper",
    excerpt: "Analyzing the 30% yield increase across 50 farms utilizing sub-$10 edge computing nodes for irrigation management."
  },
  {
    id: "j-3",
    title: "Q3 Sustainability Impact Report",
    author: "ZilVerse Impact Team",
    date: "Oct 30, 2025",
    type: "Impact Report",
    excerpt: "Our tokenized micro-grants have successfully funded 14 projects, resulting in a net reduction of 12,000 tons of CO2."
  }
];
