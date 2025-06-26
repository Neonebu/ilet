import { useEffect, useState } from "react";
import { useWebSocket, StatusUpdatePayload } from "../context/WebSocketContext";
import '../styles/groupsSection.css';
import '../styles/userCard.css';
import config from "../config";
import { useTranslation } from "react-i18next";

type Friend = {
    id: number;
    nickname: string;
    status: string;
    email: string;
};
type GroupsSectionProps = {
    showWorlds: boolean;
};
const GroupsSection = ({ showWorlds }: GroupsSectionProps) => {
    const { onStatusUpdate } = useWebSocket();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<Friend[]>([]);
    const [offlineUsers, setOfflineUsers] = useState<Friend[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [worldUsers, setWorldUsers] = useState<Friend[]>([]);
    const { t } = useTranslation();
    const [hoveredUserId, setHoveredUserId] = useState<number | null>(null);
    useEffect(() => {
        if (!showWorlds) {
            setWorldUsers([]);
            return;
        }

        const shuffled = [...onlineUsers].sort(() => 0.5 - Math.random());
        const fullFriends = shuffled.slice(0, 10).map(user => ({
            ...user,
            status: "online",
            email: ""
        }));
        setWorldUsers(fullFriends);
    }, [showWorlds, onlineUsers]);
    useEffect(() => {
        const handleStatusUpdate = (data: StatusUpdatePayload) => {
            const isFriend = friends.some(f => f.id === data.userId);
            if (!isFriend) return;

            const updatedUser: Friend = {
                id: data.userId,
                nickname: data.nickname,
                email: "", // bilinmiyor ama boş geç
                status: data.status
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

    const handleUserClick = (user: Friend) => {
        setSelectedUserId(user.id);
        const width = 800;
        const height = 400;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const url = `/chat/${encodeURIComponent(user.nickname)}`;
        localStorage.setItem("chatWithUserId", user.id.toString());
        localStorage.setItem("chatWithNickname", user.nickname);
        localStorage.setItem("selectedUserEmail", user.email); // ✅ email de eklendi
        window.open(
            url,
            `chat_with_${user.id}`,
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
    };
    return (
        <div>
            {/* Çevrimiçi kullanıcılar */}
            <span className="group-label">
                <u>{t("online_users", { count: onlineUsers.length })}</u>
            </span>
            {onlineUsers.map(user => (
                <div
                    key={user.id}
                    className="user-item-wrapper"
                    onMouseEnter={() => setHoveredUserId(user.id)}
                    onMouseLeave={() => setHoveredUserId(null)}
                >
                    <div
                        className="user-item"
                        onClick={() => handleUserClick(user)}
                        style={{
                            cursor: 'pointer',
                            backgroundColor: selectedUserId === user.id ? '#eef3ff' : 'transparent'
                        }}
                    >
                        🟢 {user.nickname}
                    </div>
                    {hoveredUserId === user.id && (
                        <div className="user-hover-card">
                            <img
                                src={`${config.API_URL}user/getppbyid?id=${user.id}`}
                                alt="pp"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/msn-logo-small.png";
                                }}
                            />
                            <div className="user-hover-card-nick">{user.nickname}</div>
                        </div>
                    )}
                </div>
            ))}

            <br />

            {/* Çevrimdışı kullanıcılar */}
            <span className="group-label">
                <u>{t("offline_users", { count: offlineUsers.length })}</u>
            </span>
            {offlineUsers.map(user => (
                <div
                    key={user.id}
                    className="user-item-wrapper"
                    onMouseEnter={() => setHoveredUserId(user.id)}
                    onMouseLeave={() => setHoveredUserId(null)}
                >
                    <div className="user-item">
                        ⚫ {user.nickname}
                    </div>
                    {hoveredUserId === user.id && (
                        <div className="user-hover-card">
                            <img
                                src={`${config.API_URL}user/getppbyid?id=${user.id}`}
                                alt="pp"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/msn-logo-small.png";
                                }}
                            />
                            <div className="user-hover-card-nick">{user.nickname}</div>
                        </div>
                    )}
                </div>
            ))}

            <br />

            {/* Worlds bölümü */}
            <span className="group-label">
                <u>{t("Worlds")}</u>
            </span>
            {worldUsers.map(user => (
                <div
                    key={user.id}
                    className="user-item-wrapper"
                    onMouseEnter={() => setHoveredUserId(user.id)}
                    onMouseLeave={() => setHoveredUserId(null)}
                >
                    <div className="user-item">
                        🌍 {user.nickname}
                    </div>
                    {hoveredUserId === user.id && (
                        <div className="user-hover-card">
                            <img
                                src={`${config.API_URL}user/getppbyid?id=${user.id}`}
                                alt="pp"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/msn-logo-small.png";
                                }}
                            />
                            <div className="user-hover-card-nick">{user.nickname}</div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

};

export default GroupsSection;
