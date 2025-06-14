type FriendRequest = {
    id: number;
    requesterNickname: string;
};

type Props = {
    requests: FriendRequest[];
    onRespond: (id: number, accept: boolean) => void;
};

const FriendRequestsSection: React.FC<Props> = ({ requests, onRespond }) => {
    if (!requests.length) return null;

    return (
        <div className="friend-requests bg-gray-100 p-2 rounded mb-3">
            <div className="font-bold text-sm mb-2">🔔 Gelen İstekler ({requests.length})</div>
            {requests.map((req) => (
                <div key={req.id} className="flex justify-between items-center mb-1">
                    <span>{req.requesterNickname}</span>
                    <div className="space-x-1">
                        <button onClick={() => onRespond(req.id, true)} className="text-green-600">
                            Kabul
                        </button>
                        <button onClick={() => onRespond(req.id, false)} className="text-red-500">
                            Reddet
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FriendRequestsSection;
