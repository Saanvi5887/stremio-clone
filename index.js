const express = require('express');
const axios = require('axios');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);

// Open CORS for streaming and signaling
app.use(cors({ origin: "*" }));

const io = new Server(server, { 
    cors: { origin: "*", methods: ["GET", "POST"] } 
});

app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/app', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/player', (req, res) => res.sendFile(path.join(__dirname, 'player.html')));

app.get('/generate-room', (req, res) => {
    const privateId = crypto.randomBytes(4).toString('hex'); 
    res.json({ roomId: privateId });
});

const API_KEY = 'd800759469a13ad76fd7f48830a046a8';
app.get('/trending', async (req, res) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`);
        res.json(response.data.results);
    } catch (e) { res.status(500).json({ error: "TMDB Failed" }); }
});

// Note: index.html is now fetching streams directly to bypass Render's IP block,
// but we keep this here as a fallback.
app.get('/streams/:id', async (req, res) => {
    try {
        const imdbId = req.params.id;
        const url = `https://torrentio.strem.fun/stream/movie/${imdbId}.json`;
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 8000
        });
        res.json(response.data.streams || []);
    } catch (e) {
        res.status(500).json({ error: "Stream fetch failed" });
    }
});

// --- SOCKET LOGIC ---
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    socket.on('play-movie', (data) => {
        // Tells everyone in the room to go to the player page
        io.to(data.roomId).emit('start-stream', data);
    });

    socket.on('sync-action', (data) => {
        // We use socket.to(roomId) so the person who clicked 'Play' 
        // doesn't have their own video reset.
        socket.to(data.roomId).emit('apply-sync', data);
    });

    // NEW: WebRTC Video Signaling
    // This passes the camera data between users without the server "seeing" the video
    socket.on('video-signal', (data) => {
        socket.to(data.roomId).emit('video-signal-receive', {
            signal: data.signal,
            from: socket.id
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`);
});