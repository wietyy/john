export async function getCloud(): Promise<string | null> {
    try {
        const response = await fetch("/api/cloud", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data?.data ?? null;
    } catch {
        return null;
    }
}

export async function setCloud(data: string): Promise<boolean> {
    try {
        const response = await fetch("/api/cloud", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ data }),
        });
        return response.ok;
    } catch {
        return false;
    }
}