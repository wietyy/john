async function api(path, options = {}) {
    const res = await fetch(path, options);
    if (!res.ok) throw new Error(await res.text());
    return res.text();
}

const errorEl = document.getElementById("error");
const usernameEl = document.getElementById("username");
const passwordEl = document.getElementById("password");

function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.add("show");
}

function hideError() {
    errorEl.classList.remove("show");
}

function goApp(apikey) {
    localStorage.setItem("apikey", apikey);
    window.location.href = "/app";
}

async function withValidation(fn) {
    hideError();
    if (!usernameEl.value.trim() || !passwordEl.value) {
        showError("Enter a username and password");
        return;
    }
    const btn = document.activeElement;
    if (btn) btn.disabled = true;
    try {
        await fn();
    } catch (e) {
        showError(e.message === "Username already exists"
            ? "Username already exists"
            : "Invalid username or password");
    } finally {
        if (btn) btn.disabled = false;
    }
}

document.getElementById("login-btn").addEventListener("click", () => {
    withValidation(async () => {
        const apikey = await api("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: usernameEl.value,
                password: passwordEl.value,
            }),
        });
        goApp(apikey);
    });
});

document.getElementById("signup-btn").addEventListener("click", () => {
    withValidation(async () => {
        const apikey = await api("/api/createuser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: usernameEl.value,
                password: passwordEl.value,
            }),
        });
        goApp(apikey);
    });
});

passwordEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        document.getElementById("login-btn").click();
    }
});