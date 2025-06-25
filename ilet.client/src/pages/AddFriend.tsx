import { useState } from "react";
import config from "../config";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import '../styles/addremovefriends.css';

export default function AddFriend() {
    const { t } = useTranslation();
    const [identifier, setIdentifier] = useState(""); // Email veya nickname
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleAddFriend = async () => {
        setMessage("");

        if (!identifier.trim()) {
            alert(t("add_friend_empty_error"));
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${config.API_URL}friend/add-friend`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ identifier }),
            });

            const result = await res.json();

            if (res.ok) {
                setMessage("✅ " + t("add_friend_success"));
                alert(t("friend_request_success_alert"));
                navigate("/dashboard");
            } else {
                // özel mesaj kontrolü
                const msg = result.message?.toLowerCase() || "";
                if (msg.includes("zaten") || msg.includes("already") || msg.includes("existing")) {
                    setMessage("❌ " + t("add_friend_duplicate_error"));
                } else {
                    setMessage("❌ " + (result.message || t("add_friend_error")));
                }
            }
        } catch (error) {
            console.error("❌ Network error during add-friend:", error);
            setMessage("❌ " + t("add_friend_network_error"));
        }
    };

    return (
        <div className="remove-friend-container">
            <div className="requestlist-header">
                <h3>{t("add_friend_title")}</h3>
                <button
                    className="dashboard-button"
                    onClick={() => window.location.href = "/dashboard"}
                >
                    ↩ {t("dashboard")}
                </button>
            </div>
            <input
                type="text"
                name="add-friend-identifier"
                autoComplete="off"
                className="border p-2 rounded w-72"
                placeholder={t("Mail")}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
            />
            <button
                className="bg-blue-600 text-white px-4 py-2 rounded mt-3"
                onClick={handleAddFriend}
            >
                {t("send_friend_request")}
            </button>

            {message && (
                <p className="mt-4" style={{ color: message.startsWith("✅") ? "green" : "red" }}>
                    {message}
                </p>
            )}
        </div>
    );
}
