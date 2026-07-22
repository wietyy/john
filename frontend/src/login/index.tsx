import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { login, createUser } from "../api";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleLogin() {
        setError("");
        setLoading(true);
        try {
            const apikey = await login(username, password);
            localStorage.setItem("apikey", apikey);
            navigate("/app");
        } catch {
            setError("Invalid username or password");
        } finally {
            setLoading(false);
        }
    }

    async function handleSignUp() {
        setError("");
        setLoading(true);
        try {
            const apikey = await createUser(username, password);
            localStorage.setItem("apikey", apikey);
            navigate("/app");
        } catch {
            setError("Username already exists");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-950">
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8">
                <h1 className="mb-6 text-center text-3xl font-bold text-white">
                    Sign In
                </h1>

                {error && (
                    <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-center text-sm text-red-400">
                        {error}
                    </p>
                )}

                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-blue-500"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-blue-500"
                    />

                    <div className="flex gap-3">
                        <button
                            onClick={handleLogin}
                            disabled={loading || !username || !password}
                            className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                        >
                            {loading ? "..." : "Login"}
                        </button>

                        <button
                            onClick={handleSignUp}
                            disabled={loading || !username || !password}
                            className="flex-1 rounded-xl border border-white/20 py-3 font-semibold text-white transition hover:border-white/50 disabled:opacity-50"
                        >
                            {loading ? "..." : "Sign Up"}
                        </button>
                    </div>
                </div>

                <Link
                    to="/"
                    className="mt-6 block text-center text-sm text-gray-500 transition hover:text-gray-300"
                >
                    Back to home
                </Link>
            </div>
        </div>
    );
}
