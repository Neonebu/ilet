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
import ToastManager from "./components/ToastManager";

// 📌 Route tanımları (chat için nickname + id kullanılıyor)
function RoutesWrapper() {
    const location = useLocation();

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard key={location.key} />} />
            <Route path="/add-friend" element={<AddFriend />} />
            <Route path="/remove-friend" element={<RemoveFriend />} />
            <Route path="/requestlist" element={<Requestlist />} />
            <Route path="/chat/:nickname/:id" element={<ChatWindow />} />
        </Routes>
    );
}

// 📌 Mesaj geldiğinde yeni pencere açan dinleyici
function WebSocketChatHandler() {
    const { onChatMessage } = useWebSocket();
    const location = useLocation();
    useEffect(() => {
        onChatMessage((payload) => {
            if (payload.type !== "chat-message") return;

            const myUserId = Number(localStorage.getItem("userId"));
            if (payload.receiverId !== myUserId) return;

            const myStatus = localStorage.getItem("status");
            if (!["Online", "Busy", "Away"].includes(myStatus || "")) return;

            const currentPath = location.pathname;
            const isChatOpen = currentPath.includes(`/chat/`);
            const openedId = currentPath.split("/").pop();
            const isSameChatOpen = isChatOpen && openedId === String(payload.senderId);

            if (!isSameChatOpen) {
                const shouldOpen = confirm(`${payload.senderNickname} size mesaj gönderdi. Yeni pencere açılsın mı?`);
                if (!shouldOpen) return;

                const chatUrl = `/chat/${encodeURIComponent(payload.senderNickname)}/${payload.senderId}`;
                const windowName = `chat_${payload.senderId}`;
                const win = window.open(chatUrl, windowName, "width=500,height=620");

                if (!win) {
                    console.warn("🧨 Pencere açılamadı. Tarayıcı popup engellemiş olabilir.");
                } else {
                    console.log(`💬 Yeni sohbet penceresi açıldı: ${chatUrl}`);
                }
            }
        });
    }, []);

    return null;
}

// 📌 Ana uygulama bileşeni
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
                    <ToastManager />
                </Router>
            </WebSocketProvider>
        </I18nextProvider>
    );
}