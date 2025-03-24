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
    const currentUserId = Number(localStorage.getItem('userId'));
    const currentUserStatus = localStorage.getItem('status'); // "online" ya da "offline"
    useEffect(() => {
        fetch('https://iletapi.onrender.com/user/getOnlineUsers', {
            credentials: 'include',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) setOnlineUsers(data);
            });
        // Offline users fetch
        fetch('https://iletapi.onrender.com/user/getOfflineUsers', {
            credentials: 'include',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) setOfflineUsers(data);
            });
        console.log("mounted");
    }, []);
    return (
        <>
            <div className="group-item">
                <span className="group-toggle">-</span> {t('Online')}
            </div>
            {onlineUsers
                .filter(user => user.id !== currentUserId || currentUserStatus !== 'offline')
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
                .filter(user => user.id !== currentUserId || currentUserStatus !== 'online')
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
