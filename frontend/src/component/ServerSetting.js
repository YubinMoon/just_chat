import React, { useEffect, useState } from 'react'
import fastapi from '../lib/api'
import styles from './ServerSetting.module.css'
import { Outlet, useNavigate, useRoutes, useParams } from 'react-router-dom';
import useStore from '../lib/store';

const SettingBox = ({ title, onClick }) => {
    return (
        <button className={styles.btn} onClick={onClick}>
            <div className={styles.settingbox}>
                <span className={styles.settingtext}>
                    {title}
                </span>
            </div>
        </button>
    )
}

export default function ServerSetting() {
    const { server, channel } = useParams()
    const copyInvite = async () => {
        try {
            const _url = window.location.protocol + "//" + window.location.host + "/invite/"
            const response = await fastapi(
                "get",
                "/api/server/invite/create/" + server,
                {}
            )
            const token = response.invite_token
            if (!token)
                throw Error("no token")
            console.log(response.invite_token)
            console.log(_url + token)
            try {
                await navigator.clipboard.writeText(_url + token);
                console.debug('초대 링크가 클립보드에 복사되었습니다.');
            } catch (err) {
                console.error('복사하는 동안 에러가 발생했습니다:', err);
            }
        }
        catch (e) {
            console.debug(e)
        }
    }

    return (
        <div className={styles.pannel}>
            <ul className={styles.list}>
                <SettingBox title={"서버 초대하기"} onClick={copyInvite} />
            </ul>
        </div>
    )
}