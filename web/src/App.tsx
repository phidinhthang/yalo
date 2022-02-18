import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ReactQueryDevtools } from 'react-query/devtools';
import { LoginPage } from './modules/auth/LoginPage';
import { ConnectionProvider } from './modules/conn/ConnectionProvider';
import { MainPage } from './modules/main/MainPage';
import { Routers } from './Routes';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider>
        <BrowserRouter>
          <Routers />
        </BrowserRouter>
      </ConnectionProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
