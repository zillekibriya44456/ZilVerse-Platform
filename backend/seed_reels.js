const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!admin) {
    console.log("No users found to attach reels to.");
    return;
  }
  
  await prisma.reel.createMany({
    data: [
      {
        creatorId: admin.id,
        title: "How I Built My First SaaS in 48hrs",
        description: "Step-by-step walkthrough of building ZilVerse from scratch.",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        category: "Startups",
        tags: "NextJS,SaaS,BuildInPublic",
        views: 14200,
        likes: 1200,
        comments: 430,
        shares: 880
      },
      {
        creatorId: admin.id,
        title: "How does a blockchain actually work?",
        description: "Quick visual explainer on how distributed consensus works.",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        category: "Technology",
        tags: "Blockchain,Web3,Explainer",
        views: 9800,
        likes: 900,
        comments: 112,
        shares: 54
      },
      {
        creatorId: admin.id,
        title: "24hr AI Challenge: Build a GPT wrapper",
        description: "The challenge: build a working, deployed AI-powered tool in 24 hours.",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        category: "AI",
        tags: "AIChallenge,BuildFast,GPT",
        views: 21000,
        likes: 2100,
        comments: 87,
        shares: 140
      }
    ]
  });
  console.log("Database seeded successfully with test reels!");
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
