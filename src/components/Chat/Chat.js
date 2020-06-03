import React, { useState, useEffect } from 'react'
import queryString from 'query-string'
import io from 'socket.io-client'

import TextContainer from '../TextContainer/TextContainer'
import Messages from '../Messages/Messages'
import InfoBar from '../InfoBar/InfoBar'
import Input from '../Input/Input'

import './Chat.css'

let socket

const Chat = ({ location }) => {
  const [name, setName] = useState('')
  const [room, setRoom] = useState('')
  const [users, setUsers] = useState('')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const ENDPOINT = 'localhost:3000'

  useEffect(() => {
    const { name, room } = queryString.parse(location.search)

    socket = io(ENDPOINT)

    setRoom(room)
    setName(name)

    socket.on('connect', () => {
      socket.emit('authentication', {
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QG1haWwuY29tIiwidHlwZSI6InVzZXIiLCJpYXQiOjE1OTEwOTMwNzZ9.6HsSiDa3J8RtGLAk8F-BuCWI1XDM4nEijUhk6p4OeLE'
      })
      socket.on('unauthorized', err => {
        alert(`There was an error with the authentication: ${err.message}`)
      })
      socket.on('authenticated', () => {
        alert('successfully authorized')
        socket.emit('join', { name, room }, error => {
          if (error) {
            alert(JSON.stringify(error))
          }
        })
      })
    })
  }, [ENDPOINT, location.search])

  useEffect(() => {
    socket.on('message', message => {
      setMessages(messages => [...messages, message])
    })

    socket.on('roomData', ({ users }) => {
      setUsers(users)
    })
  }, [])

  const sendMessage = event => {
    event.preventDefault()

    if (message) {
      socket.emit('sendMessage', message, () => setMessage(''))
    }
  }

  return (
    <div className="outerContainer">
      <div className="container">
        <InfoBar room={room} />
        <Messages messages={messages} name={name} />
        <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
      </div>
      <TextContainer users={users} />
    </div>
  )
}

export default Chat
