import { createUser, getData, login, setData, usernameExists } from "./db.js";
import { rateLimit } from "./ratelimit.js";
import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import fs from "fs";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api", rateLimit(300));
app.use("/api/login", rateLimit(10));
app.use("/api/createuser", rateLimit(10));
app.use(express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public")));

app.get("/login", (req, res) => {
    res.sendFile(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "login.html"));
});

app.get("/app", (req, res) => {
    res.sendFile(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "app.html"));
});

app.post("/api/createuser", async (req: any, res: any) => {
    const username = req.body.username;
    const password = req.body.password;
    if (await usernameExists(username)) {
        res.status(400).send("Username already exists");
        return;
    }
    const hash = bcrypt.hashSync(password, 10);

    const apikey = await createUser(username, hash);
    res.send(apikey);
});

app.post("/api/login", async (req: any, res: any) => {
    const username = req.body.username;
    const password = req.body.password;
    const user = await login(username);
    if (!user) {
        res.status(401).send("Invalid username or password");
        return;
    }
    if (user.storedPasshash && bcrypt.compareSync(password, atob(user.storedPasshash))) {
        res.send(user.apikey);
    } else {
        res.status(401).send("Invalid username or password");
    }
});

app.post("/api/setdata", async (req: any, res: any) => {
    const apikey = req.body.apikey;
    const data = req.body.data;
    await setData(apikey, data);
    res.send("ok");
});

app.get("/api/getdata", async (req: any, res: any) => {
    const apikey = req.query.apikey;
    const data = await getData(apikey);
    res.send(data);
});

const sslKey = process.env.SSL_KEY;
const sslCert = process.env.SSL_CERT;

if (sslKey && sslCert && fs.existsSync(sslKey) && fs.existsSync(sslCert)) {
    https.createServer(
        {
            key: fs.readFileSync(sslKey),
            cert: fs.readFileSync(sslCert),
        },
        app
    ).listen(process.env.PORT, () => {
        console.log(`Listening on https://localhost:${process.env.PORT}`);
    });
} else {
    if (sslKey || sslCert) {
        console.warn("SSL certs configured but not found — falling back to plain HTTP. Run 'just certs'.");
    }
    app.listen(process.env.PORT, () => {
        console.log(`Listening on http://localhost:${process.env.PORT}`);
    });
}