import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'
import Loading from '../component/Loading'
import fastapi from '../lib/api'
import Main from '../component/Main'

export default function Home() {
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fastapi("post", "/api/user/refresh", {})
            .then((e) => {
                console.debug("refresh")
                console.debug(e)
                setLoading(false)
            })
            .catch((e) => {
                console.debug(e)
                navigate("/login")

            })
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