import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/groupsSection.css';
import '../styles/commonGroups.css';
import greenBuddy from '../assets/green-buddy.png';
import grayBuddy from '../assets/gray-buddy.png';

export default function GroupsSection() {
    const { t } = useTranslation();
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
    const [offlineUsers, setOfflineUsers] = useState<any[]>([]);
    const token = localStorage.getItem('token');
    const userId = Number(localStorage.getItem('userId'));

    useEffect(() => {
        const ws = new WebSocket('wss://iletapi.onrender.com/ws');

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: 'auth', token }));
        };

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

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const [onlineRes, offlineRes] = await Promise.all([
                    fetch('https://iletapi.onrender.com/user/getOnlineUsers', {
                        credentials: 'include',
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('https://iletapi.onrender.com/user/getOfflineUsers', {
                        credentials: 'include',
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (onlineRes.ok) {
                    const data = await onlineRes.json();
                    setOnlineUsers(data);
                }

                if (offlineRes.ok) {
                    const data = await offlineRes.json();
                    setOfflineUsers(data);
                }

            } catch (err) {
                console.error('Fetch users error:', err);
            }
        };

        fetchUsers();
    }, [token]);

    return (
        <>
            <div className="group-item">
                <span className="group-toggle">-</span> {t('Online')}
            </div>
            {onlineUsers
                .filter(user => user.id !== userId)
                .map((user) => (
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
            {offlineUsers
                .filter(user => user.id !== userId)
                .map((user) => (
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
