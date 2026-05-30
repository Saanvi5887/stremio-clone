const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

// This line is CRITICAL: It tells Express to serve your index.html
app.use(express.static(path.join(__dirname, 'public')));

app.get('/fetch-links', async (req, res) => {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
        return res.status(400).send("No URL provided");
    }

    try {
        console.log("Server is attempting to fetch:", targetUrl);
        
        const response = await axios.get(targetUrl, {
            timeout: 10000, // Wait 10 seconds before giving up
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error("Fetch failed:", error.message);
        res.status(500).json({ error: "Torrentio connection failed", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));