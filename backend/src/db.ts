import { Database } from 'bun:sqlite';
import { env } from 'process';
import bcrypt from 'bcrypt';

const databasePath = env.DATABASE as string;
const db = new Database(databasePath);

const createTableSql = `CREATE TABLE IF NOT EXISTS main (
    id INTEGER PRIMARY KEY,
    password_hash TEXT,
    userdata TEXT
)`;
db.run(createTableSql);

export function getData(password: string): string {
    const query = 'SELECT userdata, password_hash FROM main';
    const statement = db.prepare(query);
    const rawRows = statement.all();
    const rows = rawRows as Array<{ userdata: string, password_hash: string }>;

    for (const row of rows) {
        const passwordHash = row.password_hash;
        const userdata = row.userdata;
        const isMatch = bcrypt.compareSync(password, passwordHash);

        if (isMatch) {
            return userdata;
        }
    }

    return '';
}

export function setData(password: string, data: string): string {
    try {
        const selectQuery = 'SELECT id, password_hash FROM main';
        const selectStatement = db.prepare(selectQuery);
        const rawRows = selectStatement.all();
        const rows = rawRows as Array<{ id: number, password_hash: string }>;

        let existingId: number | null = null;
        let index = 0;
        const rowCount = rows.length;

        while (index < rowCount) {
            const currentRow = rows[index];
            const rowId = currentRow!.id;
            const rowPasswordHash = currentRow!.password_hash;
            const isMatch = bcrypt.compareSync(password, rowPasswordHash);

            if (isMatch) {
                existingId = rowId;
                break;
            }

            index = index + 1;
        }

        const hasExistingId = existingId !== null;

        if (!hasExistingId) {
            const saltRounds = 12;
            const hash = bcrypt.hashSync(password, saltRounds);
            const insertQuery = 'INSERT INTO main (password_hash, userdata) VALUES (?, ?)';
            const insertStatement = db.prepare(insertQuery);
            insertStatement.run(hash, data);
        } else {
            const updateQuery = 'UPDATE main SET userdata = ? WHERE id = ?';
            const updateStatement = db.prepare(updateQuery);
            updateStatement.run(data, existingId);
        }

        return 'success';
    } catch (error) {
        return 'error';
    }
}