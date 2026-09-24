import express from 'express';
import { getData, setData } from './db';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
    limit: 100,
    message: "Too many requests",
});

const app = express();

app.use(express.json());
app.use(express.static('frontend/dist'));
app.use(limiter);

app.post('/api/getCloudData', (req, res) => {
    const password = req.body.password;
    const data = getData(password);
    res.json({ data });
});

app.post('/api/setCloudData', (req, res) => {
    res.json({ result: setData(req.body.password, req.body.data) });
});

const PORT = process.env.PORT ?? '3000';
app.listen(Number(PORT), () => {
    console.log(`Server running on port ${PORT}`);
});