const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/fetch-links', async (req, res) => {
    try {
        const { url } = req.query;
        // The 500 error happens if the URL is undefined or malformed
        if (!url) return res.status(400).json({ error: "Missing URL" });

        const response = await axios.get(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip, deflate, br' // Helps with Render network stability
            },
            timeout: 15000 
        });
        
        res.json(response.data);
    } catch (error) {
        // This stops the generic 500 and tells you exactly what happened in the Render logs
        console.error("Bridge Error:", error.response ? error.response.status : error.message);
        res.status(502).json({ error: "Torrentio connection failed", message: error.message });
    }
});

app.get('/', (req, res) => {
    const rootPath = path.join(__dirname, 'index.html');
    const publicPath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(rootPath, (err) => {
        if (err) res.sendFile(publicPath, (err2) => {
            if (err2) res.status(404).send("Grid file missing.");
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on ${PORT}`));