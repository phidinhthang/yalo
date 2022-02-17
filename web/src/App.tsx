import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ReactQueryDevtools } from 'react-query/devtools';
import { LoginPage } from './modules/auth/LoginPage';
import { ConnectionProvider } from './modules/conn/ConnectionProvider';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<h1>hello world</h1>} />
            <Route path='/login' element={<LoginPage />} />
          </Routes>
        </BrowserRouter>
      </ConnectionProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
