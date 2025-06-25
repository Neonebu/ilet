import { useState, useRef } from "react";
import { useTranslation } from 'react-i18next';
import LogoutButton from './LogoutButton';
import config from "../config"; // API_URL içeriyor olmalı
import '../styles/settingsMenu.css';

export default function SettingsMenu() {
    const { t, i18n } = useTranslation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedLang = i18n.language;

    const handleLangChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value;
        i18n.changeLanguage(newLang);
        localStorage.setItem("language", newLang);
        setIsDropdownOpen(false); // 👈 dropdown'ı kapat
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        const email = localStorage.getItem("email"); // veya girişte gelen user.Emai
        if (token && userId) {
            await fetch(`${config.API_URL}user/update`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email,
                    language: newLang
                })
            });
        }
    };
    return (
            <div ref={dropdownRef} className={`settings-dropdown ${isDropdownOpen ? "open" : ""}`}>
                <button
                    className="settings-btn"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    {t('settings')}
                </button>
                <div className="settings-menu">
                    <LogoutButton />
                    <div className="menu-item">
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
                            {t("language")}
                        </label>
                        <select
                            value={selectedLang}
                            onChange={handleLangChange}
                            style={{ width: "100%", fontSize: "12px" }}
                        >
                            <option value="en">English</option>
                            <option value="tr">Türkçe</option>
                            <option value="fr">Français</option>
                            <option value="zh">中文</option>
                        </select>
                    </div>
                </div>
            </div>
    );
}
