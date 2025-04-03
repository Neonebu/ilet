import '../styles/profileSection.css';
import NicknameEditor from './NicknameEditor';
import { useState, useEffect } from 'react'; // useState eksik
import logo from '../assets/msn-logo.png'; // logo eksik
import ProfilePictureUploader from './ProfilePictureUploader';
import config from '../config';

interface Props {
    nickname: string;
    setNickname: (name: string) => void;
    userId: number;
}
export default function ProfileSection({ nickname, setNickname }: Props) {
    const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
    useEffect(() => {
        const fetchProfilePicture = async () => {
            const token = localStorage.getItem("token");
            const response = await fetch(`${config.API_URL}user/getpp`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });

            if (response.ok) {
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
                profilePicUrl={profilePicUrl ?? logo}
                onUploadSuccess={(url) => setProfilePicUrl(url)}
            />
            <div className="right-block">
                <NicknameEditor nickname={nickname} setNickname={setNickname} />
            </div>
        </div>
    );
}
