import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { RoomProvider } from './context/RoomContext';
import Home from './pages/Home';
import Join from './pages/Join';
import Admin from './pages/Admin';
import Team from './pages/Team';
import Results from './pages/Results';

export default function App() {
  return (
    <BrowserRouter>
      <RoomProvider>
        {/* Toast notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a2e',
              color: '#f1f5f9',
              border: '1px solid #2a2a40',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            },
            success: {
              iconTheme: { primary: '#f5c518', secondary: '#0a0a0f' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
            },
          }}
        />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/join" element={<Join />} />
          <Route path="/join/:code" element={<Join />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/team" element={<Team />} />
          <Route path="/results" element={<Results />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RoomProvider>
    </BrowserRouter>
  );
}
