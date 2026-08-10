require('dotenv').config(); 
const express = require('express');
const cors = require('cors');

const app = express();
app.disable('x-powered-by');

const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('CORS policy does not allow this origin'), false);
    },
    methods: ['GET'],
    allowedHeaders: ['Content-Type'],
}));

app.get('/api/convert', async (req, res) => {
    const { amount, base, target } = req.query;

    if (!amount || Number.isNaN(Number(amount))) {
        return res.status(400).json({ error: "Invalid amount" });
    }

    try {
        // Securely fetching the URL from the .env file
        const apiUrl = process.env.EXCHANGE_API_URL;
        
        if (!apiUrl) {
            console.error("Missing EXCHANGE_API_URL in environment");
            return res.status(500).json({ error: "Server configuration error" });
        }

        const response = await fetch(`${apiUrl}/${base}`);
        const data = await response.json();

        const rate = data.rates[target];
        if (!rate) {
            return res.status(400).json({ error: "Unsupported currency pairing" });
        }

        const convertedAmount = (Number.parseFloat(amount) * rate).toFixed(2);
        return res.json({ convertedAmount: Number.parseFloat(convertedAmount) });
        
    } catch (error) {
        console.error("API Fetch Error:", error);
        return res.status(500).json({ error: "Failed to fetch exchange rates" });
    }
});

if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Backend API running on port ${PORT}`);
    });
}

module.exports = app;