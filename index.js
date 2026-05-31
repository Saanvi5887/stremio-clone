const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());

// This helps load your CSS/Images from wherever they are
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'public')));

// THE BRIDGE: Bypasses the 403 Forbidden blocks
app.get('/fetch-links', async (req, res) => {
    try {
        const { url } = req.query;
        const response = await axios.get(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            },
            timeout: 10000 
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Bridge failed" });
    }
});

// THE FIX: Try to serve index.html from root first, then public
app.get('/', (req, res) => {
    const rootPath = path.join(__dirname, 'index.html');
    const publicPath = path.join(__dirname, 'public', 'index.html');
    
    res.sendFile(rootPath, (err) => {
        if (err) {
            res.sendFile(publicPath, (err2) => {
                if (err2) {
                    res.status(404).send("File not found in root or public folder.");
                }
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));