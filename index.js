const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());

// Serve static assets from both possible locations
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'public')));

// THE BRIDGE: Bypasses the 500/403 Forbidden blocks
app.get('/fetch-links', async (req, res) => {
    try {
        const { url } = req.query;
        const response = await axios.get(url, {
            headers: { 
                // Essential header to stop Torrentio from blocking the Render server
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            },
            timeout: 15000 
        });
        res.json(response.data);
    } catch (error) {
        console.error("Bridge Error:", error.message);
        res.status(500).json({ error: "Bridge failed to reach Torrentio" });
    }
});

// THE FAIL-SAFE: Tries both root and public for index.html
app.get('/', (req, res) => {
    const rootPath = path.join(__dirname, 'index.html');
    const publicPath = path.join(__dirname, 'public', 'index.html');
    
    res.sendFile(rootPath, (err) => {
        if (err) {
            res.sendFile(publicPath, (err2) => {
                if (err2) {
                    res.status(404).send("Error: index.html not found in root or public folder.");
                }
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));