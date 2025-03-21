import { useState, useRef } from "react";
import { useTranslation } from 'react-i18next';
import LogoutButton from './LogoutButton';
import '../styles/settingsMenu.css';
interface Props {
    selectedLang: string;
    handleLangChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function SettingsMenu({ selectedLang, handleLangChange }: Props) {
    const { t } = useTranslation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    return (
        <div className="top-bar-content">
            <div ref={dropdownRef} className={`settings-dropdown ${isDropdownOpen ? "open" : ""}`}>
                <button
                    className="settings-btn"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    {t('settings')}
                </button>
                <div className="settings-menu">
                    <LogoutButton />
                    <div className="menu-item">Theme</div>
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
        </div>
    );
}
