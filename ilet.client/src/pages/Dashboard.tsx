import { useEffect, useRef, useState } from "react";
import { BsEnvelopeFill } from "react-icons/bs";
import defaultProfilePic from "../assets/msn-logo-small.png";
import "./dashboard.css";
import { useTranslation } from 'react-i18next';
import i18n from "../i18n";
export default function Dashboard() {
    const [nickname, setNickname] = useState<string>("");
    const [profilePicUrl, setProfilePicUrl] = useState<string>(defaultProfilePic);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isEditingNickname, setIsEditingNickname] = useState(false);
    const [tempNickname, setTempNickname] = useState("");
    const { t } = useTranslation();
    const handleSaveNickname = async () => {
        const newNickname = tempNickname.trim();
        if (newNickname !== "") {
            setNickname(newNickname);
            setIsEditingNickname(false);

            const token = localStorage.getItem('token');
            try {
                await fetch("https://iletapi.onrender.com/user/update", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        nickname: newNickname,
                        status: null,
                        profilePicturePath: null
                    })
                });
                console.log("Nickname backend'e başarıyla güncellendi");
            } catch (error) {
                console.error("API hatası:", error);
            }
        } else {
            setIsEditingNickname(false);
        }
    };
    const [selectedLang, setSelectedLang] = useState("en");

    const handleLangChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value;
        setSelectedLang(newLang);
        i18n.changeLanguage(newLang);
        localStorage.setItem('lang', newLang); // ✅

        const token = localStorage.getItem('token');
        await fetch("https://iletapi.onrender.com/user/update", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                nickname: nickname,
                status: null,
                profilePicturePath: null,
                language: newLang
            })
        });
    };


    useEffect(() => {
        if (isEditingNickname) {
            const span = document.getElementById("nickname-measure");
            const input = fileInputRef.current;
            if (span && input) {
                const spanWidth = span.offsetWidth;
                input.style.width = `${spanWidth}px`;
            }
        }
    }, [tempNickname, isEditingNickname]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchUser = async () => {
            try {
                const res = await fetch("https://iletapi.onrender.com/user/getUser", {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) {
                    console.error("API Hata:", res.status);
                    return;
                }

                const data = await res.json();
                setNickname(data.nickname || "No Nickname");
                if (data.profilePictureUrl) {
                    const fixedUrl = data.profilePictureUrl.replace('http://', 'https://');
                    setProfilePicUrl(`${fixedUrl}?t=${Date.now()}`);
                }

                // 🔴 Burada dil ayarını çekip uygula:
                if (data.language) {
                    i18n.changeLanguage(data.language);
                    setSelectedLang(data.language);
                    localStorage.setItem('lang', data.language);
                }

            } catch (err) {
                console.error("Network hata:", err);
            }
        };
        fetchUser();
    }, []);


    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleProfileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            const response = await fetch("https://iletapi.onrender.com/user/uploadProfilePic", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                console.error("Yükleme hatası:", response.status);
                return;
            }

            const data = await response.json();
            console.log("Yükleme başarılı:", data);

            if (data.profilePictureUrl) {
                setProfilePicUrl(`${data.profilePictureUrl}?t=${Date.now()}`);
            }

        } catch (error: any) {
            console.error("Yükleme sırasında hata:", error.message);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="top-bar">
                <div className="top-bar-content">
                    <div ref={dropdownRef} className={`settings-dropdown ${isDropdownOpen ? "open" : ""}`}>
                        <button
                            className="settings-btn"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            {t('settings')}
                        </button>
                        <div className="settings-menu">
                            <div className="menu-item">Profile</div>
                            <div className="menu-item">Logout</div>
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
            </div>
            <div className="content-panel">
                <div className="top-row">
                    <img
                        src={profilePicUrl}
                        alt="profile"
                        className="profile-icon"
                        onClick={handleProfileClick}
                        style={{ cursor: 'pointer' }}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                    <div className="right-block">
                        <div className="nickname-line">
                            <div className="nickname-wrapper">
                                {isEditingNickname ? (
                                    <>
                                        <input
                                            type="text"
                                            value={tempNickname}
                                            autoFocus
                                            onChange={(e) => setTempNickname(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleSaveNickname();
                                                }
                                            }}
                                            onBlur={handleSaveNickname}
                                            className="nickname-input"
                                            ref={fileInputRef}
                                        />
                                        <span id="nickname-measure" className="ghost-span">{tempNickname || " "}</span>
                                    </>
                                ) : (
                                    <h2
                                        className="nickname"
                                        onClick={() => {
                                            setTempNickname(nickname);
                                            setIsEditingNickname(true);
                                        }}
                                    >
                                        {nickname || "Loading..."}
                                    </h2>
                                )}
                            </div>

                            <div className="status-wrapper">
                                <span className="status-text">{t('Online')}</span>
                                <span className="down-arrow">▼</span>
                            </div>
                        </div>


                        <div className="personal-message">
                            <input type="text" placeholder={t('type_message')} />
                            <span className="down-arrow">▼</span>
                        </div>
                    </div>
                </div>

                <div className="mail-bar">
                    <BsEnvelopeFill className="mail-icon" />
                    <span>(0)</span>
                </div>
                <div className="groups-bar">
                    <div className="group-item">
                        <span className="group-toggle">-</span> Online
                    </div>
                    <div className="group-item">
                        <span className="group-toggle">-</span> Offline
                    </div>
                    <div className="group-item">
                        <span className="group-toggle">-</span> World
                    </div>
                </div>
            </div>
        </div>
    );
}
