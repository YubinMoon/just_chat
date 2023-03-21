import { useState } from 'react';
import { Link } from 'react-router-dom'
import styles from './Login.module.css'
import Line from '../component/Line'

export default function Login() {
    const [userId, setUserId] = useState("")
    const [passwd1, setPasswd1] = useState("")

    const submit = (e) => {
        e.preventDefault()
        console.log(e)
    }
    return (
        <div className={styles.mainbox}>
            <form onSubmit={submit}>
                <ul>
                    <li>
                        <Line exp="아이디" state={userId} onChange={e => setUserId(e.target.value)} />
                    </li>
                    <li>
                        <Line type="password" exp="비밀번호" state={passwd1} onChange={e => setPasswd1(e.target.value)} />
                    </li>
                    <li>
                        <div><Link className={styles.forgetpasswd} to="/forget">비밀번호를 잊으셨나요?</Link></div>
                    </li>
                    <li>
                        <button type="submit">로그인</button>
                        <span className={styles.text}>계정이 없으신가요? <Link className={styles.signup} to="/signup">회원가입</Link></span>
                    </li>
                </ul>
            </form>
        </div>
    )
}