import ServerPannel from './ServerPannel'
import ChannelPannel from './ChannelPannel'
import styles from './Main.module.css'
import useStore from '../lib/store'
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'

export default function SidePannel() {
    const { currentServer } = useStore()
    return (
        <div className="flex">
            <ServerPannel />
            {currentServer && <ChannelPannel />}
        </div>
    )
}