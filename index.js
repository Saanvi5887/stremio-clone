const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

// Ensures your site loads at the main URL
app.use(express.static(path.join(__dirname)));

app.get('/fetch-links', async (req, res) => {
    try {
        const { url } = req.query;
        // This specific header stops the 403 Forbidden error
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0' }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Bridge failed" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on ${PORT}`));