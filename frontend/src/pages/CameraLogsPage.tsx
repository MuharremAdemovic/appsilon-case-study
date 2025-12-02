import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react'
import { type CameraLog, getCameraLogs, uploadCameraLog } from '../services/api'

// Helper to resolve image URL if relative
const API_BASE_URL = "http://localhost:5185";

export default function CameraLogsPage() {
    const [logs, setLogs] = useState<CameraLog[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        loadLogs()
    }, [])

    async function loadLogs() {
        try {
            setLoading(true)
            const data = await getCameraLogs()
            setLogs(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (!selectedFile) return

        try {
            setSubmitting(true)
            setError(null)

            const newLog = await uploadCameraLog(selectedFile)

            setLogs(prev => [newLog, ...prev])
            setSelectedFile(null)
            // Reset file input
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = "";

        } catch (err: any) {
            console.error(err)
            setError(err.message ?? "Error uploading log")
        } finally {
            setSubmitting(false)
        }
    }

    function getFullImageUrl(url: string) {
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    }

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            padding: '2rem',
            border: '1px solid #e2e8f0'
        }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#2d3748', fontWeight: 700 }}>Camera Logs</h1>
                <p style={{ margin: '0.5rem 0 0', color: '#718096', fontSize: '0.95rem' }}>Upload images to analyze with ML model</p>
            </div>

            <form onSubmit={handleSubmit} style={{ marginBottom: "2rem", display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem' }}>
                        Upload Image
                    </label>
                    <div style={{ position: 'relative', width: '100%', height: '100px' }}>
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                opacity: 0,
                                cursor: 'pointer',
                                zIndex: 2
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                border: '2px dashed #cbd5e0',
                                borderRadius: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#f7fafc',
                                transition: 'all 0.2s',
                                color: '#718096',
                                zIndex: 1
                            }}
                            className="upload-box"
                        >
                            {selectedFile ? (
                                <span style={{ fontWeight: 500, color: '#48bb78' }}>{selectedFile.name}</span>
                            ) : (
                                <>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        style={{ width: '32px', height: '32px', marginBottom: '0.5rem' }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span className="upload-text" style={{ fontSize: '0.85rem', fontWeight: 600 }}>UPLOAD</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{}}>
                    <button
                        type="submit"
                        disabled={submitting || !selectedFile}
                        style={{
                            padding: "0.75rem 1.5rem",
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: (submitting || !selectedFile) ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s',
                            height: '46px',
                            opacity: (submitting || !selectedFile) ? 0.7 : 1
                        }}
                    >
                        {submitting ? 'Uploading...' : 'Upload & Analyze'}
                    </button>
                </div>
            </form>

            {loading && <p style={{ color: '#718096', textAlign: 'center' }}>Loading logs...</p>}
            {error && <p style={{ color: "#e53e3e", background: '#fff5f5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</p>}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                    <thead>
                        <tr style={{ background: '#f7fafc' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', borderTopLeftRadius: '8px' }}>ID</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Image</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Model Output</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', borderTopRightRadius: '8px' }}>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log, index) => (
                            <tr key={log.id} style={{ transition: 'background 0.1s' }}>
                                <td style={{ padding: '1rem', borderBottom: index === logs.length - 1 ? 'none' : '1px solid #e2e8f0', color: '#718096', fontFamily: 'monospace', fontSize: '0.85rem' }}>{log.id.substring(0, 8)}...</td>
                                <td style={{ padding: '1rem', borderBottom: index === logs.length - 1 ? 'none' : '1px solid #e2e8f0' }}>
                                    <a
                                        href={getFullImageUrl(log.imageUrl)}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ color: '#667eea', fontWeight: 500, textDecoration: 'none' }}
                                    >
                                        View Image
                                    </a>
                                </td>
                                <td style={{ padding: '1rem', borderBottom: index === logs.length - 1 ? 'none' : '1px solid #e2e8f0' }}>
                                    <code style={{
                                        background: '#edf2f7',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        color: '#2d3748',
                                        display: 'block',
                                        maxWidth: '300px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {log.modelOutputJson}
                                    </code>
                                </td>
                                <td style={{ padding: '1rem', borderBottom: index === logs.length - 1 ? 'none' : '1px solid #e2e8f0', color: '#718096', fontSize: '0.9rem' }}>
                                    {new Date(log.createdAt).toLocaleDateString()} <span style={{ color: '#cbd5e0' }}>•</span> {new Date(log.createdAt).toLocaleTimeString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
