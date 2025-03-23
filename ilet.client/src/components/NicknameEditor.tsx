import { useState } from "react";
import { useTranslation } from "react-i18next";
import StatusDropdown from "./StatusDropdown";

interface Props {
    nickname: string;
    setNickname: (name: string) => void;
}

export default function NicknameEditor({ nickname, setNickname }: Props) {
    const [isEditingNickname, setIsEditingNickname] = useState(false);
    const [tempNickname, setTempNickname] = useState("");
    const [status, setStatus] = useState("Online");
    const { t } = useTranslation();

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
                                onKeyDown={(e) => e.key === "Enter" && setIsEditingNickname(false)}
                                onBlur={() => setIsEditingNickname(false)}
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
