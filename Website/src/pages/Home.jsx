import React from 'react'
import Navbar from '../components/Navbar'
import LoginPage from '../components/Login'
import ChatPage from './ChatPage'

const Home = () => {
    const data = localStorage.getItem("user")

    return (
        <div>
            {data ? <ChatPage /> : <LoginPage />}      
        </div>
    )
}

export default Home