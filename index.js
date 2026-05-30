const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());

// Fixes the "Cannot GET /" by manually serving index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// The Bridge: This fixes the 500 error
app.get('/fetch-links', async (req, res) => {
    try {
        const { url } = req.query;
        console.log("Requesting Torrentio:", url);

        const response = await axios.get(url, {
            headers: { 
                // This header prevents Torrentio from blocking the server (the 500 error)
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' 
            },
            timeout: 8000
        });
        res.json(response.data);
    } catch (error) {
        console.error("Bridge Error:", error.message);
        res.status(500).json({ error: "Torrentio blocked the request" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));