import { useEffect, useState } from "react";
import { useWebSocket, StatusUpdatePayload } from "../context/WebSocketContext";
import '../styles/groupsSection.css';
import config from "../config";
import { useTranslation } from "react-i18next";

type Friend = {
    id: number;
    nickname: string;
    status: string;
    email: string;
};

const GroupsSection = () => {
    const { onStatusUpdate } = useWebSocket();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<{ id: number; nickname: string }[]>([]);
    const [offlineUsers, setOfflineUsers] = useState<{ id: number; nickname: string }[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const handleStatusUpdate = (data: StatusUpdatePayload) => {
            const isFriend = friends.some(f => f.id === data.userId);
            if (!isFriend) return;

            const updatedUser = {
                id: data.userId,
                nickname: data.nickname,
            };

            setOnlineUsers(prev => prev.filter(u => u.id !== data.userId));
            setOfflineUsers(prev => prev.filter(u => u.id !== data.userId));

            const status = data.status.toLowerCase();

            if (["online", "busy", "away"].includes(status)) {
                setOnlineUsers(prev => [...prev, updatedUser]);
            } else if (["offline", "invisible"].includes(status)) {
                setOfflineUsers(prev => [...prev, updatedUser]);
            }
        };

        onStatusUpdate(handleStatusUpdate);
    }, [onStatusUpdate, friends]);

    useEffect(() => {
        const fetchFriends = async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(`${config.API_URL}friend/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) return;

            const data: Friend[] = await res.json();
            const online = data.filter(f => ["online", "busy", "away"].includes((f.status || "").toLowerCase()));
            const offline = data.filter(f => ["offline", "invisible"].includes((f.status || "").toLowerCase()));

            setFriends(data);
            setOnlineUsers(online);
            setOfflineUsers(offline);
        };

        fetchFriends();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.user-item')) {
                setSelectedUserId(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleUserClick = (user: { id: number; nickname: string }) => {
        setSelectedUserId(user.id);
        const width = 800;
        const height = 400;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const url = `/chat/${encodeURIComponent(user.nickname)}`;
        localStorage.setItem("chatWithUserId", user.id.toString());
        localStorage.setItem("chatWithNickname", user.nickname);
        window.open(
            url,
            `chat_with_${user.id}`,
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
    };

    return (
        <div>
            <span className="group-label">
                <u>{t("online_users", { count: onlineUsers.length })}</u>
            </span>
            {onlineUsers.map(user => (
                <div
                    key={user.id}
                    className="user-item"
                    onClick={() => handleUserClick(user)}
                    style={{
                        cursor: 'pointer',
                        backgroundColor: selectedUserId === user.id ? '#eef3ff' : 'transparent'
                    }}
                >
                    🟢 {user.nickname}
                </div>
            ))}
            <br />
            <span className="group-label">
                <u>{t("offline_users", { count: offlineUsers.length })}</u>
            </span>
            {offlineUsers.map(user => (
                <div key={user.id}>⚫ {user.nickname}</div>
            ))}
        </div>
    );
};

export default GroupsSection;
