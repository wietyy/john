import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Data } from "../data";

export default function App() {
    const navigate = useNavigate();

    useEffect(() => {
        const apikey = localStorage.getItem("apikey");
        if (!apikey) {
            navigate("/login");
            return;
        }

        const store = new Data(apikey);
        store.loadLocal();
    }, []);

    return (
        <div>
            <h1>Hello World</h1>
        </div>
    );
}