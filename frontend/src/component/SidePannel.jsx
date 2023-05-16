import ServerPannel from './ServerPannel'
import ChannelPannel from './ChannelPannel'
import useStore from '../lib/store'
import { useLayoutEffect } from 'react'

export default function SidePannel() {
    return (
        <div className="flex">
            <ServerPannel />
            <ChannelPannel />
        </div>
    )
}