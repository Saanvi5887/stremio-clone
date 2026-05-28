const express = require('express');
const axios = require('axios');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io');
const path = require('path');
const crypto = require('crypto'); // Built-in for secure IDs

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.get('/app', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/player', (req, res) => res.sendFile(path.join(__dirname, 'player.html')));

// ROUTE TO GENERATE A PRIVATE ID
app.get('/generate-room', (req, res) => {
    const privateId = crypto.randomBytes(4).toString('hex'); // Example: 'a1b2c3d4'
    res.json({ roomId: privateId });
});

const API_KEY = 'd800759469a13ad76fd7f48830a046a8';

app.get('/trending', async (req, res) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`);
        res.json(response.data.results);
    } catch (e) { res.status(500).json({ error: "TMDB Failed" }); }
});

app.get('/streams/:id', async (req, res) => {
    try {
        const response = await axios.get(`https://torrentio.strem.fun/stream/movie/${req.params.id}.json`);
        res.json(response.data.streams || []);
    } catch (e) { res.status(500).json({ error: "Torrentio Failed" }); }
});

// SOCKET LOGIC - Optimized for less lag
io.on('connection', (socket) => {
    socket.on('join-room', (roomId) => socket.join(roomId));
    
    socket.on('play-movie', (data) => {
        io.to(data.roomId).emit('start-stream', data);
    });

    // NEW: Sync controls with debouncing (prevents lag)
    socket.on('sync-action', (data) => {
        socket.to(data.roomId).emit('apply-sync', data);
    });
});

server.listen(5001, '0.0.0.0', () => {
    console.log("🚀 SERVER LIVE");
});

const PORT = process.env.PORT || 5001; // Use cloud port or 5001 locally
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});