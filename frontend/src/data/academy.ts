export interface Course {
  id: string;
  title: string;
  instructor: string;
  countryCode: string; // The country this is "local" to, e.g., 'IN'
  language: string;
  price: number; // in local currency ideally, but we'll use a base value (e.g. INR equivalent) to work with PaymentModal
  students: number;
  rating: number;
  image: string;
  category: "Development" | "Design" | "Business" | "AI";
}

// Simulated database of courses across the world
export const ACADEMY_COURSES: Course[] = [
  // India
  {
    id: "c-in-1",
    title: "Full Stack Web Development (MERN)",
    instructor: "Rahul Sharma",
    countryCode: "IN",
    language: "Hindi",
    price: 4999,
    students: 12500,
    rating: 4.8,
    image: "/avatars/avatar_1.png",
    category: "Development",
  },
  {
    id: "c-in-2",
    title: "UI/UX Design Masterclass",
    instructor: "Priya Patel",
    countryCode: "IN",
    language: "English / Hindi",
    price: 2999,
    students: 8400,
    rating: 4.9,
    image: "/avatars/avatar_2.png",
    category: "Design",
  },
  
  // USA
  {
    id: "c-us-1",
    title: "Advanced React & Next.js Patterns",
    instructor: "Sarah Jenkins",
    countryCode: "US",
    language: "English",
    price: 8500, // INR equivalent for PaymentModal simplicity
    students: 22000,
    rating: 4.9,
    image: "/avatars/hr_1.png",
    category: "Development",
  },
  {
    id: "c-us-2",
    title: "AI App Development with OpenAI",
    instructor: "David Lee",
    countryCode: "US",
    language: "English",
    price: 12000,
    students: 15300,
    rating: 4.7,
    image: "/avatars/hr_2.png",
    category: "AI",
  },

  // UK
  {
    id: "c-gb-1",
    title: "Digital Marketing & SEO Bootcamp",
    instructor: "Emma Watson",
    countryCode: "GB",
    language: "English",
    price: 6500,
    students: 5200,
    rating: 4.6,
    image: "/creators/creator_2.png",
    category: "Business",
  },

  // Japan
  {
    id: "c-jp-1",
    title: "Machine Learning with Python",
    instructor: "Yuki Tanaka",
    countryCode: "JP",
    language: "Japanese",
    price: 11000,
    students: 9800,
    rating: 4.8,
    image: "/avatars/avatar_1.png",
    category: "AI",
  },

  // UAE
  {
    id: "c-ae-1",
    title: "Blockchain & Smart Contracts",
    instructor: "Omar Al Farsi",
    countryCode: "AE",
    language: "Arabic / English",
    price: 15000,
    students: 3100,
    rating: 4.7,
    image: "/avatars/hr_2.png",
    category: "Development",
  },

  // Brazil
  {
    id: "c-br-1",
    title: "Mobile App Dev with Flutter",
    instructor: "Lucas Silva",
    countryCode: "BR",
    language: "Portuguese",
    price: 4500,
    students: 11200,
    rating: 4.9,
    image: "/creators/creator_1.png",
    category: "Development",
  },

  // Nigeria
  {
    id: "c-ng-1",
    title: "Cybersecurity Essentials",
    instructor: "David Ojo",
    countryCode: "NG",
    language: "English",
    price: 3200,
    students: 6500,
    rating: 4.5,
    image: "/creators/creator_3.png",
    category: "Development",
  },
  
  // Germany
  {
    id: "c-de-1",
    title: "Advanced Data Science",
    instructor: "Klaus Müller",
    countryCode: "DE",
    language: "German",
    price: 9500,
    students: 7800,
    rating: 4.8,
    image: "/avatars/avatar_2.png",
    category: "AI",
  }
];

export function getLocalCourses(countryCode: string): Course[] {
  // If the user's country has local courses, return them.
  const local = ACADEMY_COURSES.filter(c => c.countryCode === countryCode);
  if (local.length > 0) return local;
  
  // Fallback to globally popular courses (e.g. US/India)
  return ACADEMY_COURSES.slice(0, 4);
}
