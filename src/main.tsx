import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { useThemeStore } from './lib/hooks/useThemeStore';

function Root() {
  const initTheme = useThemeStore((s) => s.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <StrictMode>
      <App />
    </StrictMode>
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<Root />);
}
