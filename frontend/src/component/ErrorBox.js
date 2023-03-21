import React, { useState, useEffect } from 'react';
import styles from './ErrorBox.module.css'

export default function ErrorBox({ message }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);
            setTimeout(() => {
                setVisible(false);
            }, 1000);
        }
    }, [message]);

    return (
        <div className={`${styles.errorBox} ${visible ? '' : styles.fadeout}`}>
            <span className={styles.msg}>
                {message}
            </span>
        </div>
    )
}