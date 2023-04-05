import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom';
import styles from './ChatArea.module.css'
import fastapi from '../lib/api'
import ErrorBox, { handleError, errorMessage } from './ErrorBox';

export default function ChatArea({ channel }) {
    const [messages, setMessages] = useState()

    console.log(channel)
    return (
        <div className={styles.mainbox}>

        </div>
    )
}