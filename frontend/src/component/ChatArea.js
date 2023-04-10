import React, { useState, useEffect, useRef } from 'react'
import { Outlet, json, useNavigate, useParams } from 'react-router-dom';
import styles from './ChatArea.module.css'
import fastapi from '../lib/api'
import ErrorBox, { handleError, errorMessage } from './ErrorBox';
import useStore from '../lib/store';
import useWebSocketStore from '../lib/websocketStore';

function MessageLine({ message }) {

    return (
        <div className={styles.messageline}>
            <div className={styles.messagebox}>
                <h3 className={styles.chatinfo}>
                    <span className={styles.username}>
                        {message.user.nickname}
                    </span>
                    <span className={styles.createdate}>
                        {message.create_date}
                    </span>
                </h3>
                <div className={styles.content}>
                    <span className={styles.messagetext}>
                        {message.content}
                    </span>
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
    const messagesRef = useRef(null);
    const socketRef = useRef(null);
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
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }, [messages])

    useEffect(() => {
        const status = handleMessage.status
        if (status) {
            if (status.endsWith("Message")) {
                const msg = handleMessage.message
                if (msg.channel_id === Number(channel)) {
                    const list = sortByCreateDate([...messages, msg])
                    setMessages(list)
                    console.log(msg.id)
                }
            }
        }
    }, [handleMessage])

    function handleInputChange(event) {
        setInputValue(event.target.value);
    }

    function handleEnter(event) {
        if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
            const data = {
                text_message: {
                    channel_id: channel,
                    content_type: "text",
                    content: inputValue
                }
            }
            sendMessage(data)
            setInputValue('');
        }
    }
    return (
        <div className={styles.mainbox}>
            <div className={styles.chatline} ref={messagesRef}>
                <div className={styles.chatbox}>
                    {messages.map(msg => <MessageLine key={msg.id} message={msg} />)}
                </div>
            </div>
            <form className={styles.inputbox1}>
                <div className={styles.inputbox2}>
                    <div className={styles.inputbox3}>
                        <textarea className={styles.inputtext}
                            placeholder='#input area'
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleEnter} />
                    </div>
                </div>
            </form>
        </div>
    )
}