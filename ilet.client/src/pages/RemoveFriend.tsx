import { useState } from "react";
import config from "../config";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import '../styles/addremovefriends.css';

export default function RemoveFriend() {
    const { t } = useTranslation();
    const [identifier, setIdentifier] = useState(""); // Email
    const navigate = useNavigate();
    const [message, setMessage] = useState("");

    const handleRemoveFriend = async () => {
        setMessage("");

        if (!identifier.trim()) {
            alert(t("remove_friend_empty_error"));
            return;
        }

        if (!identifier.includes("@")) {
            alert(t("remove_friend_invalid_email"));
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${config.API_URL}friend/remove`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ email: identifier }),
            });

            const result = await res.json();

            if (res.ok) {
                setMessage("✅ " + t("remove_friend_success"));
                navigate("/dashboard");
            } else {
                const msg = result.message?.toLowerCase() || "";
                if (msg.includes("not found") || msg.includes("bulunamadı")) {
                    setMessage("❌ " + t("remove_friend_not_found"));
                } else if (msg.includes("not your friend") || msg.includes("arkadaş değilsiniz")) {
                    setMessage("❌ " + t("remove_friend_not_friend"));
                } else {
                    setMessage("❌ " + (result.message || t("remove_friend_error")));
                }
            }
        } catch (error) {
            setMessage("❌ " + t("remove_friend_network_error"));
        }
    };

    return (
        <div className="remove-friend-container">
            <div className="requestlist-header">
                <h3>{t("remove_friend_title")}</h3>
                <button
                    className="dashboard-button"
                    onClick={() => window.location.href = "/dashboard"}
                >
                    ↩ Dashboard
                </button>
            </div>
            <input
                type="email"
                name="remove-friend-email"
                autoComplete="email"
                className="border p-2 rounded w-72"
                placeholder={t("Mail")}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
            />
            <button
                className="bg-red-500 text-white px-4 py-2 rounded mt-3"
                onClick={handleRemoveFriend}
            >
                {t("remove_friend_button")}
            </button>
            {message && (
                <p className="mt-4" style={{ color: message.startsWith("✅") ? "green" : "red" }}>
                    {message}
                </p>
            )}
        </div>
    );
}
