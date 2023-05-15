import { create } from 'zustand';
import { devtools } from 'zustand/middleware'

const store = (set, get) => ({
    socket: null,
    handleMessage: {},
    connect: async () => {
        const token = localStorage.getItem('login-token')
        const socket = new WebSocket(process.env.REACT_APP_WS_SERVER_URL + `/api/message/ws?token=${token}`);

        socket.onopen = () => {
            console.log('WebSocket connected');
            set({ socket });
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            set((state) => { return { handleMessage: data } });
        };

        socket.onclose = () => {
            console.log('WebSocket closed');
            set({ socket: null })
            // 연결이 닫히면 3초 후에 다시 시도합니다.
            setTimeout(() => {
                if (!get().socket) {
                    get().connect()
                }
            }, 500);
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    },
    disconnect: () => {
        if (get().socket) {
            get().socket.close()
            set({ socket: null })
        }
    },
    reconnect: () => {
        get().disconnect()
        get().connect()
    },
    sendMessage: (data) => {
        if (get().socket && get().socket.readyState === WebSocket.OPEN) {
            get().socket.send(JSON.stringify(data));
        }
    },
    setHandleMessage: (handleMessage) => set({ handleMessage }),
})

const useWebSocketStore = create(
    process.env.NODE_ENV !== 'production' ? devtools(store) : store
)

export default useWebSocketStore;
