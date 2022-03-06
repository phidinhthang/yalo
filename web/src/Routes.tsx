import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './modules/auth/LoginPage';
import { RegisterPage } from './modules/auth/RegisterPage';
import { ChatInput } from './modules/chat/ChatInput';
import { ConversationPage } from './modules/conversation/ConversationPage';
import { MainPage } from './modules/main/MainPage';

export const Routers = React.memo(() => {
  return (
    <Routes>
      <Route path='/' element={<MainPage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/conversations' element={<ConversationPage />} />
      <Route
        path='test'
        element={
          <div className='h-screen flex flex-col'>
            <div className='flex-auto'>a</div>
            <ChatInput />
          </div>
        }
      />
    </Routes>
  );
});
