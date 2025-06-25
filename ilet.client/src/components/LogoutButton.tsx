// LogoutButton.tsx
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function LogoutButton() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <div className="menu-item" onClick={handleLogout}>
            {t("logout")}
        </div>
    );
}
