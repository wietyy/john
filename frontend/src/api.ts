// todo: test this shit
export async function createUser(username: string, password: string) {
    const response = await fetch("/createuser", {
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

// todo: test this shit
export async function login(username: string, password: string) {
    const response = await fetch("/login", {
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

//todo: test this shit
export async function getData(apikey: string) {
    const response = await fetch("/data", {
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

// todo: test this shit
export async function setData(apikey: string, data: JSON) {
    const response = await fetch("/data", {
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
// todo: create setData function
// todo: create getData function