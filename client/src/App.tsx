import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LobbyPage } from './pages/LobbyPage';
import { SessionPage } from './pages/SessionPage';
import { AddGamePage } from './pages/AddGamePage';
import { AdminPage } from './pages/AdminPage';
import { useSocket } from './hooks/useSocket';

export function App() {
  useSocket();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LobbyPage />} />
        <Route path="/session/:sessionId" element={<SessionPage />} />
        <Route path="/add-game" element={<AddGamePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
