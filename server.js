const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

// Tell the server to show files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// THE TUNNEL: This bypasses the CORS/403 errors
app.get('/fetch-links', async (req, res) => {
    try {
        const { url } = req.query;
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Torrentio is unreachable" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));