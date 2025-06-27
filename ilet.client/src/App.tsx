import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { WebSocketProvider } from "./context/WebSocketContext";
import { useEffect, useState } from 'react';
import AddFriend from "./pages/AddFriend";
import RemoveFriend from "./pages/RemoveFriend";
import Requestlist from "./pages/Requestlist";
import ChatWindow from "./pages/ChatWindow";

// 💡 Router dışında tanımlanmış olan RoutesWrapper ile çözüm uygulanıyor
function RoutesWrapper({ token, userId, nickname }: { token: string; userId: number; nickname: string }) {
    const location = useLocation();

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard key={location.key} />} />
            <Route path="/add-friend" element={<AddFriend />} />
            <Route path="/remove-friend" element={<RemoveFriend />} />
            <Route path="/requestlist" element={<Requestlist />} />
            <Route path="/chat/:nickname" element={<ChatWindow />} />
        </Routes>
    );
}

export default function App() {
    const token = localStorage.getItem("token") || "";
    const userId = Number(localStorage.getItem("userId")) || 0;
    const nickname = localStorage.getItem("nickname") || "";

    const [ready, setReady] = useState(false);

    useEffect(() => {
        console.log("🔁 i18n init durumu:", i18n.isInitialized);

        if (i18n.isInitialized) {
            console.log("✅ i18n zaten hazır");
            setReady(true);
        } else {
            console.log("⏳ i18n hazır değil, 'initialized' eventi beklenecek");
            i18n.on('initialized', () => {
                console.log("✅ i18n 'initialized' eventi geldi");
                setReady(true);
            });
        }
    }, []);

    useEffect(() => {
        console.log("🎯 Uygulama ready durumu:", ready);
    }, [ready]);

    if (!ready) return <div>Loading...</div>; // dil ayarlanana kadar beklet

    return (
        <I18nextProvider i18n={i18n}>
            <WebSocketProvider token={token} userId={userId} nickname={nickname}>
                <Router>
                    <RoutesWrapper token={token} userId={userId} nickname={nickname} />
                </Router>
            </WebSocketProvider>
        </I18nextProvider>
    );
}
