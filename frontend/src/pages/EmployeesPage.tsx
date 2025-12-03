// src/pages/EmployeesPage.tsx
import { useEffect, useState, type FormEvent } from 'react'
import { type Employee, getEmployees, createEmployee, deleteEmployee, updateEmployee, type LoginResponse } from '../services/api'

interface EmployeesPageProps {
    currentUser: LoginResponse
}

export default function EmployeesPage({ currentUser }: EmployeesPageProps) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [department, setDepartment] = useState(currentUser.department);
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [editDepartment, setEditDepartment] = useState("");

    // ... existing loadEmployees ...

    async function handleCreate(e: FormEvent) {
        e.preventDefault();
        if (!name.trim()) { setError("Name is required"); return; }
        if (!department.trim()) { setError("Department is required"); return; }
        if (!password.trim()) { setError("Password is required"); return; }

        try {
            setSubmitting(true);
            setError(null);

            let rawName = name.split('@')[0];
            let formattedName = rawName.replace(/[^a-zA-Z0-9]/g, '');
            if (!formattedName) { setError("Invalid name format"); setSubmitting(false); return; }

            const generatedEmail = `${formattedName}@example.com`;

            const created = await createEmployee({ name: formattedName, email: generatedEmail, department, password }, currentUser.department);

            if (created.department === currentUser.department) {
                setEmployees((prev) => [...prev, created]);
            }

            setName("");
            setPassword("");
        } catch (err: any) {
            console.error(err);
            if (err.message.includes("zaten var")) alert(err.message);
            setError(err.message ?? "Error while creating employee");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleUpdate(e: FormEvent) {
        e.preventDefault();
        if (!editingId) return;

        try {
            setSubmitting(true);
            setError(null);

            let rawName = editName.split('@')[0];
            let formattedName = rawName.replace(/[^a-zA-Z0-9]/g, '');
            if (!formattedName) { setError("Invalid name format"); setSubmitting(false); return; }

            const generatedEmail = `${formattedName}@example.com`;
            const employeeToUpdate = employees.find(e => e.id === editingId);
            if (!employeeToUpdate) return;

            const updatedData = {
                ...employeeToUpdate,
                name: formattedName,
                email: generatedEmail,
                department: editDepartment
            };

            await updateEmployee(editingId, updatedData);

            setEmployees(prev => prev.map(emp => emp.id === editingId ? { ...emp, name: formattedName, email: generatedEmail, department: editDepartment } : emp));
            closeModal();
        } catch (err: any) {
            console.error(err);
            setError(err.message ?? "Error while updating employee");
        } finally {
            setSubmitting(false);
        }
    }

    function openEditModal(employee: Employee) {
        setEditingId(employee.id);
        setEditName(employee.name);
        setEditDepartment(employee.department);
        setIsModalOpen(true);
        setError(null);
    }

    function closeModal() {
        setIsModalOpen(false);
        setEditingId(null);
        setEditName("");
        setEditDepartment("");
        setError(null);
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
            border: '1px solid #e2e8f0',
            position: 'relative'
        }}>
            {/* Modal Overlay */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        width: '400px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        <h2 style={{ marginTop: 0, color: '#2d3748' }}>Update Employee</h2>
                        <form onSubmit={handleUpdate}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4a5568' }}>Name</label>
                                <input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e0' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4a5568' }}>Department</label>
                                <select
                                    value={editDepartment}
                                    onChange={(e) => setEditDepartment(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e0' }}
                                >
                                    <option value="IT">IT</option>
                                    <option value="HR">HR</option>
                                    <option value="Finance">Finance</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button type="button" onClick={closeModal} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #feb2b2', background: '#fff5f5', color: '#c53030', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                                <button type="submit" disabled={submitting} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: '#667eea', color: 'white', cursor: 'pointer' }}>
                                    {submitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#2d3748', fontWeight: 700 }}>Employees</h1>
            </div>

            {/* Create Form */}
            <form onSubmit={handleCreate} style={{ marginBottom: "2rem", display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem' }}>Name</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ padding: "0.75rem", width: "100%", borderRadius: '8px', border: '1px solid #bee3f8', fontSize: '0.95rem', outline: 'none', color: '#2d3748', backgroundColor: '#ebf8ff' }}
                        placeholder="Enter name"
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem' }}>Department</label>
                    <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        style={{ padding: "0.75rem", width: "100%", borderRadius: '8px', border: '1px solid #bee3f8', fontSize: '0.95rem', outline: 'none', background: '#ebf8ff', cursor: 'pointer', color: '#2d3748' }}
                    >
                        <option value="IT">IT</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                    </select>
                </div>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem' }}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: "0.75rem", width: "100%", borderRadius: '8px', border: '1px solid #bee3f8', fontSize: '0.95rem', outline: 'none', color: '#2d3748', backgroundColor: '#ebf8ff' }}
                        placeholder="••••••••"
                    />
                </div>
                <button
                    type="submit"
                    disabled={submitting}
                    style={{ padding: "0.75rem 1.5rem", background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', transition: 'background 0.2s', height: '46px', opacity: submitting ? 0.7 : 1 }}
                >
                    {submitting ? 'Adding...' : 'Add Employee'}
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
                                </td>
                                <td style={{ padding: '1rem', borderBottom: index === employees.length - 1 ? 'none' : '1px solid #e2e8f0', textAlign: 'right' }}>
                                    <button
                                        onClick={() => openEditModal(emp)}
                                        style={{ background: '#fffaf0', color: '#dd6b20', border: '1px solid #fbd38d', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s', marginRight: '0.5rem' }}
                                    >
                                        Update
                                    </button>
                                    <button
                                        onClick={() => handleDelete(emp.id)}
                                        style={{ background: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}
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
