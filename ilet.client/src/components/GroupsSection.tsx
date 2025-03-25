import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/groupsSection.css';
import '../styles/commonGroups.css';
import greenBuddy from '../assets/green-buddy.png';
import grayBuddy from '../assets/gray-buddy.png';

interface User {
    id: number;
    nickname: string;
}

export default function GroupsSection() {
    const { t } = useTranslation();
    const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
    const [offlineUsers, setOfflineUsers] = useState<User[]>([]);

    const token = localStorage.getItem('token');
    const userId = Number(localStorage.getItem('userId'));

    // WebSocket bağlantısı ve kullanıcı durumu güncellemeleri
    useEffect(() => {
        if (!token || !userId) return;

        const ws = new WebSocket(`wss://iletapi.onrender.com/ws?token=${token}`);

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'status-update' && data.userId !== userId) {
                    if (data.status === 'online') {
                        setOfflineUsers(prev => prev.filter(u => u.id !== data.userId));
                        setOnlineUsers(prev => {
                            if (prev.some(u => u.id === data.userId)) return prev;
                            return [...prev, { id: data.userId, nickname: data.nickname }];
                        });
                    } else if (data.status === 'offline') {
                        setOnlineUsers(prev => prev.filter(u => u.id !== data.userId));
                        setOfflineUsers(prev => {
                            if (prev.some(u => u.id === data.userId)) return prev;
                            return [...prev, { id: data.userId, nickname: data.nickname }];
                        });
                    }
                }
            } catch (err) {
                console.error('WebSocket JSON parse error:', err);
            }
        };

        return () => {
            ws.close();
        };
    }, [token, userId]);

    // Başlangıçta online ve offline kullanıcıları çek
    useEffect(() => {
        if (!token || !userId) return;

        const fetchData = async () => {
            const headers = {
                Authorization: `Bearer ${token}`
            };

            try {
                const onlineRes = await fetch("https://iletapi.onrender.com/user/getOnlineUsers", { headers });
                const offlineRes = await fetch("https://iletapi.onrender.com/user/getOfflineUsers", { headers });
                if (onlineRes.ok) {
                    const data = await onlineRes.json();
                    const filteredData = data.filter((user: any) => user.id !== userId);
                    setOnlineUsers(filteredData);
                }

                if (offlineRes.ok) {
                    const data = await offlineRes.json();
                    const filteredData = data.filter((user: any) => user.id !== userId);
                    setOfflineUsers(filteredData);
                }
            } catch (error) {
                console.error("Kullanıcı listesi çekilirken hata:", error);
            }
        };

        fetchData();
    }, [token, userId]);

    return (
        <>
            <div className="group-item">
                <span className="group-toggle">-</span> {t('Online')}
            </div>
            {onlineUsers.map((user) => (
                <div className="group-user" key={user.id}>
                    <span className="nickname-with-icon">
                        <img src={greenBuddy} alt="online icon" className="msn-icon" />
                        {user.nickname}
                    </span>
                </div>
            ))}

            <div className="group-item">
                <span className="group-toggle">-</span> {t('Offline')}
            </div>
            {offlineUsers.map((user) => (
                <div className="group-user" key={user.id}>
                    <span className="nickname-with-icon">
                        <img src={grayBuddy} alt="offline icon" className="msn-icon" />
                        {user.nickname}
                    </span>
                </div>
            ))}
        </>
    );
}
