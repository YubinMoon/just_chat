import React, { useEffect, useState } from 'react'
import fastapi from '../lib/api'
import { Outlet, useNavigate, useRoutes, useParams } from 'react-router-dom';
import useStore from '../lib/store';
import { RightConsoleTransparent, Cross } from './SVG';

const ServerCreate = ({ }) => {
    return (
        <div className="flex relative mb-2 md:hover:bg-white">
            <div className={"rounded-3xl transition-all hover:rounded-2xl hover:bg-violet-800 flex m-auto justify-center items-center w-14 h-14 bg-neutral-700 mx-1.5 group"}>
                <div className="relative w-7 h-7 stroke-green-600 transition-all group-hover:stroke-white">
                    <Cross />
                </div>
            </div>
        </div>
    )
}

const ServerBox = ({ children, selected, onClick, backImage }) => {
    return (
        <div className="flex relative mb-2">
            <div className={(selected ? "flex" : "hidden") + ' flex-col absolute h-full justify-center'}>
                <div className='bg-white w-1 h-10 rounded-r-sm' />
            </div>
            <div className={(selected ? "rounded-2xl" : "rounded-3xl transition-all hover:rounded-2xl hover:bg-emerald-700") + " flex m-auto justify-center items-center w-14 h-14 bg-neutral-700 mx-1.5"} onClick={onClick}>
                {children}
            </div>
        </div>
    )
}

export default function ServerList() {
    const { serverList } = useStore(state => state)
    const { server, channel } = useParams()
    const navigate = useNavigate()

    return (
        <>
            <div className={"bg-neutral-900 overflow-scroll scrollbar-none pt-3"}>
                <ServerBox selected={!server} onClick={() => { navigate("/") }}>
                    <div className="relative w-9 h-9">
                        <RightConsoleTransparent />
                    </div>
                </ServerBox>
                <div className='flex justify-center pb-2'>
                    <div className='bg-neutral-500 w-10 h-px'></div>
                </div>
                {serverList.map(e => (
                    <ServerBox selected={e.id == server} onClick={() => { navigate("/" + e.id) }} key={e.id}>
                        {e && <div className='text-2xl text-white items-center flex justify-center'>
                            <span>
                                {e.name.toUpperCase()[0]}
                            </span>
                        </div>}
                    </ServerBox>
                ))}
                <ServerCreate />
            </div>
        </>
    )
}