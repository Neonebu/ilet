import { BsEnvelopeFill } from "react-icons/bs";
import profilePic from "../assets/msn-logo-small.png";
import "./dashboard.css";

const Dashboard = () => {
    return (
        <div className="dashboard-container">
            <div className="top-bar"></div>
            <div className="content-panel">
                <div className="top-row">
                    <img src={profilePic} alt="profile" className="profile-icon" />
                    <div className="right-block">
                        <div className="nickname-line">
                            <h2 className="nickname">YourNickname</h2>
                            <span className="status-text">(Online)</span>
                            <span className="down-arrow">▼</span>
                        </div>
                        <div className="personal-message">
                            <input type="text" placeholder="Type a personal message" />
                            <span className="down-arrow">▼</span>
                        </div>
                    </div>
                </div>

                <div className="mail-bar">
                    <BsEnvelopeFill className="mail-icon" />
                    <span>(0)</span>
                </div>
                <div className="groups-bar">
                    <div className="group-item">
                        <span className="group-toggle">-</span> Online
                    </div>
                    <div className="group-item">
                        <span className="group-toggle">-</span> Offline
                    </div>
                    <div className="group-item">
                        <span className="group-toggle">-</span> World
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
