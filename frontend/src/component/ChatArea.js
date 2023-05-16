import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { Outlet, json, useNavigate, useParams } from 'react-router-dom';
import fastapi from '../lib/api'
import ErrorBox, { handleError, errorMessage } from './ErrorBox';
import useStore from '../lib/store';
import useWebSocketStore from '../lib/websocketStore';
import { Cross, LeftConsole, LeftConsoleTransparent, Plus } from './SVG';

function MsgLineType1({ message }) {
    return (
        <>
            <br />
            <div id="msgBox" className="relative hover:bg-[#393939] px-4">
                <div className="relative flex">
                    <div id='usericon' className='absolute cursor-pointer top-1'>
                        <div className='w-10 h-10 stroke-white'>
                            <LeftConsole />
                        </div>
                    </div>
                    <div className='pl-14 w-full'>
                        <div id="info" className="text-white flex">
                            <div className="flex items-end justify-center align-middle">
                                <p>
                                    <span className='text-lg font-bold hover:underline cursor-pointer'>
                                        {message.user.nickname}
                                    </span>
                                    <span className='text-xs text-neutral-400 pl-2'>
                                        {message.create_date}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <p className='text-white text-base break-all whitespace-pre-wrap'>
                            {message.content}
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

function MsgLineType2({ message }) {
    return (
        <div id="msgBox" className="relative hover:bg-[#393939] px-4 group">
            <div className="relative flex">
                <p className='invisible group-hover:visible absolute w-10 truncate text-clip overflow-hidden text-white text-xs top-1'>
                    {message.create_date}
                </p>
                <div className='pl-14 w-full'>
                    <p className='text-white text-base break-all whitespace-pre-wrap'>
                        {message.content}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function ChatArea() {
    const { handleMessage, sendMessage, disconnect } = useWebSocketStore()
    const { serverList, channelList, currentServer } = useStore()
    const { server, channel } = useParams()
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('');
    const chatListRef = useRef(null);
    const socketRef = useRef(null);
    const textarea = useRef(null)
    const inputScrollRef = useRef(null)
    const token = localStorage.getItem('login-token')

    const sortByCreateDate = (list) => {
        return list.sort((a, b) => {
            // 'create_date' 속성을 Date 객체로 변환
            const dateA = new Date(a.create_date);
            const dateB = new Date(b.create_date);

            // 날짜를 비교하여 정렬
            if (dateA < dateB) {
                return -1;
            } else if (dateA > dateB) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    useEffect(() => {
        const params = {
            channel_id: channel,
            offset: 0,
            limit: 1000
        }
        fastapi("get", "/api/message/list", params)
            .then(e => {
                const list = sortByCreateDate(e.message_list)
                setMessages(list)
            })
            .catch(
                e => console.log(e)
            )
        setInputValue('');
    }, [channel])

    useEffect(() => {
        move2Bottom()
    }, [messages])

    useEffect(() => {
        const status = handleMessage.status
        if (status) {
            if (status.endsWith("Message")) {
                const msg = handleMessage.message
                if (msg.channel_id === Number(channel)) {
                    const list = sortByCreateDate([...messages, msg])
                    setMessages(list)
                }
            }
        }
    }, [handleMessage])

    function handleEnter(event) {
        const value = event.target.value.trim();
        if (event.keyCode === 13 && !event.shiftKey) {
            if (!value) {
                event.preventDefault();
                return
            }
            event.preventDefault();
            const data = {
                text_message: {
                    channel_id: channel,
                    content_type: "text",
                    content: value
                }
            }
            sendMessage(data)
            event.target.value = ""
            resize(event)
            move2Bottom()
        }
    }

    function resize(event) {
        event.target.style.height = "1px";
        event.target.style.height = event.target.scrollHeight + 'px';
    }

    function move2Bottom() {
        chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }

    return (
        <div className="relative flex flex-col w-full h-full items-center bg-inherit">
            <div className=' flex-none h-14 w-full border-b border-zinc-800'>
                top area
            </div>
            <div className='flex w-full flex-auto overflow-hidden'>
                <div className='flex flex-col flex-auto '>
                    <div className='h-full overflow-y-scroll flex-col flex pb-5 scrollbar scrollbar-w-6 scrollbar-chat scrollbar-thumb-rounded-full scrollbar-track-rounded-full'
                        ref={chatListRef}>
                        <div className="flex flex-col flex-auto justify-end">
                            {messages.map((msg, i) => {
                                if (i > 0 && messages[i - 1].user.username == msg.user.username) {
                                    return <MsgLineType2 key={msg.id} message={msg} />
                                }
                                return <MsgLineType1 key={msg.id} message={msg} />

                            })}
                        </div>
                    </div>
                    <div id="inputarea" className='relative w-full px-4 -mt-2 flex-none'>
                        <div className="relative mb-6 bg-neutral-600 rounded-lg ">
                            <div className='pl-4 py-2'>
                                <div className="relative flex w-full max-h-32 overflow-y-scroll scrollbar scrollbar-w-2 scrollbar-thumb-neutral-800 scrollbar-thumb-rounded-2xl"
                                    ref={inputScrollRef}>
                                    <div className='sticky top-0'>
                                        <div className='p-1 cursor-pointer'>
                                            <div className='stroke-white w-6 h-6'>
                                                <Plus />
                                            </div>
                                        </div>
                                    </div>
                                    <div id="text" className="relative flex w-full pl-3">
                                        <div className='flex w-full align-middle'>
                                            <textarea className='my-auto bg-transparent outline-none resize-none text-white h-6 w-full text-base overflow-hidden'
                                                onKeyDown={handleEnter}
                                                onChange={resize}>
                                            </textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='bg-neutral-800 w-60 flex-none'>
                    sidebar
                </div>
            </div>
        </div >
    )
}