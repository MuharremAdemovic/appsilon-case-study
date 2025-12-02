// src/pages/EmployeesPage.tsx
import { useEffect, useState, type FormEvent } from 'react'
import { type Employee, getEmployees, createEmployee, deleteEmployee, updateEmployee, type LoginResponse } from '../services/api'

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
    const [editingId, setEditingId] = useState<string | null>(null);

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
        if (!name.trim() || !department.trim()) return;

        // Password check only for new employees
        if (!editingId && !password.trim()) return;

        try {
            setError(null);

            // Format name: extract before @ (if user typed it) and keep only letters and numbers
            // If user just typed "John", split is ["John"].
            let rawName = name.split('@')[0];
            let formattedName = rawName.replace(/[^a-zA-Z0-9]/g, '');

            // Auto-generate email
            const generatedEmail = `${formattedName}@example.com`;

            if (editingId) {
                // Update existing employee
                // We need to pass the full object including ID for the backend check
                const employeeToUpdate = employees.find(e => e.id === editingId);
                if (!employeeToUpdate) return;

                const updatedData = {
                    ...employeeToUpdate,
                    name: formattedName,
                    email: generatedEmail, // Update email as well
                    department
                };

                await updateEmployee(editingId, updatedData);

                setEmployees(prev => prev.map(emp => emp.id === editingId ? { ...emp, name: formattedName, email: generatedEmail, department } : emp));
                setEditingId(null);
            } else {
                // Create new employee
                // name: formattedName (e.g. "JohnDoe")
                // email: generatedEmail (e.g. "JohnDoe@example.com")
                const created = await createEmployee({ name: formattedName, email: generatedEmail, department, password }, currentUser.department);

                // Sadece eğer eklenen kişi benim departmanımdaysa listeye ekle
                if (created.department === currentUser.department) {
                    setEmployees((prev) => [...prev, created]);
                }
            }

            setName("");
            setDepartment("IT");
            setPassword("");
        } catch (err: any) {
            console.error(err);
            if (err.message.includes("zaten var")) {
                alert(err.message); // Show the specific backend message
            }
            setError(err.message ?? "Error while creating employee");
        }
    }

    function startEdit(employee: Employee) {
        setEditingId(employee.id);
        setName(employee.name); // Or email if we had it stored separately, but name is formatted
        setDepartment(employee.department);
        setPassword(""); // Password usually not editable this way or kept empty
    }

    function cancelEdit() {
        setEditingId(null);
        setName("");
        setDepartment("IT");
        setPassword("");
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this employee?")) return;

        try {
            await deleteEmployee(id);
            setEmployees((prev) => prev.filter(e => e.id !== id));
        } catch (err: any) {
            console.error(err);
            setError(err.message ?? "Error while deleting employee");
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
                            border: '1px solid #bee3f8',
                            fontSize: '0.95rem',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            color: '#2d3748',
                            backgroundColor: '#ebf8ff'
                        }}
                        placeholder="Enter name"
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
                            border: '1px solid #bee3f8',
                            fontSize: '0.95rem',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            background: '#ebf8ff', // Baby blue
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
                            border: '1px solid #bee3f8', // Lighter blue border
                            fontSize: '0.95rem',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            color: '#2d3748',
                            backgroundColor: '#ebf8ff' // Baby blue background
                        }}
                        placeholder={editingId ? "Unchanged" : "••••••••"}
                        disabled={!!editingId}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {editingId && (
                        <button
                            type="button"
                            onClick={cancelEdit}
                            style={{
                                padding: "0.75rem 1.5rem",
                                background: '#e2e8f0',
                                color: '#4a5568',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                                height: '46px'
                            }}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        style={{
                            padding: "0.75rem 1.5rem",
                            background: editingId ? '#ed8936' : '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            height: '46px'
                        }}
                    >
                        {editingId ? 'Update Employee' : 'Add Employee'}
                    </button>
                </div>
            </form>

            {loading && <p style={{ color: '#718096' }}>Loading employees...</p>}
            {error && <p style={{ color: "#e53e3e", background: '#fff5f5', padding: '1rem', borderRadius: '8px' }}>{error}</p>}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                    <thead>
                        <tr style={{ background: '#f7fafc' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', borderTopLeftRadius: '8px' }}>Name</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Department</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Created At</th>
                            <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', borderTopRightRadius: '8px' }}>Actions</th>
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
                                    {new Date(emp.createdAt).toLocaleDateString()}
                                    {emp.updatedAt && (
                                        <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '0.25rem' }}>
                                            Updated: {new Date(emp.updatedAt).toLocaleDateString()}
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '1rem', borderBottom: index === employees.length - 1 ? 'none' : '1px solid #e2e8f0', textAlign: 'right' }}>
                                    <button
                                        onClick={() => startEdit(emp)}
                                        style={{
                                            background: '#fffaf0',
                                            color: '#dd6b20',
                                            border: '1px solid #fbd38d',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            transition: 'all 0.2s',
                                            marginRight: '0.5rem'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fbd38d'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#fffaf0'}
                                    >
                                        Update
                                    </button>
                                    <button
                                        onClick={() => handleDelete(emp.id)}
                                        style={{
                                            background: '#fff5f5',
                                            color: '#e53e3e',
                                            border: '1px solid #fed7d7',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fed7d7'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#fff5f5'}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
