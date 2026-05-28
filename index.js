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
    socket.on('join-room', (id) => socket.join(id));
    socket.on('play-movie', (data) => socket.to(data.roomId).emit('start-stream', data));
    socket.on('sync-event', (data) => socket.to(data.roomId).emit('apply-sync', data));
});

server.listen(process.env.PORT || 5001, () => console.log('🚀 Final Theater Online'));