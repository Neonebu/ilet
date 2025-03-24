import '../styles/worldsSection.css';
import '../styles/commonGroups.css';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
interface Props {
    profilePicUrl: string | null;
    nickname: string;
    status: string;
    userId: number | null;
    groupUsers: Array<{ id: number; name: string; avatar: string; status: string; }>;
}

export default function WorldsSection({ profilePicUrl, userId }: Props) {
    const { t } = useTranslation();
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const token = localStorage.getItem('token');

    console.log("UserId "+userId);
    console.log("profilePicUrl:", profilePicUrl);
    useEffect(() => {
        fetch('https://iletapi.onrender.com/user/getAllUsers', {
            credentials: 'include',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) setAllUsers(data);
            });
    }, []);

    return (
        <>
            <div className="group-item group-header">
                <span className="group-toggle">-</span> {t('Worlds')}
            </div>

            {allUsers.map((user) => (
                <div className="group-user" key={user.id}>
                    <img
                        src={`/user/${user.id}/profile-picture`}
                        alt={user.nickname}
                        className="group-avatar"
                    />
                </div>
            ))}
        </>
    );

}
