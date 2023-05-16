import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import ErrorBox from './ErrorBox';
import ServerSetting from './ServerSetting';
import useStore from '../lib/store';
import useWebSocketStore from '../lib/websocketStore';
import { Check, Cross, Dropdown, EditPan, TrashCan } from './SVG';

function ChannelLine({ server, channel, checked }) {
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

    useEffect(() => {
        setDelbox(false)
    }, [checked])

    const Icon = ({ children, onClick }) => {
        return (
            <button className="justify-center px-1" onClick={onClick}>
                <div className='w-4 h-4 stroke-white'>
                    {children}
                </div>
            </button>
        )
    }

    return (
        <div className={`${checked ? "bg-neutral-600" : "hover:bg-neutral-700"} py-1 rounded-md `} onClick={() => {
            let lastAccess = JSON.parse(window.localStorage.getItem("lastAccess"))
            if (!lastAccess) {
                lastAccess = {}
            }
            lastAccess[server.id] = channel.id
            window.localStorage.setItem("lastAccess", JSON.stringify(lastAccess))
            navigate("/" + server.id + "/" + channel.id)
        }}>
            <div className="flex justify-between">
                <span className="text-white text-lg px-2 flex-initial truncate">
                    {channel.name}
                </span>
                <div className={`${checked ? "" : "hidden"}  flex`}>
                    {delbox
                        ?
                        <>
                            <Icon onClick={conformDelete}>
                                <Check />
                            </Icon>
                            <Icon onClick={cancelDelete}>
                                <Cross />
                            </Icon>
                        </>
                        :
                        <>
                            <Icon>
                                <EditPan />
                            </Icon>
                            <Icon onClick={checkDelete}>
                                <TrashCan />
                            </Icon>
                        </>
                    }
                </div>
            </div>
        </div>
    )
}

function NewChannel({ nowServer }) {
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
                    server_id: nowServer.id
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
        <div className='relative group'
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className={`transition-all overflow-hidden h-0 group-hover:h-20`} >
                <form className="mx-3" onSubmit={e => {
                    e.preventDefault()
                    createChannel()
                }}>
                    <div className="text-white text-base pb-2">
                        <span className='text-red-500'>*</span>
                        <span>채널 이름</span>
                    </div>
                    <input className='w-full bg-neutral-600 outline-none p-3 rounded-lg text-white font-bold' type="text" value={newName} onChange={e => {
                        setNewName(e.target.value)
                    }} />
                </form >
            </div>
            <div className="border-2 m-3 rounded-lg border-neutral-400"
                onClick={createChannel}>
                <div className="p-3">
                    <span className='text-white font-medium'>
                        New chat
                    </span>
                </div>
            </div>
            <ErrorBox error={errorMessage} />
        </div >
    )
}


export default function ChannelPannel() {
    const { serverList, channelList, currentServer, getNewChannelList, getCurrentServer } = useStore()
    const { handleMessage, reconnect } = useWebSocketStore()
    const { server, channel } = useParams()
    const [setting, setSetting] = useState(false)
    const [nowServer, setNowServer] = useState(null)
    const [serverName, setServerName] = useState("")
    const navigate = useNavigate()
    const dropMenuRef = useRef()

    const settingClick = (e) => {
        e.stopPropagation();
        setSetting(state => !state)
        const handleOutsideClose = (e) => {
            if (!dropMenuRef.current || !dropMenuRef.current.contains(e.target)) {
                setSetting(false);
                document.removeEventListener("click", handleOutsideClose);
            }
        };
        document.addEventListener("click", handleOutsideClose);
    }

    useLayoutEffect(() => {
        const now = serverList.find(e => e.id === Number(server))
        if (now)
            setServerName(now.name)
        setNowServer(now)
    }, [serverList])

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
        <div className="bg-neutral-800 w-60 flex flex-col">
            <div className="flex-none transition-colors duration-100 h-14 p-3 hover:bg-zinc-700 border-b border-black" onClick={settingClick}>
                <div className="flex justify-between w-full">
                    <span className='text-white text-xl my-auto'>
                        {serverName}
                    </span>
                    <div className='flex'>
                        <div className='w-5 h-5 stroke-white m-auto'>
                            {setting ? <Cross /> : <Dropdown />}
                        </div>
                    </div>
                </div>
            </div>
            <div className='relative'>
                <div className='flex-initial pt-3'>
                    <NewChannel />
                </div>
                <div className="relative flex-1 overflow-scroll scrollbar-none">
                    <div className="border-t border- mt-2 mx-3">
                        <div className="mt-2">
                            {channelList.map(c =>
                                <ChannelLine key={c.id} server={nowServer} channel={c} checked={c.id === Number(channel)} />
                            )}
                        </div>
                    </div>
                </div>
                <div ref={dropMenuRef}>
                    {setting && <ServerSetting setSetting={setSetting} />}
                </div>
            </div>
        </div>
    )
}