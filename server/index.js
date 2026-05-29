import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';

import itemRoutes from './routes/items.js';
import userRoutes from './routes/users.js';
import uploadRoutes from './routes/uploadRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import walletRoutes from './routes/walletRoutes.js';

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
        console.log(`Blocked by CORS: ${origin}`);
        return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
};


await connectDB();
const app = express();
app.use(cors(corsOptions));
app.use(express.json());


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


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('send-message', (data) => io.emit('new-message', data));
    socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));