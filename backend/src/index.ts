import { createUser, getData, login, setData, usernameExists } from "./db.js";
import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("frontend"));

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

app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});