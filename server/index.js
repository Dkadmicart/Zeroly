import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import logger from './utils/logger.js';
import jwt from 'jsonwebtoken';
import Chat from './models/Chat.js';

import itemRoutes from './routes/items.js';
import userRoutes from './routes/users.js';
import uploadRoutes from './routes/uploadRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';

const PORT = process.env.PORT || 5001;


const allowedOrigins = [
    'http://localhost:5173',
    'https://zeroly.netlify.app',
    'https://zeroly-production.up.railway.app',
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        logger.warn(`Blocked by CORS: ${origin}`);
        return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
};


await connectDB();
const app = express();

// Baseline security headers.
// CSP is disabled because the React SPA is served from a separate origin (Netlify)
// and this server only serves JSON. A full CSP policy belongs on the frontend host.
app.use(helmet({
    contentSecurityPolicy: false,
}));

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


import { apiLimiter, strictUploadLimiter } from './middleware/rateLimiter.js';

app.use('/api', apiLimiter);

app.get('/', (req, res) => res.send('API is running'));
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', strictUploadLimiter, uploadRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/wishlists', wishlistRoutes);


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Authentication error: No token provided'));
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
    } catch (err) {
        next(new Error('Authentication error: Invalid token'));
    }
});

io.on('connection', (socket) => {
    logger.debug('User connected: %s', socket.id);

    socket.on('joinRoom', async (roomId) => {
        if (!roomId) return;
        try {
            const chat = await Chat.findById(roomId);
            if (!chat) return;

            const isParticipant = chat.participants.some(p => p.toString() === socket.userId);
            if (isParticipant) {
                socket.join(roomId);
                logger.debug(`Socket ${socket.id} joined room ${roomId}`);
            } else {
                logger.warn(`Unauthorized room join attempt by user ${socket.userId} for room ${roomId}`);
            }
        } catch (err) {
            logger.error({ err }, 'Error joining room');
        }
    });

    socket.on('send-message', (data) => {
        const roomId = data.roomId || data.chatId;
        if (!roomId) return;
        io.to(roomId).emit('new-message', data);
    });

    socket.on('disconnect', () => logger.debug('User disconnected: %s', socket.id));
});

server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));