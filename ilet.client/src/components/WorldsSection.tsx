import defaultProfilePic from "../assets/msn-logo-small.png";
import '../styles/worldsSection.css';
import '../styles/commonGroups.css';
import GroupsWrapper from "./GroupsWrapper";

interface Props {
    profilePicUrl: string | null;
    nickname: string;
    status: string;
    userId: number | null;
    groupUsers: Array<{ id: number; name: string; avatar: string; status: string; }>;
}

export default function WorldsSection({ profilePicUrl, nickname, userId, status, groupUsers }: Props) {
    const getStatusClass = (status: string) => {
        switch (status) {
            case "Çevrimiçi": return "status-online";
            case "Meşgul": return "status-busy";
            case "Dışarıda": return "status-away";
            case "Görünmez": return "status-invisible";
            default: return "status-online";
        }
    };
    console.log(userId);
    return (
        <GroupsWrapper>
            <div className="group-item group-header">
                <span className="group-toggle">-</span> Worlds
            </div>

            <div className="group-user-item">
                <img
                    src={profilePicUrl ? `${profilePicUrl}?t=${Date.now()}` : defaultProfilePic}
                    alt="profile"
                    className="small-avatar"
                />
                <span className="group-nickname user-nickname">{nickname}</span>
                <span className={`status-dot ${getStatusClass(status)}`}></span>
            </div>

            {groupUsers.map(user => (
                <div className="group-user-item" key={user.id}>
                    <img
                        src={`https://iletapi.onrender.com/uploads/${user.avatar}`}
                        alt="avatar"
                        className="small-avatar"
                    />
                    <span className="group-nickname">{user.name}</span>
                    <span className={`status-dot ${getStatusClass(user.status)}`}></span>
                </div>
            ))}
        </GroupsWrapper>
    );

}
