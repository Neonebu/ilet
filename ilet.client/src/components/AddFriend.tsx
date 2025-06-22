import { useState,useEffect } from "react";
import config from "../config";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import '../styles/addremovefriends.css'; // aynı css ile uyumlu

export default function AddFriend() {
    const { t } = useTranslation();
    const [identifier, setIdentifier] = useState(""); // Email veya nickname
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const handleAddFriend = async () => {
        setMessage("");

        if (!identifier.trim()) {
            alert(t("add_friend_empty_error"));
            return;
        }

        const token = localStorage.getItem("token");

        try {
            console.log("📤 Sending request to:", `${config.API_URL}friend/add-friend`);
            console.log("📦 Payload:", { identifier });
            console.log("🔐 Token:", token);

            const res = await fetch(`${config.API_URL}friend/add-friend`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ identifier }),
            });

            const result = await res.json();
            console.log("📥 Response:", result);

            if (res.ok) {
                setMessage("✅ " + t("add_friend_success"));
                navigate("/dashboard");
            } else {
                setMessage("❌ " + (result.message || t("add_friend_error")));
            }
        } catch (error) {
            console.error("❌ Network error during add-friend:", error);
            setMessage("❌ " + t("add_friend_network_error"));
        }
    };
    return (
        <div className="remove-friend-container">
            <h1 className="remove-title-bar">{t("add_friend_title")}</h1>
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
            {message && <p className="mt-4">{message}</p>}
        </div>
    );
}
