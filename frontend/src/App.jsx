import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
