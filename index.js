const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// THE BRIDGE: This stops the "returned nothing" error
app.get('/fetch-links', async (req, res) => {
    try {
        const { url } = req.query;
        const response = await axios.get(url, {
            headers: { 
                // This makes the request look like a real person browsing
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' 
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to reach Torrentio" });
    }
});

// Ensure your home page still loads without "Cannot GET /"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on ${PORT}`));