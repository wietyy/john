import { Pool } from 'pg';
import bcrypt from 'bcrypt'; // Keep your other imports

// 1. Use Bun's native env object
const databaseUrl = Bun.env.POSTGRES; 

// 2. Add a quick sanity check to catch missing variables early
if (!databaseUrl) {
  throw new Error("POSTGRES environment variable is not defined!");
}

const pool = new Pool({
  connectionString: databaseUrl
});

const createTableSql = `CREATE TABLE IF NOT EXISTS main (
    id SERIAL PRIMARY KEY,
    password_hash TEXT,
    userdata TEXT
)`;

pool.query(createTableSql).catch((error) => {
    console.error('Failed to create table:', error);
});

export async function getData(password: string): Promise<string> {
    const query = 'SELECT userdata, password_hash FROM main';
    const res = await pool.query(query);
    const rows = res.rows as Array<{ userdata: string, password_hash: string }>;

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

export async function setData(password: string, data: string): Promise<string> {
    try {
        const selectQuery = 'SELECT id, password_hash FROM main';
        const selectRes = await pool.query(selectQuery);
        const rows = selectRes.rows as Array<{ id: number, password_hash: string }>;

        let existingId: number | null = null;

        for (const row of rows) {
            const rowPasswordHash = row.password_hash;
            const isMatch = bcrypt.compareSync(password, rowPasswordHash);

            if (isMatch) {
                existingId = row.id;
                break;
            }
        }

        const hasExistingId = existingId !== null;

        if (!hasExistingId) {
            const saltRounds = 12;
            const hash = bcrypt.hashSync(password, saltRounds);
            const insertQuery = 'INSERT INTO main (password_hash, userdata) VALUES ($1, $2)';
            await pool.query(insertQuery, [hash, data]);
        } else {
            const updateQuery = 'UPDATE main SET userdata = $1 WHERE id = $2';
            await pool.query(updateQuery, [data, existingId]);
        }

        return 'success';
    } catch (error) {
        console.error('Error in setData:', error);
        return 'error';
    }
}