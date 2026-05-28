const express = require('express');
const axios = require('axios');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Middlewares
app.use(cors());
app.use(express.static(path.join(__dirname))); // Serves CSS/JS files if you add them later

// --- ROUTES ---

// Home route (Fixes "Cannot GET /")
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// App/Lobby route
app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Player route (Fixes "Cannot GET /player")
app.get('/player', (req, res) => {
    res.sendFile(path.join(__dirname, 'player.html'));
});

// Private Room ID Generator
app.get('/generate-room', (req, res) => {
    const privateId = crypto.randomBytes(4).toString('hex'); 
    res.json({ roomId: privateId });
});

// TMDB API Integration
const API_KEY = 'd800759469a13ad76fd7f48830a046a8';
app.get('/trending', async (req, res) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`);
        res.json(response.data.results);
    } catch (e) { 
        res.status(500).json({ error: "TMDB API Failed" }); 
    }
});

// Torrentio Stream Integration
app.get('/streams/:id', async (req, res) => {
    try {
        const response = await axios.get(`https://torrentio.strem.fun/stream/movie/${req.params.id}.json`);
        res.json(response.data.streams || []);
    } catch (e) { 
        res.status(500).json({ error: "Torrentio API Failed" }); 
    }
});

// --- SOCKET.IO LOGIC ---
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });
    
    socket.on('play-movie', (data) => {
        // Broadcasts to everyone in the room to start the movie
        io.to(data.roomId).emit('start-stream', data);
    });

    socket.on('sync-action', (data) => {
        // Syncs pause/play/seek actions
        socket.to(data.roomId).emit('apply-sync', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// --- SERVER START (REVISED) ---
const PORT = process.env.PORT || 5001; 
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 GLOBAL SERVER LIVE ON PORT ${PORT}`);
});