import type { Request, Response, NextFunction } from "express";

interface Bucket {
    count: number;
    resetAt: number;
}

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;

setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(key);
    }
}, WINDOW_MS);

export function rateLimit(max: number, windowMs: number = WINDOW_MS) {
    return (req: Request, res: Response, next: NextFunction) => {
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const now = Date.now();
        let bucket = buckets.get(ip);
        if (!bucket || bucket.resetAt <= now) {
            bucket = { count: 0, resetAt: now + windowMs };
            buckets.set(ip, bucket);
        }
        bucket.count++;
        if (bucket.count > max) {
            res.status(429).send("Too many requests — slow down my dude");
            return;
        }
        next();
    };
}