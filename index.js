const express = require('express');
const axios = require('axios');
const http = require('http'); 
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname)));

// Fetch trending movies for the lobby
app.get('/trending', async (req, res) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/trending/movie/week?api_key=d800759469a13ad76fd7f48830a046a8`);
        res.json(response.data.results);
    } catch (e) { 
        res.status(500).json([]); 
    }
});

io.on('connection', (socket) => {
    // When a user joins, they pass their Room ID and their unique Peer ID (for video)
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        
        // Notify others in the room that a new user is ready for a video call
        socket.to(roomId).emit('user-connected', userId);

        // Handle movie playback signaling
        socket.on('play-movie', (data) => {
            socket.to(roomId).emit('start-stream', data);
        });

        // Handle playback sync (play/pause/seek)
        socket.on('sync-event', (data) => {
            socket.to(roomId).emit('apply-sync', data);
        });

        // Cleanup when a user leaves
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId);
        });
    });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`🚀 Theater & Video Call Server running on port ${PORT}`);
});