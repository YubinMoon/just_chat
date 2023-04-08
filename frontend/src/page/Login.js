import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import fastapi from '../lib/api';
import styles from './Login.module.css'
import Line from '../component/Line'
import ErrorBox from '../component/ErrorBox';

export default function Login() {
    const [errorMessage, setErrorMessage] = useState("")
    const [userId, setUserId] = useState("")
    const [passwd, setPasswd] = useState("")
    const navigate = useNavigate()

    function handleError(error) {
        if (!errorMessage) {
            setErrorMessage(error);
            setTimeout(() => {
                setErrorMessage('');
            }, 2000);
        }
    }

    const submit = (e) => {
        e.preventDefault()
        const params = {
            username: userId,
            password: passwd
        }
        console.debug(params)
        fastapi("login", "/api/user/login", params,)
            .then((token) => {
                console.log(token)
                localStorage.setItem('login-token', token.access_token)
                navigate("/")
            })
            .catch((error) => {
                handleError(error)
            })
    }
    return (
        <div>
            <div className={styles.mainbox}>
                <form onSubmit={submit}>
                    <ul>
                        <li>
                            <Line exp="아이디" state={userId} onChange={e => setUserId(e.target.value)} />
                        </li>
                        <li>
                            <Line type="password" exp="비밀번호" state={passwd} onChange={e => setPasswd(e.target.value)} />
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
            <ErrorBox error={errorMessage} />
        </div>
    )
}