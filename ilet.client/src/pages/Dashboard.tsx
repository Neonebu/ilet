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
import { ErrorBoundary } from "../pages/ErrorBoundary"; // en üste ekle

export default function Dashboard() {
    console.log("🚀 Dashboard component mount edildi");

    const [nickname, setNickname] = useState("");
    const [userId, setUserId] = useState<number | null>(null);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [selectedLang, setSelectedLang] = useState(i18n.language);
    const [showWorlds, setShowWorlds] = useState(() => {
        const saved = localStorage.getItem("showWorlds");
        console.log("🌍 showWorlds localStorage'dan geldi:", saved);
        return saved === "true";
    });
    const [showDeletePopup, setShowDeletePopup] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log("🎫 Token kontrolü:", token);

        if (!token) {
            console.error("❌ Token bulunamadı. navigate('/') yapılacak.");
            navigate('/');
            return;
        }

        const fetchUser = async () => {
            console.log("📡 fetchUser başlatıldı");

            try {
                const res = await fetch(`${config.API_URL}user/getUser`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                console.log("🌐 getUser yanıt kodu:", res.status);

                if (!res.ok) {
                    console.error("❌ Kullanıcı alınamadı, status:", res.status);
                    navigate('/');
                    return;
                }

                const data = await res.json();
                console.log("👤 getUser cevabı:", data);

                setNickname(data.nickname);
                setUserId(data.id);
                setSelectedLang(data.language || 'en');
                i18n.changeLanguage(data.language || 'en');
            } catch (err) {
                console.error("❌ fetchUser error:", err);
                navigate('/');
            }
        };

        fetchUser();
    }, [navigate]);

    useEffect(() => {
        console.log("💾 showWorlds güncellendi:", showWorlds);
        localStorage.setItem("showWorlds", String(showWorlds));
    }, [showWorlds]);

    useEffect(() => {
        console.log("↩️ Geri tuşu event listener eklendi");

        const handleBackButton = () => {
            console.warn("🔙 Geri tuşuna basıldı, kullanıcı çıkışı yapılacak");
            localStorage.removeItem('token');
            localStorage.removeItem('nickname');
            navigate('/');
        };

        window.onpopstate = handleBackButton;

        return () => {
            console.log("🧹 Geri tuşu event listener temizlendi");
            window.onpopstate = null;
        };
    }, [navigate]);

    console.log("📌 Render aşamasında userId:", userId, "| nickname:", nickname);

    return (
        <div className="dashboard-container">
            <div className="top-bar">
                <div className="top-bar-content">
                    <SettingsMenu />
                    <button className="settings-btn" onClick={() => navigate("/requestlist")}>
                        {t("requests")}
                    </button>
                    <label className="worlds-toggle" htmlFor="toggle-worlds" style={{ marginLeft: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
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
                    <button className="delete-account-btn" style={{ marginLeft: "12px" }} onClick={() => setShowDeletePopup(true)}>
                        Hesabı Sil
                    </button>
                </div>
            </div>

            <div className="content-panel">
                {userId !== null ? (
                    <>
                        <ErrorBoundary>
                            <ProfileSection
                                key={`profile-${selectedLang}`}
                                nickname={nickname}
                                setNickname={setNickname}
                                userId={userId}
                            />
                        </ErrorBoundary>

                        <ErrorBoundary>
                            <Friends />
                        </ErrorBoundary>

                        <ErrorBoundary>
                            <div className="groups-bar">
                                <GroupsSection showWorlds={showWorlds} />
                            </div>
                        </ErrorBoundary>
                    </>
                ) : (
                    <p style={{ color: 'red', padding: '2rem' }}>🔒 userId null, içerik gösterilmiyor</p>
                )}
            </div>
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

