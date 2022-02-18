import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './modules/auth/LoginPage';
import { useConn } from './modules/conn/useConn';
import { MainPage } from './modules/main/MainPage';

export const Routers = () => {
  const conn = useConn();
  if (!conn) return null;
  return (
    <Routes>
      <Route path='/' element={<MainPage />} />
      <Route path='/login' element={<LoginPage />} />
    </Routes>
  );
};
