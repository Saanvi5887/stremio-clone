const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

// This tells the server to send your index.html when someone visits the site
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// THE TUNNEL: Fetches the links without browser blocks
app.get('/fetch-links', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).send("No URL");

        console.log("Fetching:", url);
        const response = await axios.get(url, { timeout: 10000 });
        res.json(response.data);
    } catch (error) {
        console.error("Tunnel error:", error.message);
        res.status(500).json({ error: "Failed" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on ${PORT}`));