import { useRef } from "react";
import defaultProfilePic from "../assets/msn-logo-small.png";

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
            const response = await fetch("https://iletapi.onrender.com/user/uploadProfilePic", {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                onUploadSuccess(url);
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
