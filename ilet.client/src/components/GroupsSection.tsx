import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/groupsSection.css';
import '../styles/commonGroups.css';

export default function GroupsSection() {
    const { t } = useTranslation();
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
    const token = localStorage.getItem('token');
    useEffect(() => {
        fetch('https://iletapi.onrender.com/user/getOnlineUsers', {
            credentials: 'include',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) setOnlineUsers(data);
            });
        console.log("mounted");
    }, []);
    return (
        <>
            <div className="group-item">
                <span className="group-toggle">-</span> {t('Online')}
            </div>

            {onlineUsers
                .filter((user, index, self) => self.findIndex(u => u.id === user.id) === index)
                .map((user) => (
                    <div className="group-user" key={user.id}>
                        <img
                            src={`/user/${user.id}/profile-picture`}
                            alt={user.nickname}
                            className="group-avatar"
                        />
                        <span>{user.nickname}</span>
                    </div>
                ))}

            <div className="group-item">
                <span className="group-toggle">-</span> {t('Offline')}
            </div>
        </>
    );
}
