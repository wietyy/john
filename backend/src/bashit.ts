import { spawn } from "child_process";

// ladies and gentlemen, the solution to all problems
// created 5/19/2026
export function bashit(cmd: string, args: string[] = []): Promise<string> {
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, args, {
            shell: false,
            windowsHide: true,
        });

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (d) => {
            stdout += d.toString();
        });

        child.stderr.on("data", (d) => {
            stderr += d.toString();
        });

        child.on("close", (code) => {
            if (code === 0) {
                resolve(stdout.trim());
            } else {
                reject(new Error(stderr || `Exit code ${code}`));
            }
        });

        child.on("error", reject);
    });
}

export default bashit;