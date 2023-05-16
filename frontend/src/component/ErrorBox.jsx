import React, { useState, useEffect } from 'react';
import styles from './ErrorBox.module.css'

function Message({ error }) {
    if (typeof error === "string") {
        return (
            <span className={styles.msg}>
                - {error}
            </span>
        )
    }
    else if (typeof error.detail === "string") {
        return (
            <span className={styles.msg}>
                - {error.detail}
            </span>
        )
    }
    else if (typeof error.detail === "object" && error.detail.length > 0) {
        return (
            <>
                {
                    error.detail.map((msg, i) => (
                        <span key={i} className={styles.msg}>- {msg.loc[1]}: {msg.msg}</span>
                    ))
                }
            </>
        )
    }
}

export default function ErrorBox({ error }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        if (error) {
            setVisible(true);
            setTimeout(() => {
                setVisible(false);
            }, 1000);
        }
    }, [error]);

    return (
        <div className={`${styles.errorBox} ${visible ? '' : styles.fadeout}`} >
            <Message error={error} />
        </div>
    )
}