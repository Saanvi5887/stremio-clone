const express = require('express');
const axios = require('axios');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);

// FIX 1: Open up CORS completely
app.use(cors({ origin: "*" }));

const io = new Server(server, { 
    cors: { origin: "*", methods: ["GET", "POST"] } 
});

app.use(express.static(path.join(__dirname)));

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

// FIX 2: Better stream fetching with Headers
app.get('/streams/:id', async (req, res) => {
    try {
        const imdbId = req.params.id;
        const url = `https://torrentio.strem.fun/stream/movie/${imdbId}.json`;
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 8000
        });
        
        res.json(response.data.streams || []);
    } catch (e) {
        console.error("Fetch Error:", e.message);
        res.status(500).json({ error: "Torrentio blocked the request or timed out" });
    }
});

io.on('connection', (socket) => {
    socket.on('join-room', (roomId) => socket.join(roomId));
    socket.on('play-movie', (data) => io.to(data.roomId).emit('start-stream', data));
    socket.on('sync-action', (data) => socket.to(data.roomId).emit('apply-sync', data));
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`);
});