import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import EmployeesPage from './pages/EmployeesPage'
import CameraLogsPage from './pages/CameraLogsPage'
import LoginPage from './pages/LoginPage'
import Navbar from './components/Navbar'
import type { LoginResponse } from './services/api'

function Layout({ user, onLogout }: { user: LoginResponse, onLogout: () => void }) {
  const location = useLocation();
  const currentView = location.pathname.includes('camera-logs') ? 'cameraLogs' : 'employees';

  return (
    <div style={{ fontFamily: 'sans-serif', background: '#f7fafc', minHeight: '100vh' }}>
      <Navbar
        currentView={currentView}
        onViewChange={() => { }} // Navbar links will handle navigation now
        onLogout={onLogout}
        userName={user.name}
        userDepartment={user.department}
      />
      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
        <Routes>
          <Route path="/employees" element={<EmployeesPage currentUser={user} />} />
          <Route path="/camera-logs" element={<CameraLogsPage />} />
          <Route path="*" element={<Navigate to="/employees" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<LoginResponse | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage onLoginSuccess={setUser} /> : <Navigate to="/employees" replace />} />
        <Route path="/*" element={user ? <Layout user={user} onLogout={() => setUser(null)} /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
