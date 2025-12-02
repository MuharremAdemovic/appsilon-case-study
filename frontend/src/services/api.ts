// src/services/api.ts

// 1) Employee tipini burada tanımlıyoruz ve EXPORT ediyoruz
export interface Employee {
    id: string
    name: string
    department: string
    createdAt: string
}

// 2) Backend base URL (portu kendi backend’ine göre ayarla)
const API_BASE_URL = 'http://localhost:5185' // dotnet run çıktısındaki HTTP port

// 3) Tüm çalışanları çek
export async function getEmployees(): Promise<Employee[]> {
    const res = await fetch(`${API_BASE_URL}/employees`)
    if (!res.ok) {
        throw new Error('Failed to fetch employees')
    }
    return res.json()
}

// 4) Yeni çalışan ekle
export async function createEmployee(
    data: Omit<Employee, 'id' | 'createdAt'>
): Promise<Employee> {
    const res = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        throw new Error('Failed to create employee')
    }
    return res.json()
}
