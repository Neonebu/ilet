import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../styles/chatwindow.css";
import nudgeIcon from "../assets/nodge.png";
import config from "../config";
import { useWebSocket } from "../context/WebSocketContext";
import { ChatMessagePayload } from "../context/WebSocketContext";

export default function ChatWindow() {
    const { nickname } = useParams();
    const { t } = useTranslation();
    const { sendChatMessage, onChatMessage } = useWebSocket();
    const chatHistoryRef = useRef<HTMLDivElement | null>(null);
    const [receiverPicUrl, setReceiverPicUrl] = useState("");
    const [userPicUrl, setUserPicUrl] = useState("");
    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState<ChatMessagePayload[]>(() => {
        const saved = localStorage.getItem("chat_messages");
        return saved ? JSON.parse(saved) : [];
    });
    const senderId = Number(localStorage.getItem("userId"));
    const senderNickname = localStorage.getItem("nickname") || "";
    const receiverId = Number(localStorage.getItem("chatWithUserId"));
    useEffect(() => {
        const clearChatData = () => {
            localStorage.removeItem("chatWithUserId");
            localStorage.removeItem("chatWithNickname");
        };
        window.addEventListener("beforeunload", clearChatData);
        return () => {
            window.removeEventListener("beforeunload", clearChatData);
        };
    }, []);
    useEffect(() => {
        const id = localStorage.getItem("chatWithUserId");
        if (!id) return;

        fetch(`${config.API_URL}user/getppbyid?id=${id}`)
            .then(res => res.blob())
            .then(blob => setReceiverPicUrl(URL.createObjectURL(blob)))
            .catch(() => setReceiverPicUrl("/fallback-profile.png"));
    }, []);
    useEffect(() => {
        const pic = localStorage.getItem("userPicUrl");
        if (pic && pic.trim() !== "") {
            setUserPicUrl(pic);
        } else {
            setUserPicUrl(""); // fallback'e yönlendirilecek
        }
    }, []);
    useEffect(() => {
        onChatMessage((data) => {
            const updated = [...messages, data];
            setMessages(updated);
            localStorage.setItem("chat_messages", JSON.stringify(updated));
        });
    }, [messages]);

    // Gelen mesajları okundu olarak işaretle
    useEffect(() => {
        const updated = messages.map(msg =>
            msg.receiverId === senderId && msg.status === "sent"
                ? { ...msg, status: "read" as const }
                : msg
        );
        setMessages(updated);
        localStorage.setItem("chat_messages", JSON.stringify(updated));
    }, []);
    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = () => {
        const trimmed = messageText.trim();
        if (!trimmed || !receiverId) return;
        const msg: ChatMessagePayload = {
            type: "chat-message",
            senderId,
            senderNickname,
            receiverId,
            content: trimmed,
            status: "sent"
        };
        sendChatMessage(msg);
        const updated = [...messages, msg];
        setMessages(updated);
        localStorage.setItem("chat_messages", JSON.stringify(updated));
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
                <div className="chat-history" ref={chatHistoryRef}>
                    {messages.length === 0 && <div style={{ color: "#888" }}>📭 {t("no_messages")}</div>}
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{ textAlign: msg.senderId === senderId ? "right" : "left" }}>
                            <strong>{msg.senderNickname}</strong>
                            <div>{msg.content}</div>
                            <span className="message-status">
                                {msg.status === "read" ? t("message_read") : t("message_sent")}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="chat-interaction-area">
                    <div className="chat-toolbar">
                        <select><option>{t("font")}</option></select>
                        <span role="img">😊</span>
                        <span role="img">🌸</span>
                        <span>{t("background")}</span>
                        <span>
                            <img src={nudgeIcon} alt="Nudge" className="nudge-icon" onClick={handleNudge} />
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

                <div className="chat-profile-preview">
                    <div className="chat-profile-stack">
                        <img className="chat-profile-pic" src={receiverPicUrl} alt="Receiver" />
                    </div>
                    <img className="chat-profile-you" src={userPicUrl || "/msn-logo-small.png"} alt="You" />
                </div>
            </div>
        </div>
    );
}
