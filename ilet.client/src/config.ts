const config = {
    LOCAL_URL: import.meta.env.VITE_LOCAL_URL,
    API_URL: import.meta.env.VITE_API_URL,
    WS_BASE: import.meta.env.VITE_WS_URL,
};

export const getWebSocketUrl = (token: string) => `${config.WS_BASE}?token=${token}`;

export default config;
