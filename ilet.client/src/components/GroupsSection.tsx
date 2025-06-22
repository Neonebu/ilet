import { useEffect, useState } from "react";
import { useWebSocket, StatusUpdatePayload } from "../context/WebSocketContext"; // kendi path'ine göre ayarla
import '../styles/groupsSection.css';
import config from "../config";
type Friend = {
    id: number;
    nickname: string;
    status: string;
    email: string;
};
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
        const fetchFriends = async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(`${config.API_URL}friend/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                console.error("Arkadaşlar alınamadı:", res.status);
                return;
            }

            const data: Friend[] = await res.json();
            const currentUserId = Number(localStorage.getItem("userId"));

            // Kendini listeleme
            const filtered = data.filter(u => u.id !== currentUserId);

            const online = filtered.filter(f =>
                ["online", "busy", "away"].includes((f.status || "").toLowerCase())
            );
            const offline = filtered.filter(f =>
                !["online", "busy", "away"].includes((f.status || "").toLowerCase())
            );

            setOnlineUsers(online);
            setOfflineUsers(offline);
        };

        fetchFriends();
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
