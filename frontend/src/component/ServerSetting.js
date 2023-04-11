import React, { useEffect, useState } from 'react'
import fastapi from '../lib/api'
import styles from './ServerSetting.module.css'
import { Outlet, useNavigate, useRoutes, useParams } from 'react-router-dom';
import useStore from '../lib/store';

const Divide = () => {
    return (
        <div>

        </div>
    )
}

const SettingBox = ({ title, onClick }) => {
    return (
        <li className={styles.line}>
            <button className={styles.btn} onClick={onClick}>
                <div className={styles.settingbox}>
                    <span className={styles.settingtext}>
                        {title}
                    </span>
                </div>
            </button>
        </li>
    )
}

export default function ServerSetting({ setSetting, handleOutsideClose }) {
    const [leave, setLeave] = useState(false)
    const { getNewServerList } = useStore()
    const { server, channel } = useParams()
    const navigate = useNavigate()
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
            const joinurl = _url + token
            if (window.navigator.clipboard && window.navigator.clipboard.writeText) {
                // writeText() 메서드를 사용할 수 있는 브라우저인 경우
                try {
                    await window.navigator.clipboard.writeText(joinurl);
                    console.debug('초대 링크가 클립보드에 복사되었습니다.');
                } catch (err) {
                    console.error('복사하는 동안 에러가 발생했습니다:');
                    console.error(err);
                    console.debug("초대링크")
                    console.debug(joinurl);
                }
            } else {
                // writeText() 메서드를 사용할 수 없는 브라우저인 경우
                console.warn(navigator.clipboard)
                console.warn('현재 브라우저에서는 클립보드 복사를 지원하지 않습니다.');
                console.warn(joinurl);
            }
        }
        catch (e) {
            console.error(e)
        }
        setSetting(false)
    }
    const leaveServerConform = async (e) => {
        e.stopPropagation();
        setSetting(false)
        try {
            await fastapi(
                "delete",
                "/api/server/leave/" + server,
                {}
            )
            getNewServerList(server)
            navigate("/")
        }
        catch (e) {
            console.error(e.detail)
        }
    }

    const leaveServer = () => {
        setLeave(true)
    }
    const backgroundClick = (e) => {
        e.stopPropagation();
        setSetting(false)
    }


    return (
        <div className={styles.pannel}>
            <ul className={styles.list}>
                <SettingBox title={"서버 초대하기"} onClick={copyInvite} />
                <SettingBox title={"서버 탈퇴하기"} onClick={leaveServer} />
            </ul>
            {leave && <div className={styles.modalbox} onClick={backgroundClick}>
                <div className={styles.modal} onClick={e => e.stopPropagation()}>
                    <div className={styles.modeltitle}>
                        <span>
                            WARNING
                        </span>
                    </div>
                    <div className={styles.modaldetail}>
                        <span>
                            정말로 서버를 떠나시겠습니까?
                        </span>
                    </div>
                    <div className={styles.modalbtnarea}>
                        <button className={styles.modelbtn1} onClick={() => setLeave(state => false)}>
                            <span>취소</span>
                        </button>
                        <button className={styles.modelbtn2} onClick={leaveServerConform}>
                            <span>확인</span>
                        </button>
                    </div>
                </div>
            </div>}
        </div>
    )
}