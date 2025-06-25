import '../styles/profileSection.css';
import NicknameEditor from './NicknameEditor';
import { useState, useEffect } from 'react';
import logo from '../assets/msn-logo.png';
import ProfilePictureUploader from './ProfilePictureUploader';
import config from '../config';

interface Props {
    nickname: string;
    setNickname: (name: string) => void;
    userId: number;
}

export default function ProfileSection({ nickname, setNickname }: Props) {
    const [profilePicUrl, setProfilePicUrl] = useState<string>("");

    useEffect(() => {
        const fetchProfilePicture = async () => {
            const token = localStorage.getItem("token");
            const response = await fetch(`${config.API_URL}user/getpp`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });

            const contentType = response.headers.get("Content-Type");
            const contentLength = response.headers.get("Content-Length");

            if (
                response.status === 204 ||
                !contentType?.startsWith("image") ||
                contentLength === "0"
            ) {
                setProfilePicUrl(""); // fallback tetiklenecek
            } else {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setProfilePicUrl(url);
            }
        };

        fetchProfilePicture();
    }, []);

    return (
        <div className="top-row">
            <ProfilePictureUploader
                profilePicUrl={profilePicUrl || logo}
                onUploadSuccess={(url) => setProfilePicUrl(url)}
            />
            <div className="right-block">
                <NicknameEditor nickname={nickname} setNickname={setNickname} />
            </div>
        </div>
    );
}
