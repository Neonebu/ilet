import SettingsMenu from "../components/SettingsMenu";
import ProfileSection from "../components/ProfileSection";
import GroupsSection from "../components/GroupsSection";
import defaultProfilePic from "../assets/msn-logo-small.png";
import { useState } from "react";
import '../styles/dashboard.css';
export default function Dashboard() {
    const [nickname, setNickname] = useState("");
    const [profilePicUrl, setProfilePicUrl] = useState(defaultProfilePic);
    const [selectedLang, setSelectedLang] = useState("en");

    const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value;
        setSelectedLang(newLang);
        localStorage.setItem('lang', newLang);
    };

    return (
        <div className="dashboard-container">
            <div className="top-bar">
                <SettingsMenu
                    selectedLang={selectedLang}
                    handleLangChange={handleLangChange}
                />
            </div>

            <div className="content-panel">
                <ProfileSection
                    nickname={nickname}
                    setNickname={setNickname}
                    profilePicUrl={profilePicUrl}
                    setProfilePicUrl={setProfilePicUrl}
                />
                <GroupsSection />
            </div>
        </div>
    );
}
