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
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
            .then((res) => {
                if (!res.ok) throw new Error("HTTP error " + res.status);
                return res.text();
            })
            .then((text) => {
                if (text) {
                    const json = JSON.parse(text);
                    setOnlineUsers(json);
                }
            })
            .catch((err) => {
                console.error(err);
            });

    }, []);

    return (
        <>
            <div className="group-item">
                <span className="group-toggle">-</span> {t('Online')}
            </div>

            {onlineUsers.map((user) => (
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
