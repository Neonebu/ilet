import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function StatusDropdown({status, setStatus }: { status: string, setStatus: (s: string) => void }) {
    const { t } = useTranslation();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleStatusChange = async (newStatus: string) => {
        setStatus(newStatus);
        setDropdownOpen(false);
        const token = localStorage.getItem('token');
        await fetch("https://iletapi.onrender.com/user/update", {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case "Çevrimiçi": return "status-online";
            case "Meşgul": return "status-busy";
            case "Dışarıda": return "status-away";
            case "Görünmez": return "status-invisible";
            default: return "status-online";
        }
    };

    return (
        <div className="status-wrapper" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <span className={`status-text`}>
                ({t(status)})
            </span>
            <span className="dropdown-arrow">▼</span>
            {dropdownOpen && (
                <ul className="status-dropdown">
                    <li onClick={() => setStatus("Online")}>Online</li>
                    <li onClick={() => setStatus("Busy")}>Busy</li>
                    <li onClick={() => setStatus("Away")}>Away</li>
                    <li onClick={() => setStatus("Invisible")}>Invisible</li>
                </ul>
            )}
        </div>
    );
}
