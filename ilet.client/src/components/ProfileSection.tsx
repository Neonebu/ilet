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
                // upload sonrası pp url'yi yenile
                refreshProfilePic();
            }
        } catch (error: any) {
            console.error("Yükleme sırasında hata:", error.message);
        }
    };

    const handleSaveNickname = async () => {
        const newNickname = tempNickname.trim();
        if (newNickname !== "") {
            setNickname(newNickname);
            // Opsiyonel: burada nickname update API çağırabilirsiniz
        }
        setIsEditingNickname(false);
    };

    const refreshProfilePic = () => {
        setProfilePicUrl(`https://iletapi.onrender.com/user/${userId}/profile-picture?t=${Date.now()}`);
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
                </div>
            </div>
        </div>
    );
}
