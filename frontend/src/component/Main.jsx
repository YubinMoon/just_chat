import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom';
import useStore from '../lib/store';
import ChatArea from './ChatArea';
import useWebSocketStore from '../lib/websocketStore';
import { useNavigate } from 'react-router-dom';
import ServerPannel from './ServerPannel'
import ChannelPannel from './ChannelPannel'

export default function Main() {
    const { serverList, currentServer, channelByServer, channelList, getNewServerList, getNewChannelList, getCurrentServer } = useStore(state => state)
    const { connect } = useWebSocketStore()
    const navigate = useNavigate()
    const { server, channel } = useParams()
    const lastAccess = JSON.parse(window.localStorage.getItem("lastAccess"))

    useEffect(() => {
        connect() // websocket connect
        getNewServerList() // get serverList
    }, [])

    useEffect(() => {
        if (server) {
            if (lastAccess && server in lastAccess) {
                navigate(`/${server}/${lastAccess[server]}`)
            }
        }
        if (!(server in channelByServer)) {
            console.log("get")
            getNewChannelList(server)
        }
    }, [server])

    useEffect(() => {
        console.log(channelByServer)
        if (server && !channel && server in channelByServer) {
            const channel_id = channelByServer[server][0].id
            navigate(`/${server}/${channel_id}`)
        }
    }, [channelByServer, channel])

    useEffect(() => {
        getCurrentServer(server)
    }, [serverList, server])

    return (
        <div className="relative flex h-full w-full bg-neutral-700">
            <div className="flex">
                <ServerPannel />
                <ChannelPannel />
            </div>
            <ChatArea />
        </div>
    )
}