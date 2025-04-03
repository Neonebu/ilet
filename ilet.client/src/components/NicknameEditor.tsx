import { useState } from "react";
import StatusDropdown from "./StatusDropdown";
import config from "../config";

interface Props {
    nickname: string;
    setNickname: (name: string) => void;
}

export default function NicknameEditor({ nickname, setNickname }: Props) {
    const [isEditingNickname, setIsEditingNickname] = useState(false);
    const [tempNickname, setTempNickname] = useState("");
    const [status, setStatus] = useState(localStorage.getItem("status") || "Online");
    const handleSaveNickname = async () => {
        const newNickname = tempNickname.trim();
        if (newNickname !== "" && newNickname !== nickname) {
            setNickname(newNickname);

            const token = localStorage.getItem('token');
            await fetch(`${config.API_URL}user/update`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nickname: newNickname })
            });
        }
        setIsEditingNickname(false);
    };

    return (
        <div className="nickname-line">
            <div className="nickname-wrapper">
                {isEditingNickname ? (
                    <>
                        <div className="nickname-inline">
                            <input
                                type="text"
                                value={tempNickname}
                                autoFocus
                                onChange={(e) => setTempNickname(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSaveNickname()}
                                onBlur={handleSaveNickname}
                                className="nickname-input"
                            />
                            <StatusDropdown status={status} setStatus={setStatus} />
                        </div>
                        <span id="nickname-measure" className="ghost-span">{tempNickname || " "}</span>
                    </>
                ) : (
                    <div className="nickname-inline">
                        <h2
                            className="nickname"
                            onClick={() => {
                                setTempNickname(nickname);
                                setIsEditingNickname(true);
                            }}
                        >
                            {nickname || "Loading..."}
                        </h2>
                        <StatusDropdown status={status} setStatus={setStatus} />
                    </div>
                )}
            </div>
        </div>
    );
}
