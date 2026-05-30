const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

// This serves your HTML files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// THE BRIDGE: Your server fetches the data so the browser doesn't get blocked
app.get('/fetch-links', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: "No URL provided" });

        console.log(`Fetching from Torrentio: ${url}`);
        
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' } // Pretend to be a browser
        });
        
        res.json(response.data);
    } catch (error) {
        console.error("Tunnel Error:", error.message);
        res.status(500).json({ error: "Failed to reach Torrentio" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running! View it at http://localhost:${PORT}`);
});