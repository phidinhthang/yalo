import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './modules/auth/LoginPage';
import { RegisterPage } from './modules/auth/RegisterPage';
import { ConversationPage } from './modules/conversation/ConversationPage';
import { GroupPreviewPage } from './modules/conversation/GroupPreviewPage';
import { MainPage } from './modules/main/MainPage';

export const Routers = React.memo(() => {
  return (
    <Routes>
      <Route path='/' element={<MainPage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/conversations' element={<ConversationPage />} />
      <Route path='/g/:inviteLinkToken' element={<GroupPreviewPage />} />
      <Route path='test' element={<div>test page</div>} />
    </Routes>
  );
});
