// src/pages/EmployeesPage.tsx

import { useEffect, useState, type FormEvent } from "react";
import { getEmployees, createEmployee } from "../services/api";

// Eğer Employee tipini api.ts içinde export ETMİYORSAN,
// burada local olarak tanımlamak en kolayı:
interface Employee {
    id: string;
    name: string;
    department: string;
    createdAt: string;
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [department, setDepartment] = useState("");

    // İlk açılışta çalışanları çek
    useEffect(() => {
        loadEmployees();
    }, []);

    async function loadEmployees() {
        try {
            setLoading(true);
            setError(null);
            // BURASI ÖNEMLİ: fetchEmployees DEĞİL, getEmployees
            const data = await getEmployees();
            setEmployees(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message ?? "Error while fetching employees");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!name.trim() || !department.trim()) return;

        try {
            setError(null);
            const created = await createEmployee({ name, department });
            setEmployees((prev) => [...prev, created]);
            setName("");
            setDepartment("");
        } catch (err: any) {
            console.error(err);
            setError(err.message ?? "Error while creating employee");
        }
    }

    return (
        <div
            style={{
                maxWidth: 600,
                margin: "2rem auto",
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            }}
        >
            <h1>Employees</h1>

            <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
                <div style={{ marginBottom: "0.5rem" }}>
                    <label>
                        Name:{" "}
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ padding: "0.3rem", width: "100%" }}
                        />
                    </label>
                </div>

                <div style={{ marginBottom: "0.5rem" }}>
                    <label>
                        Department:{" "}
                        <input
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            style={{ padding: "0.3rem", width: "100%" }}
                        />
                    </label>
                </div>

                <button
                    type="submit"
                    style={{ padding: "0.4rem 0.8rem", cursor: "pointer" }}
                >
                    Add Employee
                </button>
            </form>

            {loading && <p>Loading employees...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <ul style={{ listStyle: "none", padding: 0 }}>
                {employees.map((emp) => (
                    <li
                        key={emp.id}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: 6,
                            padding: "0.5rem 0.75rem",
                            marginBottom: "0.5rem",
                        }}
                    >
                        <div>
                            <strong>{emp.name}</strong> — {emp.department}
                        </div>
                        <small>
                            Created at: {new Date(emp.createdAt).toLocaleString()}
                        </small>
                    </li>
                ))}
            </ul>
        </div>
    );
}
