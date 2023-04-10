import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'
import Loading from '../component/Loading'
import fastapi from '../lib/api'
import Main from '../component/Main'

export default function Home() {
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const checkLogin = async () => {
        try {
            const token = await fastapi("post", "/api/user/refresh", {});
            console.debug("reload token");
            console.debug(token)
            localStorage.setItem('login-token', token.access_token)
            setLoading(false);
        } catch (e) {
            console.debug(e.message);
            if (e.message === 'Failed to fetch') {
                console.log("Server is not responding")
                setTimeout(checkLogin, 3000)
            } else {
                console.debug("need login")
                navigate("/login");
            }
        }
    }

    useEffect(() => {
        checkLogin()
    }, [])
    if (loading) {
        return <Loading />
    }
    else {
        return (
            <Main />
        )
    }
}