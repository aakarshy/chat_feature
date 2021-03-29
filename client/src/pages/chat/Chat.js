import React, { useEffect } from 'react';
import RoomList from 'components/roomlist/RoomList';
import ChatBox from 'pages/chat/chatbox/ChatBox';
import ChatForm from 'components/chatform/ChatForm';
import io from 'socket.io-client';
import Axios from 'axios';

import { Redirect } from 'react-router-dom';
import { CTX } from 'context/Store';

import './Chat.scss';

let socket;

const Chat = () => {
  const [appState, updateState] = React.useContext(CTX);

  if (appState.userId) {
    socket = io(
      `http://localhost:8000?profilePicUrl=${appState.profilePicUrl}&name=${appState.name}&userId=${appState.userId}`
    );
    socket.emit('updateAndSendOnlineUsers');
  }
  useEffect(() => {
    if (socket) {
      socket.emit('updateAndSendOnlineUsers');
    }

    return () => {
      if (socket) {
        socket.removeAllListeners();
        socket.emit('disconnect', socket);
        socket.close();
        socket.off();
      }
    };
  }, []);

  useEffect(() => {
    const name = localStorage.getItem('name');
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    const auth = async () => {
      if (token) {
        const authenticatedUser = await Axios.post(
          '/auth',
          { name, userId },
          { headers: { 'x-auth-token': token } }
        );
        if (authenticatedUser.status === 200) {
          updateState({
            type: 'AUTH',
            payload: {
              name: authenticatedUser.data.name,
              userId: authenticatedUser.data._id,
              profilePicUrl: authenticatedUser.data.profilePicUrl,
              isLoggedIn: true,
              token
            }
          });

          localStorage.setItem('name', authenticatedUser.data.name);
          localStorage.setItem('userId', authenticatedUser.data._id);
          localStorage.setItem(
            'profilePicUrl',
            authenticatedUser.data.profilePicUrl
          );
        }
      }
    };

    auth();
  }, [updateState]);

  return (
    <>
      <div className='chat-backgroundcontainer'></div>
      <div className='chat-maincontainer'>
        {!appState.isLoggedIn && <Redirect to='/login' />}
        <div className='flex'>
          <RoomList socket={socket} />
          <ChatBox socket={socket} />
        </div>
        <ChatForm socket={socket} />
        <div className='portfolio-link'>
          <b>Chat</b> - Thomas Foydel 2019{' '}
          <b>
            <a
              href='https://thomasfoydel.com'
              target='_blank'
              rel='noopener noreferrer'
            >
              back to my portfolio
            </a>
          </b>
        </div>
      </div>
    </>
  );
};

export default Chat;
