import dotenv from 'dotenv';
dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("==========================================================");
  console.error("FATAL CONFIGURATION ERROR: JWT_SECRET is not defined in env.");
  console.error("Please configure JWT_SECRET in your backend/.env file.");
  console.error("==========================================================");
  process.exit(1);
}

import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
// @ts-ignore
import jwt from 'jsonwebtoken';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import profileRoutes from './routes/profiles';
import reelRoutes from './routes/reels';
import portfolioRoutes from './routes/portfolio';
import freelancerRoutes from './routes/freelancers';
import serviceRoutes from './routes/services';
import jobRoutes from './routes/jobs';
import fundRoutes from './routes/funds';
import academyRoutes from './routes/academy';
import eventRoutes from './routes/events';
import contactRoutes from './routes/contact';
import interviewRoutes from './routes/interview';
import discussionRoutes from './routes/discussions';
import creatorRoutes from './routes/creators';
import exchangeRoutes from './routes/exchange';
import adminRoutes from './routes/admin';
import paymentRoutes from './routes/payments';
import researchRoutes from './routes/research';
import chatRoutes from './routes/chat';
import spotlightRoutes from './routes/spotlights';
import testimonialRoutes from './routes/testimonials';
import statisticsRoutes from './routes/statistics';
import homepageRoutes from './routes/homepage';
const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json({
  verify: (req: any, res, buf) => {
    if (req.originalUrl && req.originalUrl.startsWith('/api/payments/webhook')) {
      req.rawBody = buf;
    }
  }
}));

import './config/passport';
import passport from 'passport';
import session from 'express-session';

app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/funds', fundRoutes);
app.use('/api/academy', academyRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/exchange', exchangeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/spotlights', spotlightRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/homepage', homepageRoutes);

app.get('/', (req, res) => {
  res.send('ZilVerse API is running...');
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? ['https://zillekibriya.in'] : ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Enforce JWT validation on WebSocket connection handshake
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;

  if (!token) {
    return next(new Error('Authentication error: No token provided.'));
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new Error('Server configuration error.'));
  }

  jwt.verify(token as string, secret, (err: any, decoded: any) => {
    if (err) {
      return next(new Error('Authentication error: Invalid token.'));
    }
    socket.data.user = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  const userId = socket.data.user?.id;
  console.log(`Socket authenticated & connected: ${socket.id} (User: ${userId})`);
  
  if (userId) {
    // Automatically join the room of the authenticated user
    socket.join(userId);
    console.log(`User ${userId} joined room ${userId} securely.`);
  }

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.set('io', io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
