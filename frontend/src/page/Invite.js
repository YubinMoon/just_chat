import React, { useState, useEffect, useReducer } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Loading from '../component/Loading'
import fastapi from '../lib/api'
import Main from '../component/Main'
import Login from './Login'

export default function Invite() {
    const { token } = useParams()
    const [prehref, setPrehref] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        fastapi(
            "post",
            "/api/server/invite/join/" + token,
            {}).then((response) => {
                console.log(response)
                navigate("/")
            }).catch((e) => {
                const prehref = window.location.href
                if (e.detail === "Not authenticated") {
                    console.debug("no login")
                    console.debug(prehref)
                    setPrehref(prehref)
                }
                navigate("/")
            })
    }, [])

    return (
        <>
            {prehref && <Login prehref={prehref} />}
        </>
    )
}