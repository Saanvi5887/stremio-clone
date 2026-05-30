const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

// This line stops the "Cannot GET /" error once and for all
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// The Bridge: Fetches links without getting blocked
app.get('/fetch-links', async (req, res) => {
    try {
        const { url } = req.query;
        const response = await axios.get(url, {
            headers: { 
                // This "User-Agent" is the secret to stopping the 403 errors
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36' 
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Torrentio connection failed" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on ${PORT}`));