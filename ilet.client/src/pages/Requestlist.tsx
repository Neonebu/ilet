import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import config from "../config";
import '../styles/requestList.css';

type FriendRequestDto = {
    id: number;
    requesterId: number;
    requesterEmail: string;
    requesterNickname: string;
    status: number; // 0: pending, 1: accepted, 2: rejected (opsiyonel)
};

export default function Requestlist() {
    const { t } = useTranslation();
    const [requests, setRequests] = useState<FriendRequestDto[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [triggeredSearch, setTriggeredSearch] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`${config.API_URL}friend/requests`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log("🔥 API'den gelen friend request verisi:", data); // ← BURAYA
                setRequests(data);
            });
    }, []);


    const handleSearch = () => {
        setTriggeredSearch(searchTerm);
    };

    const handleRespond = async (requesterId: number, accepted: boolean) => {
        await fetch(`${config.API_URL}friend/respond`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ requesterId, accepted })
        });
        setRequests(prev =>
            prev.map(r =>
                r.requesterId === requesterId
                    ? { ...r, status: accepted ? 1 : 2 }
                    : r
            )
        );
    };

    const filteredRequests = requests.filter(r =>
        (r.requesterEmail || r.requesterNickname)
            .toLowerCase()
            .includes(triggeredSearch.toLowerCase())
    );

    return (
        <div className="requestlist-page">
            <div className="requestlist-header">
                <h1>{t("request_title")}</h1>
                <button
                    className="dashboard-button"
                    onClick={() => window.location.href = "/dashboard"}
                >
                    ↩ Dashboard
                </button>
            </div>

            <div className="search-bar-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search by email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') handleSearch();
                    }}
                />
                <button
                    className="search-button"
                    onClick={handleSearch}
                    title="Search"
                >
                    🔍
                </button>
            </div>

            {filteredRequests.length === 0 ? (
                <p>{t("no_friend_requests")}</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {filteredRequests.map((r: FriendRequestDto) => (
                        <div key={r.id} className="request-card">
                            <span style={{ fontWeight: "bold" }}>
                                {r.requesterNickname || r.requesterEmail}
                            </span>
                            {r.status === 1 ? (
                                <span className="status-accepted">✅ Accepted</span>
                            ) : r.status === 2 ? (
                                <span className="status-rejected">❌ Rejected</span>
                            ) : (
                                <div className="response-buttons">
                                    <button onClick={() => handleRespond(r.requesterId, true)}>
                                        ✅ {t("accept")}
                                    </button>
                                    <button onClick={() => handleRespond(r.requesterId, false)}>
                                        ❌ {t("reject")}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
