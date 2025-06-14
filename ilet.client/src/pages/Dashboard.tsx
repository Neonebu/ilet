import SettingsMenu from "../components/SettingsMenu";
import ProfileSection from "../components/ProfileSection";
import GroupsSection from "../components/GroupsSection";
import { useState, useEffect } from "react";
import '../styles/dashboard.css';
//import WorldsSection from "../components/WorldsSection";
//import logo from '../assets/msn-logo.png';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import config from "../config";
import Friends from "../components/Friends";
import FriendRequestsSection from "../components/FriendRequestsSection"; // yolunu doğru ayarla

export default function Dashboard() {
    const [nickname, setNickname] = useState("");
    const [userId, setUserId] = useState<number | null>(null);
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const [selectedLang, setSelectedLang] = useState(i18n.language);
    const [requests, setRequests] = useState<FriendRequestDto[]>([]);
    type FriendRequestDto = {
        id: number;
        requesterNickname: string;
    };
    const handleRespond = async (id: number, accept: boolean) => {
        const token = localStorage.getItem("token");

        await fetch(`${config.API_URL}friends/respond`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ friendshipId: id, accept }),
        });

        // İsteği listeden çıkar
        setRequests((prev) => prev.filter((r) => r.id !== id));
    };

    useEffect(() => {
        const fetchRequests = async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(`${config.API_URL}friends/requests`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setRequests(data);
        };

        fetchRequests();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("Token bulunamadı. Kullanıcı yönlendirilecek.");
            navigate('/');
            return;
        }
        else {
            
        }
        const fetchUser = async () => {
            try {
                const res = await fetch(`${config.API_URL}user/getUser`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) {
                    console.error("Kullanıcı alınamadı, yetkisiz:", res.status);
                    navigate('/');
                    return;
                }
                const data = await res.json();
                setNickname(data.nickname);
                setUserId(data.id);
                setSelectedLang(data.language || 'en');
                i18n.changeLanguage(data.language || 'en');
            } catch (err) {
                console.error("fetchUser error:", err);
                navigate('/');
            }
        };

        fetchUser();
    }, [navigate]);

    useEffect(() => {
        const handleBackButton = () => {
            // logout işlemi
            localStorage.removeItem('token');
            localStorage.removeItem('nickname');
            navigate('/'); // anasayfa veya login route
        };

        window.onpopstate = handleBackButton;

        return () => {
            window.onpopstate = null;
        };
    }, [navigate]);
    return (
        <div className="dashboard-container">
            <div className="top-bar">
                <SettingsMenu
                />
            </div>
            <div className="content-panel">
                {userId !== null && (
                    <ProfileSection
                        key={`profile-${selectedLang}`}
                        nickname={nickname}
                        setNickname={setNickname}
                        userId={userId}
                    />
                )}
                <FriendRequestsSection requests={requests} onRespond={handleRespond} />
                <Friends /> {/* Yeni Friends bileşeni */}
                <div className="groups-bar">
                    <GroupsSection />
                </div>
            </div>
        </div>
    );


}
