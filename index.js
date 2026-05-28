const express = require('express');
const axios = require('axios');
const http = require('http'); 
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname)));

app.get('/trending', async (req, res) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/trending/movie/week?api_key=d800759469a13ad76fd7f48830a046a8`);
        res.json(response.data.results);
    } catch (e) { res.status(500).json([]); }
});

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId}`);
        // Broadcast to everyone else in the room that a new user joined
        socket.to(roomId).emit('user-connected', userId);

        socket.on('sync-event', (data) => {
            socket.to(roomId).emit('apply-sync', data);
        });

        socket.on('play-movie', (data) => {
            socket.to(roomId).emit('start-stream', data);
        });

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId);
        });
    });
});

server.listen(process.env.PORT || 5001, () => console.log('🚀 Sync Server Active'));