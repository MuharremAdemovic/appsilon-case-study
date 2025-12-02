const API_BASE_URL = "http://localhost:5185";

// 3) Login ol
export interface LoginRequest {
    email: string
    password: string // Backend'de password kontrolü basitçe string karşılaştırma ise
}

export interface LoginResponse {
    id: string
    name: string
    email: string
    department: string
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE_URL}/api/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        throw new Error('Login failed')
    }
    return res.json()
}

// 4) Tüm çalışanları çek (X-Employee-Id header ile)
export async function getEmployees(currentEmployeeId: string): Promise<Employee[]> {
    const res = await fetch(`${API_BASE_URL}/api/Employees`, {
        headers: {
            'X-Employee-Id': currentEmployeeId
        }
    })
    if (!res.ok) {
        throw new Error('Failed to fetch employees')
    }
    return res.json()
}

// 5) Yeni çalışan ekle
export async function createEmployee(
    data: Omit<Employee, 'id' | 'createdAt'> & { password: string },
    currentDepartment: string
): Promise<Employee> {
    const res = await fetch(`${API_BASE_URL}/api/Employees`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Department': currentDepartment
        },
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        throw new Error('Failed to create employee')
    }
    return res.json()
}

// 6) Camera Logs
export interface CameraLog {
    id: string
    imageUrl: string
    modelOutputJson: string
    createdAt: string
}

export async function getCameraLogs(): Promise<CameraLog[]> {
    const res = await fetch(`${API_BASE_URL}/api/CameraLogs`)
    if (!res.ok) {
        throw new Error('Failed to fetch camera logs')
    }
    return res.json()
}

export type Employee = {
    id: string;
    name: string;
    department: string;
    createdAt: string;
};
