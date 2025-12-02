import { type FC } from 'react'
import { Link } from 'react-router-dom'

interface NavbarProps {
    currentView: 'employees' | 'cameraLogs'
    onViewChange: (view: 'employees' | 'cameraLogs') => void
    onLogout: () => void
    userName: string
    userDepartment: string
}

const Navbar: FC<NavbarProps> = ({ currentView, onLogout, userName, userDepartment }) => {
    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            background: 'white',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
            <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
                <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.025em'
                }}>
                    Appsilon
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <NavButton
                        active={currentView === 'employees'}
                        to="/employees"
                    >
                        Employees
                    </NavButton>
                    <NavButton
                        active={currentView === 'cameraLogs'}
                        to="/camera-logs"
                    >
                        Camera Logs
                    </NavButton>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2d3748' }}>{userName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#718096' }}>{userDepartment}</div>
                </div>
                <button
                    onClick={onLogout}
                    style={{
                        padding: '0.5rem 1rem',
                        background: '#fff5f5',
                        color: '#e53e3e',
                        border: '1px solid #fed7d7',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fed7d7'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff5f5'}
                >
                    Logout
                </button>
            </div>
        </nav>
    )
}

const NavButton: FC<{ active: boolean; to: string; children: React.ReactNode }> = ({ active, to, children }) => (
    <Link
        to={to}
        style={{
            background: active ? '#ebf4ff' : 'transparent',
            border: 'none',
            color: active ? '#5a67d8' : '#718096',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            transition: 'all 0.2s',
            textDecoration: 'none',
            display: 'inline-block'
        }}
    >
        {children}
    </Link>
)

export default Navbar
