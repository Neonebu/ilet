import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/groupsSection.css';
import '../styles/commonGroups.css';

export default function GroupsSection() {
    const { t } = useTranslation();
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

    useEffect(() => {
        fetch('/getOnlineUsers', { credentials: 'include' })
            .then(res => res.json())
            .then(data => setOnlineUsers(data));
    }, []);

    return (
        <>
            <div className="group-item">
                <span className="group-toggle">-</span> {t('Online')}
            </div>
            {onlineUsers.map(user => (
                <div className="group-user" key={user.id}>
                    <img src={`/user/${user.id}/profile-picture`} className="group-avatar" />
                    <span>{user.nickname}</span>
                </div>
            ))}

            <div className="group-item">
                <span className="group-toggle">-</span> {t('Offline')}
            </div>
        </>
    );
}
