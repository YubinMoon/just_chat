import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom';
import styles from './Pannel.module.css'
import fastapi from '../lib/api'
import ErrorBox, { handleError, errorMessage } from './ErrorBox';

export default function ChatArea({ channel }) {
    console.log(channel)
    return (
        <div>
            asdf
        </div>
    )
}