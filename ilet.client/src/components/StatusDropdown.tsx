import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useWebSocket } from "../context/WebSocketContext";

export default function StatusDropdown({ status, setStatus }: { status: string, setStatus: (s: string) => void }) {
    const { t } = useTranslation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { sendStatusUpdate } = useWebSocket();

    const handleStatusChange = (newStatus: string) => {
/*        console.log("🟡 Status değiştirildi:", newStatus); // ✅ log buraya*/
        setStatus(newStatus);
        const userId = Number(localStorage.getItem("userId"));
        const nickname = localStorage.getItem("nickname") ?? "anonymous";
        localStorage.setItem("status", newStatus.toLowerCase());
        sendStatusUpdate(newStatus.toLowerCase(), userId, nickname);
    };

    return (
        <div className="status-wrapper" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <span className="status-text">
                ({t(status)})
            </span>
            <span className="dropdown-arrow">▼</span>
            {dropdownOpen && (
                <ul className="status-dropdown">
                    <li onClick={() => handleStatusChange("Online")}>{t('Online')}</li>
                    <li onClick={() => handleStatusChange("Busy")}>{t('Busy')}</li>
                    <li onClick={() => handleStatusChange("Away")}>{t('Away')}</li>
                    <li onClick={() => handleStatusChange("Invisible")}>{t('Invisible')}</li>
                </ul>
            )}
        </div>
    );
}
