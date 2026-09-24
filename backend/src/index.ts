import express from 'express';
import { getData, setData } from './db';
import { hash } from './hash';

const app = express();

app.use(express.json());
app.use(express.static('frontend/dist'));

app.get('/api/getCloudData', (req, res) => {
    const password = req.body.password;
    const hashValue = hash(password);
    const data = getData(hashValue);
    res.json({ data });
});

app.post('/api/setCloudData', (req, res) => {
    const hashValue = hash(req.body.password);
    res.json({ result: setData(hashValue, req.body.data) });
});

const PORT = process.env.PORT ?? '3000';
app.listen(Number(PORT), () => {
    console.log(`Server running on port ${PORT}`);
});