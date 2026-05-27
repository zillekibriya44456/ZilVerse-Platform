<div align="center">
  <h1>ZilVerse</h1>
  <p><strong>The Global Digital Ecosystem & Innovation Hub</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-DB-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
</div>

<br />

## 🌍 About ZilVerse

**ZilVerse** is an all-in-one, AI-powered digital ecosystem designed to connect innovators, freelancers, creators, and businesses globally. Inspired by futuristic UI/UX aesthetics (glassmorphism, neon accents), ZilVerse unifies multiple platforms into a single, scalable ecosystem.

### Core Ecosystem Modules:
- **🛠️ Freelancer Marketplace:** Hire global talent or offer your services with secure milestone-based escrow payments.
- **🛒 Project & Code Marketplace:** Buy, sell, and showcase side projects, source code, and MVP builds.
- **🎥 InnoReels (Short-Video Social):** An immersive, AI-driven short-video ecosystem (similar to TikTok/Instagram Reels) with creator monetization, double-tap interactions, and algorithmic feeds.
- **🤖 AI Interview & Recruitment:** AI-powered virtual interview rooms with dynamic voice/text Q&A and instant hiring feedback.
- **💼 Job Board & Remote Work:** Apply for global remote jobs or internships with advanced skill-matching.
- **🎓 Tech Academy:** Upskill with digital courses, workshops, and globally recognized certificates.
- **🚀 Startup Innovation & Funding:** Connect with investors, apply for grants, and collaborate on cutting-edge startup pitches.

---

## 🏗️ Tech Stack Architecture

ZilVerse is built with a highly scalable, production-ready full-stack architecture:

### **Frontend (Client)**
* **Framework:** Next.js (App Router, Turbopack)
* **Language:** TypeScript (Strict Mode)
* **Styling:** CSS Modules, Glassmorphism UI, Responsive Mobile-First Design
* **Realtime:** Socket.io-client
* **State Management:** React Context API

### **Backend (API Engine)**
* **Framework:** Node.js with Express.js
* **Language:** TypeScript
* **Database ORM:** Prisma
* **Authentication:** JWT, Passport.js (Google, GitHub, LinkedIn, Facebook OAuth)
* **Realtime:** WebSockets (Socket.io)
* **Media Handling:** Multer (Video & Image streaming)

### **Security & Performance**
* Secure JWT HTTP-only strategies.
* Password hashing via `bcrypt`.
* Granular REST API endpoint protection.
* AI recommendation decay algorithms for content feeds.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
* [Node.js](https://nodejs.org/en/) (v18 or higher)
* Git

### 1. Clone the Repository
```bash
git clone https://github.com/zillekibriya44456/ZilVerse-Platform.git
cd ZilVerse-Platform
```

### 2. Backend Setup
```bash
cd backend
npm install

# Setup Environment Variables
# Create a .env file based on standard requirements:
# PORT=5002
# DATABASE_URL="file:./dev.db" (or PostgreSQL connection string)
# JWT_SECRET="your_secret_key"

# Sync Database Schema
npx prisma db push
npx prisma generate

# Start Backend Server
npm run dev
```
*The backend API will run on `http://localhost:5002`*

### 3. Frontend Setup
```bash
# Open a new terminal instance
cd ../frontend
npm install

# Start Frontend Server
npm run dev
```
*The frontend application will be available at `http://localhost:3000`*

---

## 🛡️ License & Copyright

© 2026 ZilVerse. All rights reserved.
Developed & maintained by **Zille Kibriya**.
