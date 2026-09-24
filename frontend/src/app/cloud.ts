export async function getCloud(password: string): Promise<string> {
    const response = await fetch("/api/getCloudData", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
    });
    const data = await response.json();
    return data.data ?? "";
}

export async function setCloud(password: string, data: string): Promise<string> {
    const response = await fetch("/api/setCloudData", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, data }),
    });
    const result = await response.json();
    return result.result ?? "error";
}