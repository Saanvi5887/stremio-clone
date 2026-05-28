const express = require('express');
const axios = require('axios');
const http = require('http'); 
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname)));

// API to get trending movies
app.get('/trending', async (req, res) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/trending/movie/week?api_key=d800759469a13ad76fd7f48830a046a8`);
        res.json(response.data.results);
    } catch (e) { res.status(500).json([]); }
});

io.on('connection', (socket) => {
    // Join a room based on the ID generated in the lobby
    socket.on('join-room', (roomId) => socket.join(roomId));

    // When the leader picks a movie, redirect everyone in that room
    socket.on('play-movie', (data) => {
        io.to(data.roomId).emit('redirect-to-player', data);
    });

    // Handle Play/Pause/Seek synchronization
    socket.on('sync-event', (data) => {
        // Broadcast the time and state to everyone EXCEPT the sender
        socket.to(data.roomId).emit('apply-sync', data);
    });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));