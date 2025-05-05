import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { WebSocketProvider } from "./context/WebSocketContext";
import { useEffect, useState } from 'react';

export default function App() {
    const token = localStorage.getItem("token") || "";
    const userId = Number(localStorage.getItem("userId")) || 0;
    const nickname = localStorage.getItem("nickname") || "";

    const [ready, setReady] = useState(false);

    useEffect(() => {
        i18n.on('initialized', () => {
            setReady(true);
        });
    }, []);

    if (!ready) return <div>Loading...</div>; // dil ayarlanana kadar beklet

    return (
        <I18nextProvider i18n={i18n}>
            <WebSocketProvider token={token} userId={userId} nickname={nickname}>
                <Router>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                    </Routes>
                </Router>
            </WebSocketProvider>
        </I18nextProvider>
    );
}
