import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { WebSocketProvider, useWebSocket } from "./context/WebSocketContext";
import { useEffect, useState } from 'react';
import AddFriend from "./pages/AddFriend";
import RemoveFriend from "./pages/RemoveFriend";
import Requestlist from "./pages/Requestlist";
import ChatWindow from "./pages/ChatWindow";

// Wrapper component to access location.key for forcing re-mount
function RoutesWrapper() {
    const location = useLocation();

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard key={location.key} />} />
            <Route path="/add-friend" element={<AddFriend />} />
            <Route path="/remove-friend" element={<RemoveFriend />} />
            <Route path="/requestlist" element={<Requestlist />} />
            {/* 🔧 updated route: includes nickname and userId */}
            <Route path="/chat/:nickname/:id" element={<ChatWindow />} />
        </Routes>
    );
}

// Yeni pencere açan WebSocket mesaj dinleyicisi
function WebSocketChatHandler() {
    const { onChatMessage } = useWebSocket();
    const location = useLocation();

    useEffect(() => {
        onChatMessage((payload) => {
            if (payload.type !== "chat-message") return;

            const myStatus = localStorage.getItem("status");
            if (!["Online", "Busy", "Away"].includes(myStatus || "")) return;

            const currentPath = location.pathname;
            const currentOpen = currentPath.includes(`/chat/`);
            const openedNickname = decodeURIComponent(currentPath.split("/chat/")[1] || "");

            if (!currentOpen || openedNickname !== payload.senderNickname) {
                console.log("💬 Yeni mesaj geldi, pencere açılıyor:", payload.senderNickname);

                // Yeni pencere için sohbet URL'si userId ile birlikte
                const chatUrl = `/chat/${encodeURIComponent(payload.senderNickname)}/${payload.senderId}`;
                const win = window.open(chatUrl, "_blank", "width=500,height=620");

                if (!win) {
                    console.warn("🧨 Pencere açılamadı. Tarayıcı popup engellemiş olabilir.");
                }
            }
        });
    }, []);

    return null;
}

export default function App() {
    const token = localStorage.getItem("token") || "";
    const userId = Number(localStorage.getItem("userId")) || 0;
    const nickname = localStorage.getItem("nickname") || "";

    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (i18n.isInitialized) {
            setReady(true);
        } else {
            i18n.on('initialized', () => setReady(true));
        }
    }, []);

    if (!ready) return <div>Loading...</div>;

    return (
        <I18nextProvider i18n={i18n}>
            <WebSocketProvider token={token} userId={userId} nickname={nickname}>
                <Router>
                    <WebSocketChatHandler />
                    <RoutesWrapper />
                </Router>
            </WebSocketProvider>
        </I18nextProvider>
    );
}
