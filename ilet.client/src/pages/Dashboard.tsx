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
import '../styles/removePopup.css'; // CSS dosyasını içe aktar

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
    const [showDeletePopup, setShowDeletePopup] = useState(false);
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

                    {/* ✅ Hesabı Sil butonu */}
                    <button
                        className="delete-account-btn"
                        style={{ marginLeft: "12px" }}
                        onClick={() => setShowDeletePopup(true)}
                    >
                        Hesabı Sil
                    </button>
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

            {/* ✅ Popup onay kutusu */}
            {showDeletePopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <p>Hesabınızı silmek istiyor musunuz?</p>
                        <div className="popup-buttons">
                            <button
                                onClick={async () => {
                                    if (!userId) {
                                        alert("Kullanıcı ID bulunamadı.");
                                        return;
                                    }

                                    try {
                                        const response = await fetch(`${config.API_URL}users/deleteUser?userId=${userId}`, {
                                            method: "GET",
                                        });

                                        if (response.ok) {
                                            alert("Hesabınız silindi.");
                                            localStorage.clear();
                                            navigate("/");
                                        } else {
                                            const error = await response.text();
                                            alert("❌ Hata: " + error);
                                        }
                                    } catch (err) {
                                        console.error("Hesap silme hatası:", err);
                                        alert("Sunucu hatası.");
                                    }

                                    setShowDeletePopup(false);
                                }}
                            >
                                Evet
                            </button>
                            <button onClick={() => setShowDeletePopup(false)}>Hayır</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );


}
