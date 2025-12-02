import { useState, type FormEvent } from 'react'
import { login } from '../services/api'

interface LoginPageProps {
    onLoginSuccess: (user: any) => void
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (!email || !password) return

        try {
            setIsLoading(true)
            setError(null)
            const user = await login({ email, password })
            onLoginSuccess(user)
        } catch (err: any) {
            setError('Login failed. Please check your credentials.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: "'Inter', sans-serif",
            padding: '1rem'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                padding: '3rem',
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                width: '100%',
                maxWidth: '420px',
                transition: 'transform 0.3s ease'
            }}>
                <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                    <h1 style={{
                        margin: 0,
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: '#2d3748',
                        letterSpacing: '-0.025em'
                    }}>
                        Welcome Back
                    </h1>
                    <p style={{
                        margin: '0.75rem 0 0',
                        color: '#718096',
                        fontSize: '0.95rem'
                    }}>
                        Sign in to access your dashboard
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#4a5568',
                            marginLeft: '0.25rem'
                        }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                borderRadius: '12px',
                                border: '2px solid #e2e8f0',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.2s',
                                backgroundColor: '#f7fafc',
                                color: '#2d3748'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#667eea';
                                e.target.style.backgroundColor = '#fff';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.backgroundColor = '#f7fafc';
                            }}
                            placeholder="name@company.com"
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#4a5568',
                            marginLeft: '0.25rem'
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                borderRadius: '12px',
                                border: '2px solid #e2e8f0',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.2s',
                                backgroundColor: '#f7fafc',
                                color: '#2d3748'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#667eea';
                                e.target.style.backgroundColor = '#fff';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.backgroundColor = '#f7fafc';
                            }}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            marginBottom: '1.5rem',
                            padding: '0.75rem',
                            background: '#fff5f5',
                            color: '#e53e3e',
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                            textAlign: 'center',
                            fontWeight: 500,
                            border: '1px solid #fed7d7'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.8 : 1,
                            transition: 'transform 0.1s, opacity 0.2s',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    )
}
