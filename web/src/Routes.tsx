import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './modules/auth/LoginPage';
import { RegisterPage } from './modules/auth/RegisterPage';
import { ConversationPage } from './modules/conversation/ConversationPage';
import { MainPage } from './modules/main/MainPage';
import { useDarkMode } from './shared-hooks/useDarkMode';

export const Routers = React.memo(() => {
  const [enabled, setEnabled] = useDarkMode();
  return (
    <Routes>
      <Route path='/' element={<MainPage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/conversations' element={<ConversationPage />} />
      <Route path='test' element={<div>test page</div>} />
    </Routes>
  );
});
