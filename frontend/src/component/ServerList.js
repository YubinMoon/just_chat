import React, { useEffect, useState } from 'react'
import fastapi from '../lib/api'
import styles from './ServerList.module.css'
import { Outlet, useNavigate } from 'react-router-dom';

function ServerBox({ children }) {
    return (
        <div className={`${styles.itemBox}`}>
            {children}
        </div>
    )
}

export default function ServerList({ servers }) {
    const navigate = useNavigate()

    return (
        <>
            <div className={styles.serverlist}>
                <ServerBox>
                    <div className={`${styles.btn}`} onClick={() => {
                        navigate("/")
                    }}>
                        메인
                    </div>
                </ServerBox>
                <ServerBox />
                {servers.map(e => (
                    <ServerBox key={e.id} name={e.name}>
                        <div>
                            {e && <div className={styles.btn} onClick={() => {
                                navigate("/" + e.id)
                            }}>
                                {e.name[0]}
                            </div>}
                        </div>
                    </ServerBox>
                ))}
            </div>
            </>
    )
}