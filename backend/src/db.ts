import { bashit } from "./bashit.js";
import { uuid } from "uuidv4";

export async function createUser(username: string, passhash: string) {
    const apikey = uuid();
    await bashit("sqlite3", [
        "./dev/database.db",
        `INSERT INTO main (username, passhash, apikey, data) VALUES ("${btoa(username)}", "${btoa(passhash)}", "${apikey}", "null");`,
    ]);
    return apikey;
}

export async function usernameExists(username: string) {
    const result = await bashit("sqlite3", [
        "./dev/database.db",
        `SELECT username FROM main WHERE username = "${btoa(username)}";`,
    ]);
    return result.length > 0;
}

export async function login(username: string, passhash: string) {
    const result = await bashit("sqlite3", [
        "./dev/database.db",
        `SELECT apikey FROM main WHERE username = "${btoa(username)}" AND passhash = "${btoa(passhash)}";`,
    ]);
    return result.length > 0 ? result[0] : null;
}

export async function getData(apikey: string) {
    const result = await bashit("sqlite3", [
        "./dev/database.db",
        `SELECT data FROM main WHERE apikey = "${apikey}";`,
    ]);
    return result.length > 0 && result[0] ? atob(result[0]) : null;
}

export async function setData(apikey: string, data: string) {
    await bashit("sqlite3", [
        "./dev/database.db",
        `UPDATE main SET data = "${btoa(data)}" WHERE apikey = "${apikey}";`,
    ]);
}