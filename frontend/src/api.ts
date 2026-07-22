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
    const apikey = await response.text();
    return apikey;
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
    const apikey = await response.text();
    return apikey;
}

export async function getData(apikey: string) {
    const response = await fetch("/api/data", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "apikey": apikey
        })
    });
    const data = await response.json();
    return data;
}

export async function setData(apikey: string, data: JSON) {
    const response = await fetch("/api/data", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "apikey": apikey,
            "data": data
        })
    });
    return response.ok;
}