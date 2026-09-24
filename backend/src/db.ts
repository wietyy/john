import { Database } from 'bun:sqlite';
import { env } from 'process';
import bcrypt from 'bcrypt';

const db = new Database(env.DATABASE as string);

db.run(`CREATE TABLE IF NOT EXISTS main (
    id INTEGER PRIMARY KEY,
    password_hash TEXT,
    userdata TEXT
)`);

export function getData(password: string): string {
    const rows = db.prepare('SELECT userdata, password_hash FROM main').all() as Array<{ userdata: string, password_hash: string }>;
    for (const row of rows) {
        if (bcrypt.compareSync(password, row.password_hash)) {
            return row.userdata;
        }
    }
    return '';
}

export function setData(password: string, data: string): string {
    try {
        const rows = db.prepare('SELECT id, password_hash FROM main').all() as Array<{ id: number, password_hash: string }>;
        let existingId: number | null = null;
        
        for (const row of rows) {
            if (bcrypt.compareSync(password, row.password_hash)) {
                existingId = row.id;
                break;
            }
        }
        
        if (!existingId) {
            const hash = bcrypt.hashSync(password, 12);
            db.prepare('INSERT INTO main (password_hash, userdata) VALUES (?, ?)').run(hash, data);
        } else {
            db.prepare('UPDATE main SET userdata = ? WHERE id = ?').run(data, existingId);
        }
        return 'success';
    } catch (error) {
        return 'error';
    }
}