import '../styles/profileSection.css';
/*import ProfilePictureUploader from './ProfilePictureUploader';*/
import NicknameEditor from './NicknameEditor';

interface Props {
    nickname: string;
    setNickname: (name: string) => void;
    userId: number;
}

export default function ProfileSection({ nickname, setNickname }: Props) {
    return (
        <div className="top-row">
{/*            <ProfilePictureUploader profilePicUrl={profilePicUrl} />*/}
            <div className="right-block">
                <NicknameEditor nickname={nickname} setNickname={setNickname} />
            </div>
        </div>
    );
}
