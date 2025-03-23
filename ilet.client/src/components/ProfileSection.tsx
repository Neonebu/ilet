import '../styles/profileSection.css';
import ProfilePictureUploader from './ProfilePictureUploader';
import NicknameEditor from './NicknameEditor';

interface Props {
    nickname: string;
    setNickname: (name: string) => void;
    userId: number;
    profilePicUrl: string;
}

export default function ProfileSection({ nickname, profilePicUrl }: Props) {
    return (
        <div className="top-row">
            <ProfilePictureUploader profilePicUrl={profilePicUrl} />
            <div className="right-block">
                <NicknameEditor nickname={nickname}/>
            </div>
        </div>
    );
}
