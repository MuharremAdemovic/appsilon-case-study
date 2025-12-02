// src/pages/EmployeesPage.tsx
import { useEffect, useState, type FormEvent } from 'react'
import { type Employee, getEmployees, createEmployee, type LoginResponse } from '../services/api'

interface EmployeesPageProps {
    currentUser: LoginResponse
}

export default function EmployeesPage({ currentUser }: EmployeesPageProps) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [department, setDepartment] = useState("IT");
    const [password, setPassword] = useState("");

    // İlk açılışta çalışanları çek
    useEffect(() => {
        loadEmployees();
    }, [currentUser.id]); // currentUser değişirse tekrar çek

    async function loadEmployees() {
        try {
            setLoading(true);
            setError(null);
            // currentUser.id'yi gönderiyoruz
            const data = await getEmployees(currentUser.id);
            setEmployees(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message ?? "Error while fetching employees");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!name.trim() || !department.trim() || !password.trim()) return;

        try {
            setError(null);
            // createEmployee çağrısına password ve currentUser.department ekliyoruz
            const created = await createEmployee({ name, department, password }, currentUser.department);
            setEmployees((prev) => [...prev, created]);
            setName("");
            setDepartment("IT");
            setPassword("");
        } catch (err: any) {
            console.error(err);
            setError(err.message ?? "Error while creating employee");
        }
    }

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            padding: '2rem',
            border: '1px solid #e2e8f0'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#2d3748', fontWeight: 700 }}>Employees</h1>
            </div>

            <form onSubmit={handleSubmit} style={{ marginBottom: "2rem", display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem' }}>
                        Name
                    </label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{
                            padding: "0.75rem",
                            width: "100%",
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.95rem',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            color: '#2d3748'
                        }}
                        placeholder="John Doe"
                    />
                </div>

                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem' }}>
                        Department
                    </label>
                    <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        style={{
                            padding: "0.75rem",
                            width: "100%",
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.95rem',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            background: 'white',
                            cursor: 'pointer',
                            color: '#2d3748'
                        }}
                    >
                        <option value="IT">IT</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                    </select>
                </div>

                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem' }}>
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            padding: "0.75rem",
                            width: "100%",
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.95rem',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            color: '#2d3748'
                        }}
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        padding: "0.75rem 1.5rem",
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        height: '46px'
                    }}
                >
                    Add Employee
                </button>
            </form>

            {loading && <p style={{ color: '#718096' }}>Loading employees...</p>}
            {error && <p style={{ color: "#e53e3e", background: '#fff5f5', padding: '1rem', borderRadius: '8px' }}>{error}</p>}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                    <thead>
                        <tr style={{ background: '#f7fafc' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', borderTopLeftRadius: '8px' }}>Name</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Department</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', borderTopRightRadius: '8px' }}>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp, index) => (
                            <tr key={emp.id} style={{ transition: 'background 0.1s' }}>
                                <td style={{ padding: '1rem', borderBottom: index === employees.length - 1 ? 'none' : '1px solid #e2e8f0', color: '#2d3748', fontWeight: 500 }}>{emp.name}</td>
                                <td style={{ padding: '1rem', borderBottom: index === employees.length - 1 ? 'none' : '1px solid #e2e8f0', color: '#4a5568' }}>
                                    <span style={{ background: '#ebf4ff', color: '#5a67d8', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600 }}>
                                        {emp.department}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', borderBottom: index === employees.length - 1 ? 'none' : '1px solid #e2e8f0', color: '#718096', fontSize: '0.9rem' }}>
                                    {new Date(emp.createdAt).toLocaleDateString()} <span style={{ color: '#cbd5e0' }}>•</span> {new Date(emp.createdAt).toLocaleTimeString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
