import { create } from 'zustand' // create로 zustand를 불러옵니다.
import { devtools } from 'zustand/middleware'
import fastapi from './api'

const store = (set) => ({
    serverList: [],
    channelList: [],
    currentServer: {},
    getNewServerList: async () => {
        try {
            const response = await fastapi("get", "/api/server/list", {});
            return set({ serverList: response.server_list });
        } catch (e) {
            console.debug(e);
        }
    },
    getNewChannelList: async (server_id) => {
        try {
            const response = await fastapi("get", "/api/channel/list/" + server_id, {});
            set({ channelList: response });
            return response
        } catch (e) {
            console.debug(e);
        }
    },
    getCurrentServer: (server_id) => {
        set(state => { return { currentServer: state.serverList.find(e => e.id === Number(server_id)) } })
    }
});

const useStore = create(
    process.env.NODE_ENV !== 'production' ? devtools(store) : store
)

export default useStore