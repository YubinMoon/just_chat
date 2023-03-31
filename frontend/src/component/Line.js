import styles from './Line.module.css'

export default function Line({ type = "text", exp, state, onChange, onBlur = null, hint=null }) {
    return (
        <>
            <div>
                <label className={styles.label} htmlFor={exp}>{exp}</label>
                <span className={styles.required}>*</span>
            </div>
            <input autoComplete='off' className={styles.inputbox} type={type} id={exp} value={state} placeholder={hint} onChange={onChange} onBlur={onBlur} />
        </>
    )
}