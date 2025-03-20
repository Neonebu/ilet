import { useEffect, useRef, useState } from "react";
import { BsEnvelopeFill } from "react-icons/bs";
import profilePic from "../assets/msn-logo-small.png";
import "./dashboard.css";

export default function Dashboard() {
    const [nickname, setNickname] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        fetch("https://iletapi.onrender.com/user/getUser", {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(async (res) => {
                if (!res.ok) {
                    console.error("API Hata:", res.status);
                    return;
                }
                const data = await res.json();
                console.log("API Response:", data);
                setNickname(data.nickname || "No Nickname");
            })
            .catch((err) => console.error(err));
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
                    // Content-Type belirtmiyoruz! fetch kendisi ayarlıyor (boundary ekliyor)
                },
                body: formData,
            });

            if (!response.ok) {
                console.error("Yükleme hatası:", response.status);
                return;
            }

            const data = await response.json();
            console.log("Yükleme başarılı:", data);
            // Burada yüklenen resmin URL'sini dönerse img src'sini güncelleyebilirsin.

        } catch (error) {
            console.error("Yükleme sırasında hata:", error);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="top-bar"></div>
            <div className="content-panel">
                <div className="top-row">
                    <img
                        src={profilePic}
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
                            <h2 className="nickname">{nickname || "Loading..."}</h2>
                            <span className="status-text">(Online)</span>
                            <span className="down-arrow">▼</span>
                        </div>
                        <div className="personal-message">
                            <input type="text" placeholder="Type a personal message" />
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
