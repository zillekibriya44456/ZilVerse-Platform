export type ReelCategory =
  | "For You"
  | "Technology"
  | "AI"
  | "Programming"
  | "Freelancing"
  | "Startups"
  | "Innovation"
  | "Education"
  | "Design"
  | "Cybersecurity"
  | "Career Growth"
  | "Research"
  | "Trending";

export interface Reel {
  id: string;
  creator: string;
  handle: string;
  avatar: string;
  title: string;
  description: string;
  category: ReelCategory;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  gradient: string; // bg gradient color since we use mock video placeholders
  icon: string;     // big icon to represent the reel content
  videoUrl?: string;
}

export const REEL_CATEGORIES: ReelCategory[] = [
  "For You",
  "Technology",
  "AI",
  "Programming",
  "Freelancing",
  "Startups",
  "Innovation",
  "Education",
  "Design",
  "Cybersecurity",
  "Career Growth",
  "Research"
];

export const MOCK_REELS: Reel[] = [
  {
    id: "m-1",
    creator: "Zille Kibriya",
    handle: "@zillekibriya",
    avatar: "/avatars/avatar_1.png",
    title: "How I Built My First SaaS in 48hrs",
    description: "Step-by-step walkthrough of building ZilVerse from scratch using Next.js and PostgreSQL during a weekend sprint 🚀",
    category: "Startups",
    tags: ["#NextJS", "#SaaS", "#BuildInPublic"],
    likes: 14200,
    comments: 430,
    shares: 880,
    gradient: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    icon: "🚀",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
  {
    id: "m-2",
    creator: "Aisha Patel",
    handle: "@aishacodes",
    avatar: "/creators/creator_1.png",
    title: "How does a blockchain actually work?",
    description: "Quick visual explainer on how distributed consensus works with zero jargon. Drop your blockchain questions below! 💬",
    category: "Technology",
    tags: ["#Blockchain", "#Web3", "#Explainer"],
    likes: 9800,
    comments: 1120,
    shares: 540,
    gradient: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
    icon: "⛓️",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  },
  {
    id: "m-3",
    creator: "Kenji Tanaka",
    handle: "@kenjibuildss",
    avatar: "/avatars/hr_1.png",
    title: "24hr AI Challenge: Build a GPT wrapper",
    description: "The challenge: build a working, deployed AI-powered tool in 24 hours. Here's my result — and yours can be featured next! 🏆",
    category: "AI",
    tags: ["#AIChallenge", "#BuildFast", "#GPT"],
    likes: 21000,
    comments: 870,
    shares: 1400,
    gradient: "linear-gradient(135deg, #2d1b69, #6a3093, #a044ff)",
    icon: "⚡",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  },
  {
    id: "m-4",
    creator: "Amadi Osei",
    handle: "@amaditech",
    avatar: "/avatars/avatar_2.png",
    title: "How I landed 3 international clients as a freelancer",
    description: "From zero to $5k/month freelancing. The exact strategy, tools, and platforms I used — no gatekeeping. 💰",
    category: "Freelancing",
    tags: ["#Freelancing", "#RemoteWork", "#Success"],
    likes: 18900,
    comments: 660,
    shares: 2100,
    gradient: "linear-gradient(135deg, #134e5e, #71b280)",
    icon: "💰",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  },
];
