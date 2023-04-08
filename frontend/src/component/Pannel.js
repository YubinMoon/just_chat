import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import styles from './Pannel.module.css'
import fastapi from '../lib/api'
import ErrorBox, { handleError, errorMessage } from './ErrorBox';
import useStore from '../lib/store';
function ChannelLine({ server, channel }) {
    const navigate = useNavigate()
    return (
        <div className={styles.channel} onClick={() => {
            navigate("/" + server.id + "/" + channel.id)
        }}>
            {channel.name}
        </div>
    )
}

function NewChannel() {
    const { currentServer, getNewChannelList } = useStore()
    const [errorMessage, setErrorMessage] = useState("")
    const [isHovered, setIsHovered] = useState(false)
    const [newName, setNewName] = useState("")

    function handleError(error) {
        if (!errorMessage) {
            setErrorMessage(error);
            setTimeout(() => {
                setErrorMessage('');
            }, 2000);
        }
    }

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const createChannel = () => {
        const params =
        {
            name: newName,
            description: "",
            type: "text",
            server_id: currentServer.id
        }
        fastapi("post", "/api/channel/create", params)
            .then(
                () => {
                    console.debug("create channel")
                    setNewName("")
                    getNewChannelList(currentServer.id)
                })
            .catch(
                error => handleError(error)
            )
    }

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className={`${styles.hiddencontent} ${isHovered ? styles.visible : ""}`} >
                <form className={styles.form} onSubmit={e => {
                    e.preventDefault()
                    createChannel()
                }}>
                    <div className={styles.label}>
                        <label>채널 이름</label>
                    </div>
                    <input type="text" onChange={e => {
                        setNewName(e.target.value)
                    }} />
                </form >
            </div>
            <div className={`${styles.newchattextbox}`}
                onClick={createChannel}>
                <div className={styles.newchattext}>
                    New chat
                </div>
            </div>
            <ErrorBox error={errorMessage} />
        </div >
    )
}


export default function Pannel() {
    const { serverList, channelList, currentServer, getNewChannelList, getCurrentServer } = useStore()
    const { server, channel } = useParams()
    useEffect(() => {
        getCurrentServer(server)
        getNewChannelList(server)
    }, [server])
    return (
        <div className={styles.pannel}>

            <div className={styles.servername}>
                {currentServer.name}
            </div>
            <NewChannel />
            <div className={styles.channelbox}>
                {channelList.map(channel =>
                    <ChannelLine key={channel.id} server={currentServer} channel={channel} />
                )}
            </div>
        </div>
    )
}