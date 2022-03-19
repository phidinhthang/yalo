import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ScreenLoader } from './ui/ScreenLoader';
const LoginPage = React.lazy(() => import('./modules/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./modules/auth/RegisterPage'));
const ConversationPage = React.lazy(
  () => import('./modules/conversation/ConversationPage')
);
const GroupPreviewPage = React.lazy(
  () => import('./modules/conversation/GroupPreviewPage')
);
const FriendPage = React.lazy(() => import('./modules/friend/FriendPage'));
const MainPage = React.lazy(() => import('./modules/main/MainPage'));

export const Routers = React.memo(() => {
  return (
    <React.Suspense fallback={<ScreenLoader />}>
      <Routes>
        <Route path='/' element={<MainPage />} />
        <Route path='/f' element={<FriendPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/conversations' element={<ConversationPage />} />
        <Route path='/g/:inviteLinkToken' element={<GroupPreviewPage />} />
        <Route path='test' element={<ScreenLoader />} />
      </Routes>
    </React.Suspense>
  );
});
