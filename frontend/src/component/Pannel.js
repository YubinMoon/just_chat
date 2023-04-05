import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom';
import styles from './Pannel.module.css'
import fastapi from '../lib/api'
import ErrorBox, { handleError, errorMessage } from './ErrorBox';

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

function NewChannel({ server_id }) {
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
        fastapi(
            "post",
            "/api/channel/create",
            {
                name: newName,
                description: "",
                type: "text",
                server_id: server_id
            },
            () => {
                console.debug("create channel")
                setNewName("")
            },
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


export default function Pannel({ server }) {
    return (
        <div className={styles.pannel}>

            <div className={styles.servername}>
                {server.name}
            </div>
            <NewChannel server_id={server.id} />
            <div className={styles.channelbox}>
                {server.channel_list.map(channel =>
                    <ChannelLine key={channel.id} server={server} channel={channel} />
                )}
            </div>
        </div>
    )
}