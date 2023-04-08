import { useState } from 'react';
import fastapi from '../lib/api'
import styles from './Signup.module.css'
import Line from '../component/Line'
import ErrorBox from '../component/ErrorBox'
import { useNavigate } from 'react-router-dom';

export default function Signup() {
    const [errorMessage, setErrorMessage] = useState("")
    const [userId, setserId] = useState("")
    const [passwd1, setPasswd1] = useState("")
    const [passwd2, setPasswd2] = useState("")
    const [name, setName] = useState("")
    const [nameHint, setNameHint] = useState("")
    const [check, setCheck] = useState(false)
    const navigate = useNavigate()

    function handleError(error) {
        if (!errorMessage) {
            setErrorMessage(error);
            setTimeout(() => {
                setErrorMessage('');
            }, 2000);
        }
    }

    const getuserId = event => {
        const value = event.target.value
        setserId(value)
        setNameHint(value);
    }

    const submit = (e) => {
        e.preventDefault()
        const params = {
            username: userId,
            password1: passwd1,
            password2: passwd2,
            nickname: name ? name : nameHint,
        }
        if (check) {
            fastapi('post', '/api/user/create', params)
                .then(() => {
                    console.debug("success")
                    alert("회원가입 성공!")
                    navigate("/")
                })
                .catch(error => handleError(error))
        } else {
            handleError("checkbox")
            console.debug("checkbox")
        }
    }

    return (
        <>
            <div className={styles.mainbox}>
                <form onSubmit={submit}>
                    <ul>
                        <li>
                            <Line exp="아이디" state={userId} onChange={getuserId} />
                        </li>
                        <li>
                            <Line type='password' exp="비밀번호" state={passwd1} onChange={e => setPasswd1(e.target.value)} />
                        </li>
                        <li>
                            <Line type="password" exp="비밀번호 확인" state={passwd2} onChange={e => setPasswd2(e.target.value)} />
                        </li>
                        <li>
                            <Line exp="이름" state={name} hint={nameHint} onChange={e => setName(e.target.value)} />
                        </li>
                        <li>
                            <div>
                                <input type="checkbox" id="myCheckbox" checked={check} onChange={e => setCheck(e.target.checked)} />
                                <label className={styles.policy} htmlFor="myCheckbox">개인적인 용도이므로 보안에 문제가 많습니다.</label>
                            </div>
                            <div className={styles.tmp}></div>
                        </li>
                        <li>
                            <button type="submit">회원가입</button>
                        </li>
                    </ul>
                </form>
            </div>
            <ErrorBox error={errorMessage} />
        </>
    )
}