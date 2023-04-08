import React, { useState, useEffect } from 'react'
import { Outlet, useParams } from 'react-router-dom';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from '../lib/store';
import styles from './Main.module.css'
import fastapi from '../lib/api'
import ServerPannel from './ServerPannel'
import ChatArea from './ChatArea';
import Pannel from './Pannel';


export default function Main() {
    const { serverList, channelList, getNewServerList, getNewChannelList } = useStore(state => state)
    const { server, channel } = useParams()
    useEffect(() => {
        getNewServerList()
    }, [])
    const s = serverList.find(e => e.id === Number(server))
    const c = channelList.find(e => e.id === Number(channel))
    return (
        <div className={styles.body}>
            <div className={styles.sidepannel}>
                <ServerPannel />
                {s ? <Pannel /> : ""}
            </div>
            {c ? <ChatArea /> : ""}
        </div>
    )
}