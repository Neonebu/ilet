import '../styles/worldsSection.css';
import '../styles/commonGroups.css';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

interface User {
    id: number;
    nickname: string;
    status: string;
}

interface Props {
    profilePicUrl: string | null;
    nickname: string;
    status: string;
    userId: number | null;
    groupUsers: Array<{ id: number; name: string; avatar: string; status: string; }>;
}

export default function WorldsSection({ userId }: Props) {
    const { t } = useTranslation();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token || userId === null) return;

        const fetchAllUsers = async () => {
            try {
                const response = await fetch('https://iletapi.onrender.com/user/getAllUsers', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    const filteredData = data.filter((user: User) => user.id !== userId);
                    setAllUsers(filteredData);
                } else {
                    console.error("getAllUsers fetch failed:", response.status);
                }
            } catch (err) {
                console.error("getAllUsers fetch error:", err);
            }
        };

        fetchAllUsers();
    }, [token, userId]);

    return (
        <>
            <div className="group-item group-header">
                <span className="group-toggle">-</span> {t('Worlds')}
            </div>

            {allUsers.map((user) => (
                <div className="group-user" key={user.id}>
                    {/*<img*/}
                    {/*    src={`/user/${user.id}/profile-picture`}*/}
                    {/*    alt={user.nickname}*/}
                    {/*    className="group-avatar"*/}
                    {/*/>*/}
                    <span className="nickname-text">{user.nickname}</span>
                </div>
            ))}
        </>
    );
}
