// components/ProfileSection.tsx
import { useRef, useState, useEffect } from "react";
import defaultProfilePic from "../assets/msn-logo-small.png";
import '../styles/profileSection.css';
interface Props {
    nickname: string;
    setNickname: (name: string) => void;
    profilePicUrl: string;
    setProfilePicUrl: (url: string) => void;
}

export default function ProfileSection({ nickname, setNickname, profilePicUrl, setProfilePicUrl }: Props) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isEditingNickname, setIsEditingNickname] = useState(false);
    const [tempNickname, setTempNickname] = useState("");

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

            if (!response.ok) return;

            const data = await response.json();
            if (data.profilePictureUrl) {
                setProfilePicUrl(`${data.profilePictureUrl}?t=${Date.now()}`);
            }

        } catch (error: any) {
            console.error("Yükleme sırasında hata:", error.message);
        }
    };

    const handleSaveNickname = async () => {
        const newNickname = tempNickname.trim();
        if (newNickname !== "") {
            setNickname(newNickname);
        }
        setIsEditingNickname(false);
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
                </div>
            </div>
        </div>
    );
}
