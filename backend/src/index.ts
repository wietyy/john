import express from 'express';
import { getData, setData } from './db';

const app = express();

app.use(express.json());
app.use(express.static('frontend/dist'));

app.get('/api/getCloudData', (req, res) => {
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