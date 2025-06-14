import { useState } from "react";
import config from "../config";
import { useTranslation } from "react-i18next";

export default function RemoveFriend() {
    const { t } = useTranslation();
    const [identifier, setIdentifier] = useState(""); // Email veya nickname
    const [message, setMessage] = useState("");

    const handleRemoveFriend = async () => {
        setMessage("");

        const token = localStorage.getItem("token");

        const res = await fetch(`${config.API_URL}friend/remove-by-identifier`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ identifier }),
        });

        const result = await res.json();
        if (res.ok) {
            setMessage("✅ Arkadaş silindi.");
        } else {
            setMessage("❌ " + (result.message || "Bir hata oluştu."));
        }
    };

    return (
        <div className="flex flex-col items-center justify-center mt-16">
            <h1 className="text-2xl font-bold mb-4">{t("remove_friend_title")}</h1>
            <input
                type="text"
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
            {message && <p className="mt-4">{message}</p>}
        </div>
    );
}
