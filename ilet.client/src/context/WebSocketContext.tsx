import React, { createContext, useEffect, useRef, useContext } from "react";
import config from "../config";
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
};

export const WebSocketContext = createContext<WebSocketContextType>({
    ws: null,
    sendStatusUpdate: () => { },
    onStatusUpdate: () => { },
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
    const statusCallbacksRef = useRef<((data: StatusUpdatePayload) => void)[]>(
        []
    );
    useEffect(() => {
        const token = localStorage.getItem("token");
        const userIdStr = localStorage.getItem("userId");
        const nickname = localStorage.getItem("nickname");

      /*  console.log("🚦useEffect koşulları:", { token, userIdStr, nickname });*/

        if (!token || !userIdStr || !nickname) return;

        const ws = new WebSocket(`${config.WS_BASE}?token=${token}`);
        wsRef.current = ws;
        (window as any).ws = ws;

       /* console.log("🔌 WebSocket oluşturuldu:", ws);*/

        ws.onopen = () => {
            //console.log("✅ WebSocket bağlı");
        };

        const onMessageHandler = (event: MessageEvent) => {
            console.log("📥 Gelen mesaj:", event.data);
            try {
                const data: StatusUpdatePayload = JSON.parse(event.data);
                if (data.type === "status-update") {
                    //console.log("[WebSocket] status-update:", data.type);
                    statusCallbacksRef.current.forEach((cb) => cb(data));
                    //console.log("🧩 Callback sayısı:", statusCallbacksRef.current.length);
                }
            } catch (e) {
                //console.error("WebSocket mesajı çözülemedi:", e);
            }
        };

        ws.onmessage = onMessageHandler;

        ws.onerror = (/*e*/) => {
            //console.error("💥 WS error:", e);
        };

        ws.onclose = () => {
            //console.log("❌ WebSocket bağlantısı kapandı.");
        };

        return () => {
            console.log("🧹 WebSocket bağlantısı kapatılıyor ve onmessage temizleniyor.");
            ws.onmessage = null; // 🔥 eski handler'ı temizle
            ws.close();
        };
    }, []);
    const sendStatusUpdate = (
        status: string,
        userId: number,
        nickname: string
    ) => {
        if (
            wsRef.current &&
            wsRef.current.readyState === WebSocket.OPEN
        ) {
            const payload: StatusUpdatePayload = {
                type: "status-update",
                userId,
                nickname,
                status,
            };
            //console.log("📤 WS SEND:", payload);
            wsRef.current.send(JSON.stringify(payload));
        } else {
            //console.warn("❌ WebSocket bağlantısı açık değil");
        }
    };
    const onStatusUpdate = (
        callback: (data: StatusUpdatePayload) => void
    ) => {
        if (!statusCallbacksRef.current.includes(callback)) {
            statusCallbacksRef.current.push(callback);
        }
    };
    return (
        <WebSocketContext.Provider
            value={{ ws: wsRef.current, sendStatusUpdate, onStatusUpdate }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};
export const useWebSocket = () => useContext(WebSocketContext);
