import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ConnectionProvider } from './modules/conn/ConnectionProvider';
import { Routers } from './Routes';
import { MainWsHandlerProvider } from './shared-hooks/useMainWsHandler';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ConnectionProvider>
          <MainWsHandlerProvider>
            <Routers />
            <ToastContainer position='top-right' autoClose={2000} />
          </MainWsHandlerProvider>
        </ConnectionProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
