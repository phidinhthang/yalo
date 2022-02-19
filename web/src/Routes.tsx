import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './modules/auth/LoginPage';
import { MainPage } from './modules/main/MainPage';

export const Routers = () => {
  return (
    <Routes>
      <Route path='/' element={<MainPage />} />
      <Route path='/login' element={<LoginPage />} />
    </Routes>
  );
};
