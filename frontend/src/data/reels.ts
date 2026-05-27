export type ReelCategory =
  | "For You"
  | "Q&A"
  | "Collaboration"
  | "Challenges"
  | "Success Stories"
  | "Resources";

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
}

export const REEL_CATEGORIES: ReelCategory[] = [
  "For You",
  "Q&A",
  "Collaboration",
  "Challenges",
  "Success Stories",
  "Resources",
];

export const MOCK_REELS: Reel[] = [
  {
    id: "r-1",
    creator: "Zille Kibriya",
    handle: "@zillekibriya",
    avatar: "/avatars/avatar_1.png",
    title: "How I Built My First SaaS in 48hrs",
    description: "Step-by-step walkthrough of building ZilVerse from scratch using Next.js and PostgreSQL during a weekend sprint 🚀",
    category: "Success Stories",
    tags: ["#NextJS", "#SaaS", "#BuildInPublic"],
    likes: 14200,
    comments: 430,
    shares: 880,
    gradient: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    icon: "🚀",
  },
  {
    id: "r-2",
    creator: "Aisha Patel",
    handle: "@aishacodes",
    avatar: "/creators/creator_1.png",
    title: "How does a blockchain actually work?",
    description: "Quick visual explainer on how distributed consensus works with zero jargon. Drop your blockchain questions below! 💬",
    category: "Q&A",
    tags: ["#Blockchain", "#Web3", "#Explainer"],
    likes: 9800,
    comments: 1120,
    shares: 540,
    gradient: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
    icon: "⛓️",
  },
  {
    id: "r-3",
    creator: "Dev Collab India",
    handle: "@devcollabIN",
    avatar: "/creators/creator_2.png",
    title: "Looking for a React + IoT partner!",
    description: "I have a working sensor prototype. Need a frontend developer to build the live monitoring dashboard. Let's build together! 🤝",
    category: "Collaboration",
    tags: ["#IoT", "#React", "#OpenSource"],
    likes: 3200,
    comments: 220,
    shares: 490,
    gradient: "linear-gradient(135deg, #0a3d62, #079992, #006266)",
    icon: "🤝",
  },
  {
    id: "r-4",
    creator: "Kenji Tanaka",
    handle: "@kenjibuildss",
    avatar: "/avatars/hr_1.png",
    title: "24hr AI Challenge: Build a GPT wrapper",
    description: "The challenge: build a working, deployed AI-powered tool in 24 hours. Here's my result — and yours can be featured next! 🏆",
    category: "Challenges",
    tags: ["#AIChallenge", "#BuildFast", "#GPT"],
    likes: 21000,
    comments: 870,
    shares: 1400,
    gradient: "linear-gradient(135deg, #2d1b69, #6a3093, #a044ff)",
    icon: "⚡",
  },
  {
    id: "r-5",
    creator: "Maria Sanchez",
    handle: "@mariauxd",
    avatar: "/creators/creator_3.png",
    title: "Free Figma UI Kit: 200+ Components",
    description: "Sharing my entire glass-morphism component library completely FREE. Link in bio. No strings attached! 🎨",
    category: "Resources",
    tags: ["#Figma", "#UIKit", "#FreeResource"],
    likes: 31500,
    comments: 940,
    shares: 5200,
    gradient: "linear-gradient(135deg, #ad5389, #3c1053)",
    icon: "🎨",
  },
  {
    id: "r-6",
    creator: "Amadi Osei",
    handle: "@amaditech",
    avatar: "/avatars/avatar_2.png",
    title: "How I landed 3 international clients as a freelancer",
    description: "From zero to $5k/month freelancing. The exact strategy, tools, and platforms I used — no gatekeeping. 💰",
    category: "Success Stories",
    tags: ["#Freelancing", "#RemoteWork", "#Success"],
    likes: 18900,
    comments: 660,
    shares: 2100,
    gradient: "linear-gradient(135deg, #134e5e, #71b280)",
    icon: "💰",
  },
  {
    id: "r-7",
    creator: "Elena Rostova",
    handle: "@elena_ml",
    avatar: "/avatars/hr_2.png",
    title: "Python tip that saved me 200 lines of code",
    description: "One single Python trick using generators that completely eliminated my memory overflow issue. Watch till the end! 🐍",
    category: "Q&A",
    tags: ["#Python", "#CodeTip", "#MachineLearning"],
    likes: 27400,
    comments: 1200,
    shares: 3300,
    gradient: "linear-gradient(135deg, #1e3c72, #2a5298)",
    icon: "🐍",
  },
];
