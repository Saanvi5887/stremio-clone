const express = require('express');
const axios = require('axios');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
app.use(cors());
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname)));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/player', (req, res) => res.sendFile(path.join(__dirname, 'player.html')));

app.get('/trending', async (req, res) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/trending/movie/week?api_key=d800759469a13ad76fd7f48830a046a8`);
        res.json(response.data.results);
    } catch (e) { res.status(500).send("TMDB Error"); }
});

io.on('connection', (socket) => {
    socket.on('join-room', (roomId) => socket.join(roomId));

    // When leader picks a movie, everyone moves
    socket.on('play-movie', (data) => {
        io.to(data.roomId).emit('start-stream', data);
    });

    // CRITICAL SYNC: Broadcasts time/state to everyone except sender
    socket.on('sync-action', (data) => {
        socket.to(data.roomId).emit('apply-sync', data);
    });

    // WebRTC Signaling
    socket.on('video-signal', (data) => {
        socket.to(data.roomId).emit('video-signal-receive', data);
    });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on ${PORT}`));