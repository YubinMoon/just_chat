import React, { useEffect, useState } from 'react'
import fastapi from '../lib/api'
import styles from './ServerMain.module.css'
import Pannel from './Pannel'

export default function ServerMain({ server }) {
    return (
        <div>
            <Pannel server={server} />
        </div>
    )
}