import React, { useState, useEffect, useRef } from 'react'
import { Outlet, json, useNavigate } from 'react-router-dom';
import styles from './ChatArea.module.css'
import fastapi from '../lib/api'
import ErrorBox, { handleError, errorMessage } from './ErrorBox';

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
                    {message.content}
                </div>
            </div>
        </div>
    )
}

export default function ChatArea({ channel }) {
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('');
    const messagesRef = useRef(null);
    const socketRef = useRef(null);
    const token = localStorage.getItem('login-token')

    useEffect(() => {
        socketRef.current = new WebSocket(process.env.REACT_APP_WS_SERVER_URL + `/api/message/ws?token=${token}`);

        socketRef.current.addEventListener('open', (event) => {
            console.log('WebSocket connection established');
        });

        socketRef.current.addEventListener('message', (event) => {
            const message = event.data;

            // const message = JSON.parse(event.data);
            console.log(JSON.parse(message))
            // setMessages((prevMessages) => [...prevMessages, message]);
        });

        return () => {
            console.log("socket close")
            socketRef.current.close();
        };
    }, []);

    useEffect(() => {
        fastapi(
            "get",
            "/api/message/list",
            {
                channel_id: channel.id,
                offset: 0,
                limit: 100
            },
            e => {
                console.debug(e)
                setMessages(e.message_list)
            },
            e => console.log(e)
        )
        setInputValue('');
    }, [channel])

    useEffect(() => {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }, [messages])

    function handleInputChange(event) {
        setInputValue(event.target.value);
    }

    function handleEnter(event) {
        if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
            const data = {
                channel_id: channel.id,
                content_type: "text",
                content: inputValue
            }
            if (socketRef.current.readyState === WebSocket.OPEN) { // WebSocket 연결 상태 확인
                socketRef.current.send(JSON.stringify(data));
            }
            // fastapi(
            //     "post",
            //     "/api/message/create",
            //     {
            //         channel_id: channel.id,
            //         content_type: "text",
            //         content: inputValue
            //     },
            //     () => {
            //         console.debug("send message")
            //     },
            //     e => console.debug(e)
            // )
            setInputValue('');
        }
    }

    return (
        <div className={styles.mainbox}>
            <div className={styles.chatline} ref={messagesRef}>
                {messages.map(msg => <MessageLine key={msg.id} message={msg} />)}
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