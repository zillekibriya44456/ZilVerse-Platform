import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ZilVerse production-ready data...');

  // ─── FREELANCERS / USERS ────────────────────────────────────────────────────
  const seedUsers = [
    {
      email: 'alex@example.com', name: 'Alex Johnson', role: 'FREELANCER',
      avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=7c3aed&color=fff',
      bio: 'Senior React Developer with 10 years of experience building scalable applications.',
      profile: { title: 'Senior React Developer', hourlyRate: 65, skills: 'React, Node.js, TypeScript, GraphQL', bio: 'Building fast, accessible web apps.' }
    },
    {
      email: 'maria@example.com', name: 'Maria Garcia', role: 'FREELANCER',
      avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=ec4899&color=fff',
      bio: 'Award-winning UI/UX Designer crafting beautiful, conversion-focused interfaces.',
      profile: { title: 'UI/UX Designer', hourlyRate: 55, skills: 'Figma, Sketch, Prototyping, Design Systems', bio: 'Designing beautiful interfaces.' }
    },
    {
      email: 'david@example.com', name: 'David Smith', role: 'FREELANCER',
      avatar: 'https://ui-avatars.com/api/?name=David+Smith&background=06b6d4&color=fff',
      bio: 'Full Stack Engineer with deep DevOps & cloud architecture expertise.',
      profile: { title: 'Full Stack Engineer', hourlyRate: 80, skills: 'AWS, Python, React, Docker, Kubernetes', bio: 'Scalable cloud architectures.' }
    },
    {
      email: 'sarah@example.com', name: 'Sarah Chen', role: 'FREELANCER',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=10b981&color=fff',
      bio: 'Machine Learning Engineer specializing in NLP and computer vision models.',
      profile: { title: 'AI / ML Engineer', hourlyRate: 95, skills: 'Python, TensorFlow, PyTorch, NLP, OpenAI', bio: 'Building AI that changes the world.' }
    },
    {
      email: 'james@example.com', name: 'James Okafor', role: 'FREELANCER',
      avatar: 'https://ui-avatars.com/api/?name=James+Okafor&background=f59e0b&color=fff',
      bio: 'Mobile developer specializing in React Native & Flutter cross-platform apps.',
      profile: { title: 'Mobile App Developer', hourlyRate: 70, skills: 'React Native, Flutter, Firebase, Swift', bio: 'Building delightful mobile experiences.' }
    },
    {
      email: 'priya@example.com', name: 'Priya Sharma', role: 'FREELANCER',
      avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=a855f7&color=fff',
      bio: 'Blockchain developer with experience in Solidity, DeFi protocols, and NFT marketplaces.',
      profile: { title: 'Blockchain Developer', hourlyRate: 110, skills: 'Solidity, Ethereum, Web3.js, Hardhat, NFT', bio: 'Building the decentralized future.' }
    },
  ];

  const createdUsers = [];
  for (const u of seedUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        avatar: u.avatar,
        verified: true,
        bio: u.bio,
        freelancerProfile: {
          create: u.profile
        }
      }
    });
    createdUsers.push(user);
    console.log(`✅ User: ${u.name}`);
  }

  // ─── PROJECTS ────────────────────────────────────────────────────────────────
  const seedProjects = [
    { title: 'E-Commerce React Template', description: 'Production-ready Next.js e-commerce with Stripe, cart, auth & admin panel.', price: 49, sellerIdx: 0 },
    { title: 'SaaS Dashboard UI Kit', description: 'Comprehensive Figma + React component library for modern SaaS applications.', price: 29, sellerIdx: 1 },
    { title: 'AI Chatbot Integration', description: 'Drop-in GPT-4 chatbot with streaming, history, and custom system prompts.', price: 199, sellerIdx: 2 },
    { title: 'Mobile App Wireframe Pack', description: '50+ screen wireframes for iOS/Android apps in Figma format.', price: 39, sellerIdx: 1 },
    { title: 'Node.js REST API Boilerplate', description: 'Production-ready Express API with auth, rate limiting, Prisma & Docker.', price: 59, sellerIdx: 2 },
    { title: 'ML Sentiment Analyzer', description: 'Pre-trained BERT model for real-time customer sentiment analysis.', price: 299, sellerIdx: 3 },
    { title: 'React Native Starter Kit', description: 'Full-featured expo app boilerplate with navigation, theming & auth.', price: 79, sellerIdx: 4 },
    { title: 'NFT Minting Contract', description: 'Audited ERC-721 smart contract with royalties and batch minting.', price: 399, sellerIdx: 5 },
  ];

  for (const p of seedProjects) {
    const existing = await prisma.project.findFirst({ where: { title: p.title } });
    if (!existing) {
      await prisma.project.create({
        data: {
          title: p.title,
          description: p.description,
          price: p.price,
          sellerId: createdUsers[p.sellerIdx]!.id
        }
      });
      console.log(`✅ Project: ${p.title}`);
    }
  }

  // ─── DIGITAL SERVICES ────────────────────────────────────────────────────────
  const seedServices = [
    { title: 'Full Stack Web Development', description: 'I will build a complete web app using Next.js, TypeScript, and PostgreSQL.', price: 500, category: 'Web Dev', rating: 5.0, sales: 18, sellerIdx: 2 },
    { title: 'UI/UX App Redesign', description: 'Complete overhaul of your mobile or web app UI with modern design principles.', price: 300, category: 'Design', rating: 4.9, sales: 31, sellerIdx: 1 },
    { title: 'AI Model Fine-tuning', description: 'Fine-tune GPT or open-source LLMs on your custom dataset for business use cases.', price: 850, category: 'AI & ML', rating: 5.0, sales: 7, sellerIdx: 3 },
    { title: 'Mobile App from Scratch', description: 'Cross-platform React Native app with auth, push notifications, and analytics.', price: 1200, category: 'Mobile', rating: 4.8, sales: 12, sellerIdx: 4 },
    { title: 'Smart Contract Audit', description: 'Security audit of your Solidity contract with vulnerability report and fixes.', price: 600, category: 'Blockchain', rating: 5.0, sales: 5, sellerIdx: 5 },
    { title: 'SEO & Performance Optimization', description: 'Improve your Next.js app Lighthouse score to 95+. Core Web Vitals focused.', price: 200, category: 'SEO', rating: 4.7, sales: 42, sellerIdx: 0 },
  ];

  for (const s of seedServices) {
    const existing = await prisma.digitalService.findFirst({ where: { title: s.title } });
    if (!existing) {
      await prisma.digitalService.create({
        data: {
          title: s.title,
          description: s.description,
          price: s.price,
          category: s.category,
          rating: s.rating,
          sales: s.sales,
          sellerId: createdUsers[s.sellerIdx]!.id
        }
      });
      console.log(`✅ Service: ${s.title}`);
    }
  }

  // ─── JOBS ────────────────────────────────────────────────────────────────────
  const seedJobs = [
    { title: 'Senior Frontend Engineer', company: 'TechGlobal Inc.', location: 'Remote', type: 'Full-Time', salary: '$120k–$150k', description: 'Build world-class React applications for 5M+ users.', requirements: 'React, TypeScript, GraphQL, Testing', sellerIdx: 2 },
    { title: 'ML Engineer – NLP', company: 'DataMind AI', location: 'San Francisco, CA', type: 'Full-Time', salary: '$140k–$180k', description: 'Build language models for enterprise clients.', requirements: 'Python, PyTorch, Transformers, CUDA', sellerIdx: 3 },
    { title: 'UI/UX Design Lead', company: 'PixelCraft Studio', location: 'Remote', type: 'Freelance', salary: '$60–$80/hr', description: 'Lead design for SaaS product redesign.', requirements: 'Figma, Design Systems, User Research', sellerIdx: 1 },
    { title: 'React Native Developer', company: 'AppBridge', location: 'Remote', type: 'Full-Time', salary: '$90k–$120k', description: 'Ship iOS and Android apps for fintech clients.', requirements: 'React Native, Expo, Firebase, Redux', sellerIdx: 4 },
    { title: 'Blockchain Smart Contract Dev', company: 'DeFi Protocol Labs', location: 'Remote', type: 'Freelance', salary: '$100–$150/hr', description: 'Write and audit Solidity contracts for DeFi protocols.', requirements: 'Solidity, Hardhat, Ethers.js, OpenZeppelin', sellerIdx: 5 },
    { title: 'DevOps Engineer – AWS', company: 'CloudScale Corp', location: 'Remote', type: 'Full-Time', salary: '$130k–$160k', description: 'Design and operate cloud infrastructure for global SaaS.', requirements: 'AWS, Terraform, Docker, Kubernetes, CI/CD', sellerIdx: 2 },
    { title: 'Frontend Intern – React', company: 'ZilVerse', location: 'Remote', type: 'Internship', salary: '$25/hr', description: 'Build features for the ZilVerse platform alongside senior engineers.', requirements: 'React, HTML, CSS, Git', sellerIdx: 0 },
  ];

  for (const j of seedJobs) {
    const existing = await prisma.job.findFirst({ where: { title: j.title, company: j.company } });
    if (!existing) {
      await prisma.job.create({
        data: {
          title: j.title,
          company: j.company,
          location: j.location,
          type: j.type,
          salary: j.salary,
          description: j.description,
          requirements: j.requirements,
          employerId: createdUsers[j.sellerIdx]!.id
        }
      });
      console.log(`✅ Job: ${j.title} @ ${j.company}`);
    }
  }

  // ─── DISCUSSIONS ─────────────────────────────────────────────────────────────
  const seedDiscussions = [
    { title: 'Best architecture for a global chat app?', content: 'Should I use WebSockets with Redis Pub/Sub, or something like Socket.io? My app targets 100k concurrent users.', category: 'System Design', authorIdx: 2 },
    { title: 'React vs Next.js for a complex dashboard?', content: 'Building a B2B analytics dashboard. Is Next.js overkill if I don\'t need SSR/SEO on the main views?', category: 'Frontend', authorIdx: 0 },
    { title: 'Supabase vs Firebase in 2026', content: 'PostgreSQL is amazing, but Firebase\'s realtime DB is incredibly easy. Anyone migrated from Firebase to Supabase?', category: 'Backend', authorIdx: 3 },
    { title: 'How to structure a monorepo for a full-stack TypeScript project?', content: 'I want to share types between frontend (Next.js) and backend (Express). Turborepo vs Nx vs plain workspaces?', category: 'Architecture', authorIdx: 2 },
  ];

  for (const d of seedDiscussions) {
    const existing = await prisma.discussionPost.findFirst({ where: { title: d.title } });
    if (!existing) {
      await prisma.discussionPost.create({
        data: {
          title: d.title,
          content: d.content,
          category: d.category,
          upvotes: Math.floor(Math.random() * 80) + 5,
          authorId: createdUsers[d.authorIdx]!.id
        }
      });
      console.log(`✅ Discussion: ${d.title}`);
    }
  }

  // ─── EXCHANGE LISTINGS ───────────────────────────────────────────────────────
  const seedExchanges = [
    { title: 'React Development', description: 'UI/UX Design in Figma', price: 0, assetType: 'Skill Exchange', sellerIdx: 0 },
    { title: 'Python & ML Modeling', description: 'Mobile app development in React Native', price: 0, assetType: 'Skill Exchange', sellerIdx: 3 },
    { title: 'Smart Contract Development', description: 'Landing page design & copywriting', price: 0, assetType: 'Skill Exchange', sellerIdx: 5 },
  ];

  for (const e of seedExchanges) {
    const existing = await prisma.exchangeListing.findFirst({ where: { title: e.title, sellerId: createdUsers[e.sellerIdx]!.id } });
    if (!existing) {
      await prisma.exchangeListing.create({
        data: {
          title: e.title,
          description: e.description,
          price: e.price,
          assetType: e.assetType,
          sellerId: createdUsers[e.sellerIdx]!.id
        }
      });
      console.log(`✅ Exchange: ${e.title}`);
    }
  }

  // ─── EVENTS ──────────────────────────────────────────────────────────────────
  const seedEvents = [
    { title: 'ZilVerse Global Hackathon 2026', type: 'Hackathon', date: 'July 20-22, 2026', location: 'Online (Worldwide)', description: '48-hour build-a-thon with $50,000 in prizes. Categories: AI, Web3, Open Source, EdTech.' },
    { title: 'React Advanced Conference 2026', type: 'Conference', date: 'August 5, 2026', location: 'London, UK', description: 'Deep dives into React Server Components, concurrent features, and modern patterns.' },
    { title: 'AI & ML Summit Asia', type: 'Conference', date: 'September 12, 2026', location: 'Singapore', description: 'The largest AI conference in Southeast Asia. Keynotes from OpenAI, Google DeepMind, and Anthropic.' },
    { title: 'Open Source Weekend Sprint', type: 'Hackathon', date: 'July 5-6, 2026', location: 'Online (Worldwide)', description: 'Contribute to top open source projects. Mentors from major OSS maintainers available.' },
    { title: 'Web3 Builders Meetup — Dubai', type: 'Meetup', date: 'July 15, 2026', location: 'Dubai, UAE', description: 'Network with DeFi founders, blockchain devs, and Web3 investors in Dubai Tech Hub.' },
    { title: 'Full Stack Fundamentals Workshop', type: 'Workshop', date: 'July 28, 2026', location: 'Online (Worldwide)', description: 'Hands-on 6-hour workshop: Next.js, Prisma, Postgres, and deployment on Vercel.' },
    { title: 'UI/UX Design Sprint Challenge', type: 'Hackathon', date: 'August 18-19, 2026', location: 'Online (Worldwide)', description: 'Design a complete product experience in 24 hours. Judged by Figma and IDEO mentors.' },
    { title: 'Cybersecurity & DevSecOps Summit', type: 'Conference', date: 'September 25, 2026', location: 'Bengaluru, India', description: 'Threat modeling, zero trust architecture, and secure CI/CD pipeline workshops.' },
  ];

  for (const ev of seedEvents) {
    const existing = await prisma.event.findFirst({ where: { title: ev.title } });
    if (!existing) {
      await prisma.event.create({
        data: {
          title: ev.title,
          type: ev.type,
          date: ev.date,
          location: ev.location,
          description: ev.description,
        }
      });
      console.log(`✅ Event: ${ev.title}`);
    }
  }

  // ─── ACADEMY COURSES ─────────────────────────────────────────────────────────
  const seedCourses = [
    { title: 'Next.js 15 — The Complete Guide', instructor: 'Alex Johnson', level: 'Intermediate', duration: '14 Hours', category: 'Development', students: 8420, rating: 4.9, price: 0, language: 'English', countryCode: 'US', image: 'https://placehold.co/400x225/7c3aed/ffffff?text=Next.js+15' },
    { title: 'Machine Learning with Python & PyTorch', instructor: 'Sarah Chen', level: 'Advanced', duration: '22 Hours', category: 'AI & ML', students: 5130, rating: 4.8, price: 49, language: 'English', countryCode: 'US', image: 'https://placehold.co/400x225/10b981/ffffff?text=ML+Python' },
    { title: 'Figma UI Design Masterclass 2026', instructor: 'Maria Garcia', level: 'Beginner', duration: '9 Hours', category: 'Design', students: 12340, rating: 5.0, price: 0, language: 'English', countryCode: 'US', image: 'https://placehold.co/400x225/ec4899/ffffff?text=Figma+Design' },
    { title: 'Solidity & Smart Contract Development', instructor: 'Priya Sharma', level: 'Intermediate', duration: '11 Hours', category: 'Blockchain', students: 3280, rating: 4.7, price: 79, language: 'English', countryCode: 'US', image: 'https://placehold.co/400x225/f59e0b/ffffff?text=Solidity' },
    { title: 'React Native: Build iOS & Android Apps', instructor: 'James Okafor', level: 'Intermediate', duration: '18 Hours', category: 'Mobile', students: 6750, rating: 4.9, price: 59, language: 'English', countryCode: 'US', image: 'https://placehold.co/400x225/06b6d4/ffffff?text=React+Native' },
    { title: 'AWS Solutions Architect — Full Course', instructor: 'David Smith', level: 'Advanced', duration: '26 Hours', category: 'Cloud & DevOps', students: 4100, rating: 4.8, price: 99, language: 'English', countryCode: 'US', image: 'https://placehold.co/400x225/3b82f6/ffffff?text=AWS+Architect' },
    { title: 'Freelancing Masterclass: Zero to $10k/Month', instructor: 'Alex Johnson', level: 'Beginner', duration: '5 Hours', category: 'Business', students: 21000, rating: 5.0, price: 0, language: 'English', countryCode: 'US', image: 'https://placehold.co/400x225/22c55e/ffffff?text=Freelancing' },
    { title: 'TypeScript Deep Dive for React Developers', instructor: 'David Smith', level: 'Intermediate', duration: '8 Hours', category: 'Development', students: 7890, rating: 4.9, price: 29, language: 'English', countryCode: 'US', image: 'https://placehold.co/400x225/a855f7/ffffff?text=TypeScript' },
  ];

  for (const course of seedCourses) {
    const existing = await prisma.academyCourse.findFirst({ where: { title: course.title } });
    if (!existing) {
      await prisma.academyCourse.create({ data: course });
      console.log(`✅ Course: ${course.title}`);
    }
  }

  console.log('\n🎉 ZilVerse seed complete! Platform is ready for demo.');
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
