const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
// Serve your frontend files
app.use(express.static(path.join(__dirname, 'public')));

// THE BRIDGE: This route fetches links without getting blocked
app.get('/fetch-links', async (req, res) => {
    try {
        const { url } = req.query;
        const response = await axios.get(url, {
            headers: { 
                // This tricks Torrentio into thinking the request is from a person, not a bot
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' 
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Bridge failed:", error.message);
        res.status(500).json({ error: "Failed to reach Torrentio" });
    }
});

// Fixes the "Cannot GET /" error by serving your index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on ${PORT}`));