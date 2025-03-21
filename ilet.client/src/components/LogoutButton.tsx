// LogoutButton.tsx
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <div className="menu-item" onClick={handleLogout}>
            Logout
        </div>
    );
}
