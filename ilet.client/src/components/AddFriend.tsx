import { useState } from "react";
import config from "../config";
import { useTranslation } from "react-i18next";

export default function AddFriend() {
    const { t } = useTranslation();
    const [identifier, setIdentifier] = useState(""); // Email veya nickname
    const [message, setMessage] = useState("");

    const handleAddFriend = async () => {
        setMessage("");

        const token = localStorage.getItem("token");

        const res = await fetch(`${config.API_URL}friend/add-by-identifier`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ identifier }),
        });

        const result = await res.json();
        if (res.ok) {
            setMessage("✅ Arkadaşlık isteği gönderildi.");
        } else {
            setMessage("❌ " + (result.message || "Bir hata oluştu."));
        }
    };

    return (
        <div className="flex flex-col items-center justify-center mt-16">
            <h1 className="text-2xl font-bold mb-4">{t("add_friend_title")}</h1>
            <input
                type="text"
                className="border p-2 rounded w-72"
                placeholder={t("Mail")}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
            />
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded mt-3"
                onClick={handleAddFriend}
            >
                {t("send_friend_request")}
            </button>
            {message && <p className="mt-4">{message}</p>}
        </div>
    );
}
