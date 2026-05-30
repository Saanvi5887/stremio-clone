const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());

// This line allows your CSS and Images to load correctly from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// THE BRIDGE: This is the fix for the "No streams found" / 403 Forbidden error
app.get('/fetch-links', async (req, res) => {
    try {
        const { url } = req.query;
        console.log("Bridge fetching:", url);

        const response = await axios.get(url, {
            headers: { 
                // This specific User-Agent stops Torrentio from blocking your Render server
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            },
            timeout: 10000 // Prevents the server from hanging if Torrentio is slow
        });
        
        res.json(response.data);
    } catch (error) {
        console.error("Bridge failed:", error.message);
        res.status(500).json({ error: "Failed to reach Torrentio", details: error.message });
    }
});

// CRITICAL FIX: Ensures the main page (your movie grid) actually loads
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));