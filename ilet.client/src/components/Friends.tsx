import { useState } from "react";
import "../styles/friends.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';

const Friends = () => {
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState("");
    const navigate = useNavigate();
    const { t } = useTranslation();
    const handleCancel = () => {
        setEmail("");
        setShowModal(false);
    };
    const handleRedirectToAddFriend = () => {
        navigate("/add-friend");
    };
    const handleRedirectToRemoveFriend = () => {
        navigate("/remove-friend");
    };
    const handleAddFriend = () => {
        console.log("Adding friend:", email);
        // WebSocket veya API call burada olabilir
        setEmail("");
        setShowModal(false);
    };

    return (
        <>
            <div className="section-bar"> 
                <div className="section-title">{t("Mail")}</div>
                <div className="friend-actions">
                    <button className="friend-btn" onClick={handleRedirectToAddFriend}>
                        ➕ {t("Add Friend")}
                    </button>
                    <button className="friend-btn" onClick={handleRedirectToRemoveFriend}>
                        ❌ {t("Remove Friend")}
                    </button>
                </div>
            </div>  
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <span className="modal-title">Add a Friend</span>
                        </div>

                        <div className="modal-body">
                            <input
                                type="text"
                                placeholder="Enter email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="friend-input"
                            />
                            <div className="modal-buttons">
                                <button className="friend-btn small" onClick={handleAddFriend}>Add</button>
                                <button className="friend-btn small" onClick={handleCancel}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
};

export default Friends;
