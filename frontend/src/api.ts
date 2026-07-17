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

// todo: create login function
// todo: create setData function
// todo: create getData function