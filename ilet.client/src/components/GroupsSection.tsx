import { useEffect, useState } from "react";
import { useWebSocket, StatusUpdatePayload } from "../context/WebSocketContext"; // kendi path'ine göre ayarla
import '../styles/groupsSection.css';
const GroupsSection = () => {
    const { onStatusUpdate } = useWebSocket(); // burada hook'u çekiyoruz
    const [onlineUsers, setOnlineUsers] = useState<{ id: number; nickname: string }[]>([]);
    const [offlineUsers, setOfflineUsers] = useState<{ id: number; nickname: string }[]>([]);
    useEffect(() => {
        const handleStatusUpdate = (data: StatusUpdatePayload) => {
            console.log("📡 Gelen status-update verisi:", data);
            const updatedUser = {
                id: data.userId,
                nickname: data.nickname,
            };

            // Önce her iki listeden de çıkar (güncel durumu yansıtmak için)
            setOnlineUsers((prev) => prev.filter((u) => u.id !== data.userId));
            setOfflineUsers((prev) => prev.filter((u) => u.id !== data.userId));

            // Statüye göre uygun listeye ekle
            if (["online", "busy", "away"].includes(data.status.toLowerCase())) {
                setOnlineUsers((prev) => [...prev, updatedUser]);
            } else {
                setOfflineUsers((prev) => [...prev, updatedUser]);
            }
        };
        onStatusUpdate(handleStatusUpdate); // işte bu satır callback ekliyor ✅
        // cleanup gerekiyorsa burada yapılabilir
    }, [onStatusUpdate]);
    useEffect(() => {
        const userId = Number(localStorage.getItem("userId"));
        const nickname = localStorage.getItem("nickname") ?? "";
        const status = localStorage.getItem("status") ?? "offline";

        const currentUser = { id: userId, nickname };
        const isOnline = ["online", "busy", "away"].includes(status.toLowerCase());

        if (isOnline) {
            setOnlineUsers((prev) => {
                if (!prev.some((u) => u.id === userId)) return [...prev, currentUser];
                return prev;
            });
        } else {
            setOfflineUsers((prev) => {
                if (!prev.some((u) => u.id === userId)) return [...prev, currentUser];
                return prev;
            });
        }
    }, []);

    return (
        <div>
            <span className="group-label"><u>Online ({onlineUsers.length})</u></span>
            {onlineUsers.map(user => (
                <div key={user.id}>🟢 {user.nickname}</div>
            ))}
            <br />
            <span className="group-label"><u>Offline ({offlineUsers.length})</u></span>
            {offlineUsers.map(user => (
                <div key={user.id}>⚫ {user.nickname}</div>
            ))}
        </div>
    );
};

export default GroupsSection;
