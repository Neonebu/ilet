import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function StatusDropdown({status, setStatus }: { status: string, setStatus: (s: string) => void }) {
    const { t } = useTranslation();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <div className="status-wrapper" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <span className="status-text">
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
