import { bashit } from "./bashit.js";
import uuidv4 from "uuidv4";
import { env } from "process";  

import * as dotenv from "dotenv";
dotenv.config();

const db: string = env.DATABASE?.toString() || "main.db";

export async function createUser(username: string, passhash: string) {
    const apikey = uuidv4();
    await bashit("sqlite3", [
        db,
        `INSERT INTO main (username, passhash, apikey, data) VALUES ("${btoa(username)}", "${btoa(passhash)}", "${apikey}", "null");`,
    ]);
    return apikey;
}


export async function usernameExists(username: string) {
    const result = await bashit("sqlite3", [
        db,
        `SELECT username FROM main WHERE username = "${btoa(username)}";`,
    ]);
    return result.length > 0;
}

export async function login(username: string) {
    const result = await bashit("sqlite3", [
        db,
        `SELECT passhash, apikey FROM main WHERE username = "${btoa(username)}";`,
    ]);
    return result.split("|");
}

export async function getData(apikey: string) {
    const command = `SELECT data FROM main WHERE apikey = '${apikey}';`;

    const result = await bashit("sqlite3", [
        db,
        command
    ]);

    return atob(result);
}

export async function setData(apikey: string, data: string) {
    await bashit("sqlite3", [
        db,
        `UPDATE main SET data = "${btoa(data)}" WHERE apikey = "${apikey}";`,
    ]);
}