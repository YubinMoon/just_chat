import React, { useState, useEffect, useLayoutEffect } from 'react'
import { Outlet, useParams } from 'react-router-dom';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from '../lib/store';
import styles from './Main.module.css'
import fastapi from '../lib/api'
import ServerPannel from './ServerPannel'
import ChatArea from './ChatArea';
import ChannelPannel from './ChannelPannel';
import useWebSocketStore from '../lib/websocketStore';
import SidePannel from './SidePannel';
import { useNavigate } from 'react-router-dom';

export default function Main() {
    const { serverList, currentServer, channelList, getNewServerList, getNewChannelList, getCurrentServer } = useStore(state => state)
    const { connect } = useWebSocketStore()
    const navigate = useNavigate()
    const { server, channel } = useParams()
    const lastAccess = JSON.parse(window.localStorage.getItem("lastAccess"))

    useEffect(() => {
        connect()
        getNewServerList()
    }, [])

    useEffect(() => {
        if (server) {
            if (lastAccess && server in lastAccess) {
                navigate(`/${server}/${lastAccess[server]}`)
            }
        }
        getNewChannelList(server)
    }, [server])

    useEffect(() => {
        if (server && !channel && channelList.length) {
            const channel_id = channelList[0].id
            navigate(`/${server}/${channel_id}`)
        }
    }, [channelList])

    useEffect(() => {
        getCurrentServer(server)
    }, [serverList, server])

    return (
        <div className="relative flex h-full w-full bg-neutral-700">
            <SidePannel />
            {channel && <ChatArea />}
        </div>
    )
}