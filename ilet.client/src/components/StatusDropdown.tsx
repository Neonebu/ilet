import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useWebSocket } from "../context/WebSocketContext";
interface Props {
    status: string;
    setStatus: (s: string) => void;
    nickname: string; // ✅ dışarıdan alınacak
}
export default function StatusDropdown({ status, setStatus, nickname }: Props) {
    const { t } = useTranslation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { sendStatusUpdate } = useWebSocket();

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus);
        localStorage.setItem("status", newStatus.toLowerCase());

        const userId = Number(localStorage.getItem("userId"));
        sendStatusUpdate(newStatus.toLowerCase(), userId, nickname); // ✅ güncel nickname dışarıdan gelir
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