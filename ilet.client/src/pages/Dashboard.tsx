import SettingsMenu from "../components/SettingsMenu";
import ProfileSection from "../components/ProfileSection";
import GroupsSection from "../components/GroupsSection";
import { useState } from "react";
import '../styles/dashboard.css';
import { useEffect } from "react";
export default function Dashboard() {
    const [nickname, setNickname] = useState("");
    const [selectedLang, setSelectedLang] = useState("en");
    const [userId, setUserId] = useState<number | null>(null);

    const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value;
        setSelectedLang(newLang);
        localStorage.setItem('lang', newLang);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchUser = async () => {
            const res = await fetch("https://iletapi.onrender.com/user/getUser", {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                console.error("API Hata:", res.status);
                return;
            }

            const data = await res.json();
            setNickname(data.nickname || "No Nickname");
            setUserId(data.id); // işte burası eksikti!
        };

        fetchUser();
    }, []);

    return (
        <div className="dashboard-container">
            <div className="top-bar">
                <SettingsMenu
                    selectedLang={selectedLang}
                    handleLangChange={handleLangChange}
                />
            </div>

            <div className="content-panel">
                {userId !== null && (
                    <ProfileSection
                        nickname={nickname}
                        setNickname={setNickname}
                        userId={userId}
                    />
                )}
                <GroupsSection />
            </div>
        </div>
    );
}
