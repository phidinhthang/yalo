import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DetailedPost } from './modules/album/DetailedPost';
import { MainFeed } from './modules/album/MainFeed';
import FriendAnchorPage from './modules/friend/FriendAnchorPage';
// import { MentionTest } from './ui/Mention/Test';
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
const SettingPage = React.lazy(
  () => import('./modules/user-setting/SettingPage')
);
const AlbumPage = React.lazy(() => import('./modules/album/AlbumPage'));

export const Routers = React.memo(() => {
  return (
    <React.Suspense fallback={<ScreenLoader />}>
      <Routes>
        <Route path='/' element={<MainPage />} />
        <Route path='/f' element={<FriendPage />} />
        <Route path='/@f' element={<FriendAnchorPage />} />
        <Route path='/a' element={<AlbumPage />}>
          <Route index element={<MainFeed />} />
          <Route path=':postId' element={<DetailedPost />} />
        </Route>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/conversations' element={<ConversationPage />} />
        <Route path='/s' element={<SettingPage />} />
        <Route path='/g/:inviteLinkToken' element={<GroupPreviewPage />} />
        {/* <Route path='test' element={<MentionTest />} /> */}
      </Routes>
    </React.Suspense>
  );
});
