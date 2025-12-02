import { useState } from 'react'
import EmployeesPage from './pages/EmployeesPage'
import CameraLogsPage from './pages/CameraLogsPage'
import LoginPage from './pages/LoginPage'
import Navbar from './components/Navbar'
import type { LoginResponse } from './services/api'

function App() {
  const [user, setUser] = useState<LoginResponse | null>(null)
  const [currentView, setCurrentView] = useState<'employees' | 'cameraLogs'>('employees')

  if (!user) {
    return <LoginPage onLoginSuccess={setUser} />
  }

  return (
    <div style={{ fontFamily: 'sans-serif', background: '#f7fafc', minHeight: '100vh' }}>
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={() => setUser(null)}
        userName={user.name}
        userDepartment={user.department}
      />

      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
        {currentView === 'employees' ? (
          <EmployeesPage currentUser={user} />
        ) : (
          <CameraLogsPage />
        )}
      </main>
    </div>
  )
}

export default App
