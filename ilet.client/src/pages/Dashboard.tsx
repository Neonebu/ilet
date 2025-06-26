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

export default function Dashboard() {
    const [nickname, setNickname] = useState("");
    const [userId, setUserId] = useState<number | null>(null);
    const navigate = useNavigate();
    const { t,i18n } = useTranslation();
    const [selectedLang, setSelectedLang] = useState(i18n.language);
    const [showWorlds, setShowWorlds] = useState(() => {
        const saved = localStorage.getItem("showWorlds");
        return saved === "true"; // string olduğu için eşitlik kontrolü
    });
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("Token bulunamadı. Kullanıcı yönlendirilecek.");
            navigate('/');
            return;
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
        localStorage.setItem("showWorlds", String(showWorlds));
    }, [showWorlds]);
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
                <div className="top-bar-content">
                    <SettingsMenu />
                    <button
                        className="settings-btn"
                        onClick={() => navigate("/requestlist")}
                    >
                        {t("requests")}
                    </button>

                    {/* Tick kutusu ve yanına "Worlds" yazısı */}
                    <label
                        className="worlds-toggle"
                        htmlFor="toggle-worlds"
                        style={{
                            marginLeft: "12px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                        }}
                    >
                        <input
                            id="toggle-worlds"
                            name="toggle-worlds"
                            type="checkbox"
                            checked={showWorlds}
                            onChange={(e) => setShowWorlds(e.target.checked)}
                        />
                        <span className="settings-btn" style={{ fontWeight: "bold" }}>
                            {t("Worlds")}
                        </span>
                    </label>
                </div>
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
                <Friends />
                <div className="groups-bar">
                    <GroupsSection showWorlds={showWorlds} />
                </div>
            </div>
        </div>
    );

}
