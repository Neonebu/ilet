import { useRef, useState, useEffect } from "react";
import defaultProfilePic from "../assets/msn-logo-small.png";
import '../styles/profileSection.css';

interface Props {
    nickname: string;
    setNickname: (name: string) => void;
    userId: number;
}

export default function ProfileSection({ nickname, setNickname, userId }: Props) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isEditingNickname, setIsEditingNickname] = useState(false);
    const [tempNickname, setTempNickname] = useState("");
    const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

    const [status, setStatus] = useState("Çevrimiçi");
    const [dropdownOpen, setDropdownOpen] = useState(false);

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
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (response.ok) {
                refreshProfilePic();
            }
        } catch (error: any) {
            console.error("Yükleme sırasında hata:", error.message);
        }
    };
    const getStatusClass = (status: string) => {
        switch (status) {
            case "Çevrimiçi": return "status-online";
            case "Meşgul": return "status-busy";
            case "Dışarıda": return "status-away";
            case "Görünmez": return "status-invisible";
            default: return "status-online";
        }
    };
    const handleSaveNickname = async () => {
        const newNickname = tempNickname.trim();
        if (newNickname !== "") {
            setNickname(newNickname);
            const token = localStorage.getItem('token');
            await fetch("https://iletapi.onrender.com/user/update", {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nickname: newNickname })
            });
        }
        setIsEditingNickname(false);
    };

    const refreshProfilePic = () => {
        setProfilePicUrl(`https://iletapi.onrender.com/user/${userId}/profile-picture?t=${Date.now()}`);
    };

    const handleStatusChange = async (newStatus: string) => {
        setStatus(newStatus);
        setDropdownOpen(false);

        const token = localStorage.getItem('token');
        await fetch("https://iletapi.onrender.com/user/update", {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });
    };


    useEffect(() => {
        if (userId) {
            refreshProfilePic();
        }
    }, [userId]);

    return (
        <div className="top-row">
            <img
                src={profilePicUrl || defaultProfilePic}
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
                                <div className="nickname-inline">
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
                                    />
                                    <div className="status-wrapper" onClick={() => setDropdownOpen(!dropdownOpen)}>
                                        <span className="status-text">({status})</span>
                                        <span className="dropdown-arrow">▼</span>
                                        {dropdownOpen && (
                                            <ul className="status-dropdown">
                                                <li onClick={() => handleStatusChange("Çevrimiçi")}>Çevrimiçi</li>
                                                <li onClick={() => handleStatusChange("Meşgul")}>Meşgul</li>
                                                <li onClick={() => handleStatusChange("Dışarıda")}>Dışarıda</li>
                                                <li onClick={() => handleStatusChange("Görünmez")}>Görünmez</li>
                                            </ul>
                                        )}
                                    </div>
                                </div>
                                <span id="nickname-measure" className="ghost-span">{tempNickname || " "}</span>
                            </>
                        ) : (
                            <div className="nickname-inline">
                                <h2
                                    className="nickname"
                                    onClick={() => {
                                        setTempNickname(nickname);
                                        setIsEditingNickname(true);
                                    }}
                                >
                                    {nickname || "Loading..."}
                                </h2>
                                    <div className="status-wrapper" onClick={() => setDropdownOpen(!dropdownOpen)}>
                                        <span className={`status-text ${getStatusClass(status)}`}>
                                            ({status})
                                        </span>
                                        <span className="dropdown-arrow">▼</span>
                                        {dropdownOpen && (
                                            <ul className="status-dropdown">
                                                <li onClick={() => handleStatusChange("Çevrimiçi")}>Çevrimiçi</li>
                                                <li onClick={() => handleStatusChange("Meşgul")}>Meşgul</li>
                                                <li onClick={() => handleStatusChange("Dışarıda")}>Dışarıda</li>
                                                <li onClick={() => handleStatusChange("Görünmez")}>Görünmez</li>
                                            </ul>
                                        )}
                                    </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
