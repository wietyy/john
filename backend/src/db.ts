import { Database } from 'bun:sqlite';
import { env } from 'process';

const db = new Database(env.DATABASE as string);

const getStatement = db.prepare('SELECT userdata FROM main WHERE keyhash == ?');
const checkStatement = db.prepare('SELECT id FROM main WHERE keyhash == ?');
const insertStatement = db.prepare('INSERT INTO main (keyhash, userdata) VALUES (?, ?)');
const updateStatement = db.prepare('UPDATE main SET userdata = ? WHERE keyhash == ?');

export function getData(key: string): string {
    const row = getStatement.get(key) as { userdata: string } | undefined;
    return row ? row.userdata : '';
}

export function setData(key: string, data: string): string {
    try {
        const row = checkStatement.get(key) as { id: number } | undefined;
        if (!row) {
            insertStatement.run(key, data);
        } else {
            updateStatement.run(data, key);
        }
        return 'success';
    } catch (error) {
        return 'error';
    }
}