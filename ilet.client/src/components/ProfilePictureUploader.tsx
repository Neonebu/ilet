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
                const contentLength = newPP.headers.get("Content-Length");
                const contentType = newPP.headers.get("Content-Type");

                if (newPP.status === 204 || contentLength === "0" || !contentType?.startsWith("image")) {
                    // Profil resmi yok → fallback göster
                    onUploadSuccess("");
                } else {
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
                src={!profilePicUrl || profilePicUrl === "null" ? defaultProfilePic : profilePicUrl}
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
