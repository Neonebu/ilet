import React, { createContext, useEffect, useRef, useContext } from "react";
import config from "../config";

export type ChatMessagePayload = {
    type: "chat-message";
    senderId: number;
    senderNickname: string;
    receiverId: number;
    content: string;
    status: "sent" | "delivered" | "read";
};

export type StatusUpdatePayload = {
    type: "status-update";
    userId: number;
    nickname: string;
    status: string;
};

export type NudgePayload = {
    type: "nudge";
    senderId: number;
    receiverId: number;
};

type WebSocketContextType = {
    ws: WebSocket | null;
    sendStatusUpdate: (status: string, userId: number, nickname: string) => void;
    onStatusUpdate: (callback: (data: StatusUpdatePayload) => void) => void;

    sendChatMessage: (payload: ChatMessagePayload) => void;
    onChatMessage: (callback: (data: ChatMessagePayload) => void) => void;

    sendNudge: (payload: NudgePayload) => void;
    onNudge: (callback: (data: NudgePayload) => void) => void;
};

export const WebSocketContext = createContext<WebSocketContextType>({
    ws: null,
    sendStatusUpdate: () => { },
    onStatusUpdate: () => { },
    sendChatMessage: () => { },
    onChatMessage: () => { },
    sendNudge: () => { },
    onNudge: () => { },
});

export const WebSocketProvider = ({
    children,
    token,
    userId,
    nickname,
}: {
    children: React.ReactNode;
    token: string;
    userId: number;
    nickname: string;
}) => {
    const wsRef = useRef<WebSocket | null>(null);
    const statusCallbacksRef = useRef<((data: StatusUpdatePayload) => void)[]>([]);
    const chatCallbacksRef = useRef<((data: ChatMessagePayload) => void)[]>([]);
    const nudgeCallbacksRef = useRef<((data: NudgePayload) => void)[]>([]);

    useEffect(() => {
        const ws = new WebSocket(`${config.WS_BASE}?token=${token}`);
        wsRef.current = ws;
        (window as any).ws = ws;

        ws.onopen = () => {
            console.log("✅ WebSocket bağlı");
            // Kullanıcının online olduğunu bildiren status-update
            sendStatusUpdate("online", userId, nickname);
        };

        ws.onmessage = (event: MessageEvent) => {
            console.log("📥 Gelen WS mesaj:", event.data);
            try {
                const data = JSON.parse(event.data);

                if (data.type === "status-update") {
                    statusCallbacksRef.current.forEach((cb) => cb(data));
                } else if (data.type === "chat-message") {
                    chatCallbacksRef.current.forEach((cb) => cb(data));

                    const currentPath = window.location.pathname;
                    const openedChat = currentPath.includes(`/chat/`);
                    const openedId = currentPath.split("/").pop();
                    const isSameChatOpen = openedChat && openedId === String(data.senderId);

                    if (!isSameChatOpen) {
                        const toastEvent = new CustomEvent("new-toast", {
                            detail: {
                                message: `${data.senderNickname}: ${data.content}`,
                                senderId: data.senderId,
                                timestamp: new Date(),
                            },
                        });
                        window.dispatchEvent(toastEvent);
                    }
                } else if (data.type === "nudge") {
                    nudgeCallbacksRef.current.forEach((cb) => cb(data));
                }
            } catch (e) {
                console.error("WebSocket mesajı çözülemedi:", e);
            }
        };

        ws.onerror = () => {
            console.error("💥 WebSocket error");
        };

        ws.onclose = () => {
            console.warn("❌ WebSocket bağlantısı kapandı.");
        };

        return () => {
            console.log("🧹 WebSocket bağlantısı temizleniyor.");
            ws.onmessage = null;
            ws.close();
        };
    }, []);

    const sendStatusUpdate = (status: string, userId: number, nickname: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const payload: StatusUpdatePayload = {
                type: "status-update",
                userId,
                nickname,
                status,
            };
            wsRef.current.send(JSON.stringify(payload));
        } else {
            console.warn("❌ WS açık değil, status gönderilemedi.");
        }
    };

    const onStatusUpdate = (callback: (data: StatusUpdatePayload) => void) => {
        if (!statusCallbacksRef.current.includes(callback)) {
            statusCallbacksRef.current.push(callback);
        }
    };

    const sendChatMessage = (payload: ChatMessagePayload) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(payload));
        } else {
            console.warn("❌ WS açık değil, chat mesajı gönderilemedi:", payload);
        }
    };

    const onChatMessage = (callback: (data: ChatMessagePayload) => void) => {
        if (!chatCallbacksRef.current.includes(callback)) {
            chatCallbacksRef.current.push(callback);
        }
    };

    const sendNudge = (payload: NudgePayload) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(payload));
        } else {
            console.warn("❌ WS açık değil, nudge gönderilemedi:", payload);
        }
    };

    const onNudge = (callback: (data: NudgePayload) => void) => {
        if (!nudgeCallbacksRef.current.includes(callback)) {
            nudgeCallbacksRef.current.push(callback);
        }
    };

    return (
        <WebSocketContext.Provider
            value={{
                ws: wsRef.current,
                sendStatusUpdate,
                onStatusUpdate,
                sendChatMessage,
                onChatMessage,
                sendNudge,
                onNudge,
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
