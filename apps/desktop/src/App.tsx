import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './stores/authStore';
import PluginLayout from './components/plugin/PluginLayout';
import LoginPage from './pages/LoginPage';
import ErrorBoundary from './components/common/ErrorBoundary';
import OfflineScreen from './components/onboarding/OfflineScreen';
import { useOnlineStatus } from './hooks/useOnlineStatus';

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const online = useOnlineStatus();

  return (
    <ErrorBoundary>
      {isAuthenticated ? <PluginLayout /> : <LoginPage />}
      <AnimatePresence>{!online && <OfflineScreen key="offline" />}</AnimatePresence>
    </ErrorBoundary>
  );
}
