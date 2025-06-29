// src/components/ToastManager.tsx
import { useState, useEffect } from "react";
import "../styles/toast.css";

export type ToastData = {
    id: number;
    nickname: string;
    senderId: number;
    message: string;
};

let toastIdCounter = 0;

const ToastManager = () => {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    useEffect(() => {
        const handleNewToast = (event: CustomEvent<ToastData>) => {
            setToasts((prev) => [...prev, { ...event.detail, id: toastIdCounter++ }]);
        };

        window.addEventListener("new-toast", handleNewToast as EventListener);

        return () => {
            window.removeEventListener("new-toast", handleNewToast as EventListener);
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setToasts((prev) => prev.slice(1));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="toast"
                    onClick={() => {
                        window.open(`/chat/${encodeURIComponent(toast.nickname)}/${toast.senderId}`, `_blank`, "width=500,height=620");
                    }}
                >
                    <strong>{toast.nickname}</strong>: {toast.message}
                </div>
            ))}
        </div>
    );
};

export default ToastManager;
