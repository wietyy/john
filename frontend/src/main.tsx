import { createRoot } from 'react-dom/client'
import { Routes, Route, HashRouter } from "react-router";
import App from './app';
import Login from './login';
import Home from './home';


createRoot(document.getElementById('root')!).render(
    <HashRouter>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/app" element={<App />} />
            <Route path="/login" element={<Login />} />
        </Routes>
    </HashRouter>
);
