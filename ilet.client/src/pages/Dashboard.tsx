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

export default function Dashboard() {
    const [nickname, setNickname] = useState("");
    const [userId, setUserId] = useState<number | null>(null);
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const [selectedLang, setSelectedLang] = useState(i18n.language);
    //const token = localStorage.getItem("token") ?? "";
    const handleLangChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value;
        i18n.changeLanguage(newLang);
        setSelectedLang(newLang);
        localStorage.setItem('lang', newLang);
        // backend'e kaydet:
        const token = localStorage.getItem('token');
        await fetch(`${config.API_URL}user/update`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ language: newLang })
        });
    };

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
                    key={selectedLang}
                    selectedLang={selectedLang}
                    handleLangChange={handleLangChange}
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
                <div className="groups-bar">
                    <GroupsSection/>
                </div>
            </div>
        </div>
    );

}
