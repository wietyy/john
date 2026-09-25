import express from 'express';
import { getData, setData } from './db';

const app = express();

const jsonMiddleware = express.json();
app.use(jsonMiddleware);

const staticMiddleware = express.static('frontend/dist');
app.use(staticMiddleware);

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