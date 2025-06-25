import React, { createContext, useEffect, useRef, useContext } from "react";
import config from "../config";

// Yeni mesaj türü
export type ChatMessagePayload = {
    type: "chat-message";
    senderId: number;
    receiverId: number;
    content: string;
};

export type StatusUpdatePayload = {
    type: "status-update";
    userId: number;
    nickname: string;
    status: string;
};

type WebSocketContextType = {
    ws: WebSocket | null;
    sendStatusUpdate: (status: string, userId: number, nickname: string) => void;
    onStatusUpdate: (callback: (data: StatusUpdatePayload) => void) => void;

    sendChatMessage: (payload: ChatMessagePayload) => void;
    onChatMessage: (callback: (data: ChatMessagePayload) => void) => void;
};

export const WebSocketContext = createContext<WebSocketContextType>({
    ws: null,
    sendStatusUpdate: () => { },
    onStatusUpdate: () => { },
    sendChatMessage: () => { },
    onChatMessage: () => { },
});

export const WebSocketProvider = ({
    children,
}: {
    children: React.ReactNode;
    token: string;
    userId: number;
    nickname: string;
}) => {
    const wsRef = useRef<WebSocket | null>(null);
    const statusCallbacksRef = useRef<((data: StatusUpdatePayload) => void)[]>([]);
    const chatCallbacksRef = useRef<((data: ChatMessagePayload) => void)[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userIdStr = localStorage.getItem("userId");
        const nickname = localStorage.getItem("nickname");

        if (!token || !userIdStr || !nickname) return;

        const ws = new WebSocket(`${config.WS_BASE}?token=${token}`);
        wsRef.current = ws;
        (window as any).ws = ws;

        ws.onopen = () => {
            console.log("✅ WebSocket bağlı");
        };

        ws.onmessage = (event: MessageEvent) => {
            console.log("📥 Gelen mesaj:", event.data);
            try {
                const data = JSON.parse(event.data);
                if (data.type === "status-update") {
                    statusCallbacksRef.current.forEach((cb) => cb(data));
                } else if (data.type === "chat-message") {
                    chatCallbacksRef.current.forEach((cb) => cb(data));
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
        const readyState = wsRef.current?.readyState;
        if (wsRef.current && readyState === WebSocket.OPEN) {
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

    return (
        <WebSocketContext.Provider
            value={{
                ws: wsRef.current,
                sendStatusUpdate,
                onStatusUpdate,
                sendChatMessage,
                onChatMessage,
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
