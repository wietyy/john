import bcrypt from 'bcrypt';

export function hash(pass: string): string {
    return bcrypt.hashSync(pass, 12);
}