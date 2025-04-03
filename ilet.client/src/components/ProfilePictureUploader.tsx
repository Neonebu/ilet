import { useRef } from "react";
import defaultProfilePic from "../assets/msn-logo-small.png";
import config from "../config";

interface Props {
    profilePicUrl: string;
    onUploadSuccess: (url: string) => void;
}

export default function ProfilePictureUploader({ profilePicUrl, onUploadSuccess }: Props) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

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
            const response = await fetch(`${config.API_URL}user/uploadProfilePic`, {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (response.ok) {
                const newPP = await fetch(`${config.API_URL}user/getpp`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (newPP.ok) {
                    const blob = await newPP.blob();
                    const url = URL.createObjectURL(blob);
                    onUploadSuccess(url);
                }
            }
        } catch (error: any) {
            console.error("Yükleme sırasında hata:", error.message);
        }
    };

    return (
        <>
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
        </>
    );
}
