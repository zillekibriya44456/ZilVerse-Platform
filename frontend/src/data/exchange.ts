export interface SkillTrade {
  id: string;
  userName: string;
  userCountry: string;
  userFlag: string;
  offering: string;
  seeking: string;
  image: string;
}

export interface ImpactProject {
  id: string;
  title: string;
  description: string;
  region: string;
  organizer: string;
  participants: number;
  tags: string[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedDate: string;
}

export const SKILL_TRADES: SkillTrade[] = [
  {
    id: "st-1",
    userName: "Kenji",
    userCountry: "Japan",
    userFlag: "🇯🇵",
    offering: "Traditional Japanese Woodworking (Sashimono)",
    seeking: "Advanced Python Architecture",
    image: "/avatars/avatar_1.png",
  },
  {
    id: "st-2",
    userName: "Elena",
    userCountry: "Italy",
    userFlag: "🇮🇹",
    offering: "Authentic Culinary Arts & Pasta Making",
    seeking: "UI/UX Design Mentorship",
    image: "/avatars/avatar_2.png",
  },
  {
    id: "st-3",
    userName: "Amadi",
    userCountry: "Kenya",
    userFlag: "🇰🇪",
    offering: "Conversational Swahili & Cultural History",
    seeking: "React Native Mobile Development",
    image: "/creators/creator_1.png",
  },
  {
    id: "st-4",
    userName: "Raj",
    userCountry: "India",
    userFlag: "🇮🇳",
    offering: "Classical Sitar & Indian Music Theory",
    seeking: "Machine Learning Concepts",
    image: "/creators/creator_2.png",
  },
  {
    id: "st-5",
    userName: "Maria",
    userCountry: "Mexico",
    userFlag: "🇲🇽",
    offering: "Oaxacan Weaving Techniques",
    seeking: "Digital Marketing & SEO",
    image: "/creators/creator_3.png",
  },
];

export const IMPACT_PROJECTS: ImpactProject[] = [
  {
    id: "ip-1",
    title: "Clean Water Monitoring Dashboard",
    description: "Building an open-source IoT dashboard to monitor well water quality in rural African communities. Seeking React and Node.js developers.",
    region: "Sub-Saharan Africa",
    organizer: "WaterTech Global",
    participants: 142,
    tags: ["Open Source", "Environment", "IoT"],
  },
  {
    id: "ip-2",
    title: "Accessible Education Portal",
    description: "Creating a completely free, multi-lingual learning platform for displaced children. We need translators, UI designers, and frontend devs.",
    region: "Global",
    organizer: "EduForAll NGO",
    participants: 89,
    tags: ["Education", "Social Impact", "React"],
  },
  {
    id: "ip-3",
    title: "Urban Reforestation Mapping",
    description: "A data-mapping project tracking areas in major cities that need massive tree planting to reduce carbon footprints.",
    region: "Europe & Americas",
    organizer: "Green Earth Initiative",
    participants: 215,
    tags: ["Data Science", "Environment", "Mapping"],
  },
];

export const MOCK_USER_BADGES: Badge[] = [
  {
    id: "b-1",
    name: "Cultural Ambassador",
    icon: "🌍",
    description: "Awarded for teaching 5+ international students a unique regional skill.",
    earnedDate: "Nov 12, 2025"
  },
  {
    id: "b-2",
    name: "Impact Leader",
    icon: "🌱",
    description: "Contributed over 100 hours to Global Impact Projects.",
    earnedDate: "Jan 04, 2026"
  },
  {
    id: "b-3",
    name: "Top Global Mentor",
    icon: "🤝",
    description: "Maintained a 5-star rating in the Skills Exchange over 20 sessions.",
    earnedDate: "Mar 22, 2026"
  }
];
