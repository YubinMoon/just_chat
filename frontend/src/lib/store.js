import { create } from 'zustand' // create로 zustand를 불러옵니다.
import { devtools } from 'zustand/middleware'
import fastapi from './api'
import { json } from 'react-router-dom';

const store = (set, get) => ({
    serverList: [],
    channelList: [],
    currentServer: {},
    channelByServer: {},
    messageByServer: {},

    getNewServerList: async () => {
        try {
            const response = await fastapi("get", "/api/server/list", {});
            set({ serverList: response.server_list });
        } catch (e) {
            console.debug(e);
        }
    },

    getNewChannelList: async (server_id) => {
        if (!server_id)
            return;
        try {
            const response = await fastapi("get", "/api/channel/list/" + server_id, {});
            let data = get().channelByServer
            data[server_id] = response
            set({ channelList: response });
            set({ channelByServer: data})
            return response
        } catch (e) {
            console.debug(e);
        }
    },

    getCurrentServer: (server_id) => {
        const serverList = get().serverList
        set(state => { return { currentServer: state.serverList.find(e => e.id === Number(server_id)) } })
    }
});

const useStore = create(
    process.env.NODE_ENV !== 'production' ? devtools(store) : store
)

export default useStore