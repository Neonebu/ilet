import '../styles/profileSection.css';
import ProfilePictureUploader from './ProfilePictureUploader';
import NicknameEditor from './NicknameEditor';

interface Props {
    nickname: string;
    setNickname: (name: string) => void;
    userId: number;
    profilePicUrl: string;
}

export default function ProfileSection({ nickname, setNickname, userId, profilePicUrl }: Props) {
    return (
        <div className="top-row">
            <ProfilePictureUploader profilePicUrl={profilePicUrl} userId={userId} />
            <div className="right-block">
                <NicknameEditor nickname={nickname} setNickname={setNickname} />
            </div>
        </div>
    );
}
