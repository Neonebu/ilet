import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../styles/chatwindow.css";
import nudgeIcon from "../assets/nodge.png";
import config from "../config";
import { useWebSocket } from "../context/WebSocketContext";

export default function ChatWindow() {
    const { nickname } = useParams();
    const { t } = useTranslation();
    const { sendChatMessage, onChatMessage } = useWebSocket();

    const [receiverPicUrl, setReceiverPicUrl] = useState("");
    const [userPicUrl, setUserPicUrl] = useState("");
    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState<{ senderId: number; content: string }[]>([]);
    const senderId = Number(localStorage.getItem("userId"));
    const receiverId = Number(localStorage.getItem("chatWithUserId"));

    console.log("👤 senderId:", senderId);
    console.log("👤 receiverId:", receiverId);
    useEffect(() => {
        const clearChatData = () => {
            localStorage.removeItem("chatWithUserId");
            localStorage.removeItem("chatWithNickname");
        };

        window.addEventListener("beforeunload", clearChatData);

        return () => {
            window.removeEventListener("beforeunload", clearChatData);
            clearChatData(); // unmount durumunda da temizle
        };
    }, []);
    useEffect(() => {
        if (!nickname) return;

        fetch(`${config.API_URL}user/pp/${nickname}`)
            .then(res => res.blob())
            .then(blob => setReceiverPicUrl(URL.createObjectURL(blob)))
            .catch(() => setReceiverPicUrl("/fallback-profile.png"));

        fetch(`${config.API_URL}user/getpp`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(res => res.blob())
            .then(blob => setUserPicUrl(URL.createObjectURL(blob)))
            .catch(() => setUserPicUrl("/fallback-profile.png"));
    }, [nickname]);

    useEffect(() => {
        onChatMessage((data) => {
            console.log("📥 onChatMessage received:", data);
            setMessages((prev) => {
                const updated = [...prev, { senderId: data.senderId, content: data.content }];
                console.log("📚 Updated messages (after incoming):", updated);
                return updated;
            });
        });
    }, [onChatMessage]);

    const handleSendMessage = () => {
        const trimmed = messageText.trim();
        if (!trimmed) {
            console.warn("🚫 Message boş, gönderilmiyor.");
            return;
        }

        if (!receiverId) {
            console.warn("🚫 receiverId tanımsız veya geçersiz.");
            return;
        }

        console.log("📤 Sending message:", {
            senderId,
            receiverId,
            content: trimmed,
        });

        sendChatMessage({
            type: "chat-message",
            senderId,
            receiverId,
            content: trimmed,
        });

        setMessages((prev) => {
            const updated = [...prev, { senderId, content: trimmed }];
            console.log("📚 Updated messages (after send):", updated);
            return updated;
        });

        setMessageText("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleNudge = () => {
        const audio = new Audio("/sounds/nudge.mp3");
        audio.play().catch(() => { });

        const originalX = window.screenX;
        const originalY = window.screenY;
        let i = 0;

        const interval = setInterval(() => {
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetY = (Math.random() - 0.5) * 20;
            window.moveTo(originalX + offsetX, originalY + offsetY);
            i++;
            if (i > 15) {
                clearInterval(interval);
                window.moveTo(originalX, originalY);
            }
        }, 30);
    };

    return (
        <div className="msn-chat-window">
            <div className="chat-titlebar">
                <div className="title-left">
                    <img src="/msn-logo-small.png" alt="MSN" className="msn-logo" />
                    {nickname} - {t("conversation")}
                </div>
            </div>

            <div className="chat-main">
                <div className="chat-history">
                    {messages.length === 0 && <div style={{ color: "#888" }}>📭 {t("no_messages")}</div>}

                    {messages.map((msg, idx) => (
                        <div key={idx} style={{ textAlign: msg.senderId === senderId ? "right" : "left" }}>
                            <span>{msg.content}</span>
                        </div>
                    ))}

                    <div className="chat-interaction-area">
                        <div className="chat-toolbar">
                            <select><option>Font</option></select>
                            <span role="img">😊</span>
                            <span role="img">🌸</span>
                            <span>Background</span>
                            <span>
                                <img
                                    src={nudgeIcon}
                                    alt="Nudge"
                                    className="nudge-icon"
                                    onClick={handleNudge}
                                />
                            </span>
                        </div>
                        <div className="chat-input-area">
                            <div className="chat-input-wrapper">
                                <textarea
                                    className="chat-input"
                                    placeholder={t("type_message")}
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <div className="chat-buttons-bottom">
                                    <button className="btn-send" onClick={handleSendMessage}>
                                        {t("send")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="chat-profile-preview">
                    <div className="chat-profile-stack">
                        <img className="chat-profile-pic" src={receiverPicUrl} alt="Receiver" />
                    </div>
                    <img className="chat-profile-you" src={userPicUrl} alt="You" />
                </div>
            </div>
        </div>
    );
}
