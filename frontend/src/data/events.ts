export type EventType = "Hackathon" | "Conference" | "Meetup" | "Workshop";
export type EventCategory = "AI & ML" | "Web3" | "Design" | "Full Stack" | "Open Source" | "Cybersecurity";

export interface GlobalEvent {
  id: string;
  title: string;
  organizer: string;
  date: string;
  location: string; // E.g., "San Francisco, US", "Tokyo, JP", or "Online"
  countryCode: string; // Use 'WW' for online global events
  type: EventType;
  category: EventCategory;
  participantsCount: number;
  image: string;
  description: string;
  isFree: boolean;
}

export const MOCK_EVENTS: GlobalEvent[] = [
  {
    id: "evt-1",
    title: "Global Web3 Hackathon 2026",
    organizer: "ZilVerse Devs",
    date: "June 15-17, 2026",
    location: "Online",
    countryCode: "WW",
    type: "Hackathon",
    category: "Web3",
    participantsCount: 4500,
    image: "/avatars/hr_1.png",
    description: "Join 4,500+ developers building the future of decentralized applications over a 48-hour sprint.",
    isFree: true,
  },
  {
    id: "evt-2",
    title: "AI & Future Tech Conference",
    organizer: "Tech Innovators Assoc.",
    date: "July 22, 2026",
    location: "Tokyo, Japan",
    countryCode: "JP",
    type: "Conference",
    category: "AI & ML",
    participantsCount: 1200,
    image: "/avatars/avatar_1.png",
    description: "A premium gathering of the world's leading minds in Artificial Intelligence and Machine Learning.",
    isFree: false,
  },
  {
    id: "evt-3",
    title: "Open Source Contributor Meetup",
    organizer: "OS Foundation",
    date: "May 10, 2026",
    location: "Berlin, Germany",
    countryCode: "DE",
    type: "Meetup",
    category: "Open Source",
    participantsCount: 350,
    image: "/creators/creator_1.png",
    description: "A casual meetup for open-source maintainers and contributors to share ideas and collaborate.",
    isFree: true,
  },
  {
    id: "evt-4",
    title: "Next.js Full Stack Workshop",
    organizer: "React Masters",
    date: "August 05, 2026",
    location: "Online",
    countryCode: "WW",
    type: "Workshop",
    category: "Full Stack",
    participantsCount: 850,
    image: "/creators/creator_2.png",
    description: "An intensive 8-hour workshop covering everything from routing to server actions in Next.js.",
    isFree: false,
  },
  {
    id: "evt-5",
    title: "DefCon Asia: Cybersecurity Sprint",
    organizer: "SecNet Global",
    date: "September 12-14, 2026",
    location: "Singapore",
    countryCode: "SG",
    type: "Hackathon",
    category: "Cybersecurity",
    participantsCount: 2200,
    image: "/avatars/avatar_2.png",
    description: "A thrilling capture-the-flag hackathon focusing on penetrating modern cloud infrastructures.",
    isFree: true,
  },
  {
    id: "evt-6",
    title: "UX/UI Design Summit",
    organizer: "Creative Collective",
    date: "October 01, 2026",
    location: "London, UK",
    countryCode: "GB",
    type: "Conference",
    category: "Design",
    participantsCount: 900,
    image: "/avatars/hr_2.png",
    description: "Explore the bleeding edge of user experience design, glassmorphism, and accessible interfaces.",
    isFree: false,
  },
  {
    id: "evt-7",
    title: "MERN Stack Builders Meetup",
    organizer: "Dev India",
    date: "November 20, 2026",
    location: "Bengaluru, India",
    countryCode: "IN",
    type: "Meetup",
    category: "Full Stack",
    participantsCount: 500,
    image: "/creators/creator_3.png",
    description: "Networking and lightning talks for developers working primarily in the MongoDB, Express, React, and Node stack.",
    isFree: true,
  }
];
