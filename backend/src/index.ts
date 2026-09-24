import express from 'express';
import { getData, setData } from './db';

const app = express();

app.use(express.json());
app.use(express.static('frontend/dist'));

app.get('/api/getCloudData', (req, res) => {
    const keyhash = req.body.keyhash;
    const result = getData(keyhash);
    res.json({ userdata: result });
});

app.post('/api/setCloudData', (req, res) => {
    const { keyhash, data } = req.body;
    const result = setData(keyhash, data);
    res.json({ result });
});

const PORT = process.env.PORT ?? '8080';
app.listen(Number(PORT), () => {
    console.log(`Server running on port ${PORT}`);
});