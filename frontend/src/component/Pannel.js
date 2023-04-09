import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import styles from './Pannel.module.css'
import fastapi from '../lib/api'
import ErrorBox, { handleError, errorMessage } from './ErrorBox';
import useStore from '../lib/store';
import useWebSocketStore from '../lib/websocketStore';

function ChannelLine({ server, channel }) {
    const { sendMessage } = useWebSocketStore()
    const [delbox, setDelbox] = useState(false)
    const navigate = useNavigate()

    const checkDelete = (event) => {
        event.preventDefault()
        event.stopPropagation()
        setDelbox(true)
    }

    const cancelDelete = (event) => {
        event.preventDefault()
        event.stopPropagation()
        setDelbox(false)
    }

    const conformDelete = (event) => {
        event.preventDefault()
        event.stopPropagation()
        const params = {
            channel_config: {
                setting_type: "delete",
                server_id: server.id,
                channel_id: channel.id
            }
        }
        sendMessage(params)
    }

    const box1 = (
        <div className={styles.btnbox}>
            <button className={styles.btn}>
                <svg className={styles.icon} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="17px" width="17px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
            </button>
            <button className={styles.btn} onClick={checkDelete}>
                <svg className={styles.icon} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="17px" width="17px" xmlns="http://www.w3.org/2000/svg">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            </button>
        </div>
    )
    const box2 = (
        <div className={styles.btnbox} onClick={conformDelete}>
            <button className={styles.btn}>
                <svg className={styles.icon} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="17px" width="17px" xmlns="http://www.w3.org/2000/svg">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </button>
            <button className={styles.btn} onClick={cancelDelete}>
                <svg className={styles.icon} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="17px" width="17px" xmlns="http://www.w3.org/2000/svg">
                    <line x1="18" y1="6" x2="6" y2="18">
                    </line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    )
    return (
        <div className={styles.channel} onClick={() => {
            navigate("/" + server.id + "/" + channel.id)
        }}>
            <div className={styles.channelname}>
                <span className={styles.text}>
                    {channel.name}
                </span>
                {delbox ? box2 : box1}
            </div>
        </div>
    )
}

function NewChannel() {
    const { sendMessage } = useWebSocketStore()
    const { currentServer, getNewChannelList } = useStore()
    const [errorMessage, setErrorMessage] = useState("")
    const [isHovered, setIsHovered] = useState(false)
    const [newName, setNewName] = useState("")
    const { server, channel } = useParams()

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
        const params = {
            channel_config: {
                setting_type: "create",
                server_id: server,
                detail: {
                    name: newName,
                    description: "",
                    type: "text",
                    server_id: currentServer.id
                }
            }
        }
        sendMessage(params)
        setNewName("")
        // fastapi("post", "/api/channel/create", params)
        //     .then(
        //         () => {
        //             console.debug("create channel")
        //             setNewName("")
        //             getNewChannelList(currentServer.id)
        //         })
        //     .catch(
        //         error => handleError(error)
        //     )
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
                    <input type="text" value={newName} onChange={e => {
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
    const { handleMessage, reconnect } = useWebSocketStore()
    const { server, channel } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            getCurrentServer(server);
            const newChannelList = await getNewChannelList(server);
            if (newChannelList.length > 0) {
                navigate("/" + server + "/" + newChannelList[0].id);
            }
        })();
    }, [server])
    useEffect(() => {
        const status = handleMessage.status
        if (status) {
            if (status.endsWith("Channel")) {
                reconnect()
                getNewChannelList(server)
            }
        }
    }, [handleMessage])

    return (
        <div className={styles.pannel}>

            <div className={styles.servername}>
                {currentServer.name}
            </div>
            <NewChannel />
            <div className={styles.channelbox}>
                <div className={styles.channelscroll}>
                    {channelList.map(channel =>
                        <ChannelLine key={channel.id} server={currentServer} channel={channel} />
                    )}
                </div>
            </div>
        </div>
    )
}