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
    const requestBody = req.body;
    const password = requestBody.password;
    const data = getData(password);
    const responseBody = { data };
    res.json(responseBody);
});

app.post('/api/setCloudData', (req, res) => {
    const requestBody = req.body;
    const requestPassword = requestBody.password;
    const requestData = requestBody.data;
    const result = setData(requestPassword, requestData);
    const responseBody = { result };
    res.json(responseBody);
});

const defaultPort = '3000';
const envPort = process.env.PORT;
const portString = envPort ?? defaultPort;
const portNumber = Number(portString);

const server = app.listen(portNumber, () => {
    const message = `Server running on port ${portString}`;
    console.log(message);
});