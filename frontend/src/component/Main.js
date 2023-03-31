import React, { useState, useEffect } from 'react'
import { Outlet, useParams } from 'react-router-dom';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import styles from './Main.module.css'
import fastapi from '../lib/api'
import ServerList from './ServerList'
import ServerMain from './ServerMain';
import ChatArea from './ChatArea';


export default function Main() {
    const [servers, setServers] = useState([])
    const [channels, setChannels] = useState([])
    const { server, channel } = useParams()
    useEffect(() => {
        fastapi("get",
            "/api/server/list",
            {},
            r => {
                console.debug(r)
                setServers(r.server_list)
                setChannels(r.server_list.flatMap(data => data.channel_list))
            },
            e => console.debug(e))
    }, [])
    console.debug("server: " + server)
    console.debug("channel: " + channel)
    const s = servers.find(e => e.id == server)
    const c = channels.find(e => e.id == channel)
    return (
        <div className={styles.body}>
            <ServerList servers={servers} />
            {s ? <ServerMain server={s} /> : ""}
            {c ? <ChatArea channel={c} /> : ""}
        </div>
    )
}