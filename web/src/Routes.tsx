import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './modules/auth/LoginPage';
import { RegisterPage } from './modules/auth/RegisterPage';
import { ConversationPage } from './modules/conversation/ConversationPage';
import { MainPage } from './modules/main/MainPage';
import { UserPage } from './modules/user/UserPage';

export const Routers = React.memo(() => {
  return (
    <Routes>
      <Route path='/' element={<MainPage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/users' element={<UserPage />} />
      <Route path='/conversations' element={<ConversationPage />} />
    </Routes>
  );
});
