import React, { useRef, useEffect } from 'react'
import styles from './Loading.module.css'

export default function Loading() {
    return (
        <div className={styles.box}>
            <div className={styles.loader}>
                <h2>
                    Loading....
                </h2>
            </div>
        </div>
    )
}