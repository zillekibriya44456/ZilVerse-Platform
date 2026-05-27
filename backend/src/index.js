"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.JWT_SECRET) {
    console.error("==========================================================");
    console.error("FATAL CONFIGURATION ERROR: JWT_SECRET is not defined in env.");
    console.error("Please configure JWT_SECRET in your backend/.env file.");
    console.error("==========================================================");
    process.exit(1);
}
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
// @ts-ignore
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = __importDefault(require("./routes/auth"));
const projects_1 = __importDefault(require("./routes/projects"));
const profiles_1 = __importDefault(require("./routes/profiles"));
const reels_1 = __importDefault(require("./routes/reels"));
const portfolio_1 = __importDefault(require("./routes/portfolio"));
const freelancers_1 = __importDefault(require("./routes/freelancers"));
const services_1 = __importDefault(require("./routes/services"));
const jobs_1 = __importDefault(require("./routes/jobs"));
const funds_1 = __importDefault(require("./routes/funds"));
const academy_1 = __importDefault(require("./routes/academy"));
const events_1 = __importDefault(require("./routes/events"));
const contact_1 = __importDefault(require("./routes/contact"));
const interview_1 = __importDefault(require("./routes/interview"));
const discussions_1 = __importDefault(require("./routes/discussions"));
const creators_1 = __importDefault(require("./routes/creators"));
const exchange_1 = __importDefault(require("./routes/exchange"));
const admin_1 = __importDefault(require("./routes/admin"));
const payments_1 = __importDefault(require("./routes/payments"));
const research_1 = __importDefault(require("./routes/research"));
const chat_1 = __importDefault(require("./routes/chat"));
const spotlights_1 = __importDefault(require("./routes/spotlights"));
const testimonials_1 = __importDefault(require("./routes/testimonials"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5002;
app.use((0, cors_1.default)());
app.use(express_1.default.json({
    verify: (req, res, buf) => {
        if (req.originalUrl && req.originalUrl.startsWith('/api/payments/webhook')) {
            req.rawBody = buf;
        }
    }
}));
require("./config/passport");
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
app.use((0, express_session_1.default)({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: false }));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Serve uploaded files statically
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/profiles', profiles_1.default);
app.use('/api/reels', reels_1.default);
app.use('/api/portfolio', portfolio_1.default);
app.use('/api/freelancers', freelancers_1.default);
app.use('/api/services', services_1.default);
app.use('/api/jobs', jobs_1.default);
app.use('/api/funds', funds_1.default);
app.use('/api/academy', academy_1.default);
app.use('/api/events', events_1.default);
app.use('/api/contact', contact_1.default);
app.use('/api/interview', interview_1.default);
app.use('/api/discussions', discussions_1.default);
app.use('/api/creators', creators_1.default);
app.use('/api/exchange', exchange_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/payments', payments_1.default);
app.use('/api/research', research_1.default);
app.use('/api/chat', chat_1.default);
app.use('/api/spotlights', spotlights_1.default);
app.use('/api/testimonials', testimonials_1.default);
app.get('/', (req, res) => {
    res.send('ZilVerse API is running...');
});
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
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
    jsonwebtoken_1.default.verify(token, secret, (err, decoded) => {
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
//# sourceMappingURL=index.js.map