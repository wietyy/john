export async function createUser(username: string, password: string) {
    const response = await fetch("/api/createuser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "username": username,
            "password": password
        })
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.text();
}

export async function login(username: string, password: string) {
    const response = await fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "username": username,
            "password": password
        })
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.text();
}

export async function getData(apikey: string) {
    const response = await fetch(`/api/getdata?apikey=${encodeURIComponent(apikey)}`);
    if (!response.ok) throw new Error(await response.text());
    return await response.text();
}

export async function setData(apikey: string, data: any) {
    const response = await fetch("/api/setdata", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "apikey": apikey,
            "data": data
        })
    });
    if (!response.ok) throw new Error(await response.text());
}