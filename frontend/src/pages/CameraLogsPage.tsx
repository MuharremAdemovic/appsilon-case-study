import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react'
import { type CameraLog, getCameraLogs, uploadCameraLog, deleteCameraLog, analyzeCameraLog } from '../services/api'

// Helper to resolve image URL if relative
const API_BASE_URL = "http://localhost:5185";

export default function CameraLogsPage() {
    const [logs, setLogs] = useState<CameraLog[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploadStep, setUploadStep] = useState<'IDLE' | 'UPLOADING' | 'UPLOADED' | 'ANALYZING' | 'SUCCESS' | 'ERROR'>('IDLE')
    const [uploadMessage, setUploadMessage] = useState<string>("")

    const [selectedLog, setSelectedLog] = useState<CameraLog | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this log?")) return;

        try {
            await deleteCameraLog(id);
            setLogs(prev => prev.filter(l => l.id !== id));
        } catch (err: any) {
            console.error(err);
            setError(err.message ?? "Error deleting log");
        }
    }

    function openDetailsModal(log: CameraLog) {
        setSelectedLog(log);
        setIsDetailsModalOpen(true);
    }

    function closeDetailsModal() {
        setIsDetailsModalOpen(false);
        setSelectedLog(null);
    }

    function getFullImageUrl(url: string) {
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    }

    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            setUploadStep('IDLE');
            setUploadMessage("");
            setError(null);
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (!selectedFile) return

        try {
            setUploadStep('UPLOADING')
            setUploadMessage("Resim Yükleniyor...")
            setError(null)

            // 1. Upload
            const newLog = await uploadCameraLog(selectedFile)

            setUploadStep('UPLOADED')
            setUploadMessage("Resim Yüklendi. Analiz Başlıyor...")

            // Add to list immediately (pending state)
            setLogs(prev => [newLog, ...prev])

            // 2. Analyze
            setUploadStep('ANALYZING')
            setUploadMessage("Resim Analiz Ediliyor (YOLOv8)...")

            const analyzedLog = await analyzeCameraLog(newLog.id)

            // Update list with analyzed log
            setLogs(prev => prev.map(l => l.id === newLog.id ? analyzedLog : l))

            setUploadStep('SUCCESS')
            setUploadMessage("İşlem Başarılı! Analiz Tamamlandı.")

            setSelectedFile(null)
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = "";

            // Clear success message after 3 seconds
            setTimeout(() => {
                setUploadStep('IDLE');
                setUploadMessage("");
            }, 3000);

        } catch (err: any) {
            console.error(err)
            setUploadStep('ERROR')
            setUploadMessage("Hata oluştu: " + (err.message ?? "Bilinmeyen hata"))
            setError(err.message ?? "Error processing log")
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
            {/* Details Modal */}
            {isDetailsModalOpen && selectedLog && (
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
                }} onClick={closeDetailsModal}>
                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        width: '600px',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        position: 'relative'
                    }} onClick={e => e.stopPropagation()}>
                        <button
                            onClick={closeDetailsModal}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                color: '#718096'
                            }}
                        >
                            &times;
                        </button>
                        <h2 style={{ marginTop: 0, color: '#2d3748', marginBottom: '1rem' }}>Model Output Details</h2>
                        <div style={{ marginBottom: '1rem' }}>
                            <img
                                src={getFullImageUrl(selectedLog.imageUrl)}
                                alt="Log"
                                style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '1rem' }}
                            />
                        </div>
                        <pre style={{
                            background: '#f7fafc',
                            padding: '1rem',
                            borderRadius: '8px',
                            overflowX: 'auto',
                            fontSize: '0.9rem',
                            color: '#2d3748',
                            border: '1px solid #e2e8f0'
                        }}>
                            {(() => {
                                try {
                                    return JSON.stringify(JSON.parse(selectedLog.modelOutputJson), null, 2);
                                } catch (e) {
                                    return selectedLog.modelOutputJson;
                                }
                            })()}
                        </pre>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button
                                onClick={closeDetailsModal}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e0',
                                    background: 'white',
                                    cursor: 'pointer',
                                    color: '#4a5568'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                        disabled={uploadStep !== 'IDLE' && uploadStep !== 'ERROR' && uploadStep !== 'SUCCESS' || !selectedFile}
                        style={{
                            padding: "0.75rem 1.5rem",
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: (uploadStep !== 'IDLE' && uploadStep !== 'ERROR' && uploadStep !== 'SUCCESS' || !selectedFile) ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s',
                            height: '46px',
                            opacity: (uploadStep !== 'IDLE' && uploadStep !== 'ERROR' && uploadStep !== 'SUCCESS' || !selectedFile) ? 0.7 : 1
                        }}
                    >
                        {uploadStep === 'UPLOADING' ? 'Uploading...' :
                            uploadStep === 'ANALYZING' ? 'Analyzing...' :
                                'Upload & Analyze'}
                    </button>
                </div>
            </form>

            {/* Progress / Status Message */}
            {uploadStep !== 'IDLE' && (
                <div style={{
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    borderRadius: '8px',
                    background: uploadStep === 'SUCCESS' ? '#f0fff4' : uploadStep === 'ERROR' ? '#fff5f5' : '#ebf8ff',
                    border: `1px solid ${uploadStep === 'SUCCESS' ? '#c6f6d5' : uploadStep === 'ERROR' ? '#fed7d7' : '#bee3f8'}`,
                    color: uploadStep === 'SUCCESS' ? '#2f855a' : uploadStep === 'ERROR' ? '#c53030' : '#2b6cb0',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    {uploadStep === 'UPLOADING' && <span>📤</span>}
                    {uploadStep === 'UPLOADED' && <span>✅</span>}
                    {uploadStep === 'ANALYZING' && <span>🧠</span>}
                    {uploadStep === 'SUCCESS' && <span>🎉</span>}
                    {uploadStep === 'ERROR' && <span>❌</span>}
                    {uploadMessage}
                </div>
            )}

            {loading && <p style={{ color: '#718096', textAlign: 'center' }}>Loading logs...</p>}
            {error && <p style={{ color: "#e53e3e", background: '#fff5f5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</p>}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                    <thead>
                        <tr style={{ background: '#f7fafc' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', borderTopLeftRadius: '8px' }}>ID</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Image</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Model Output</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Created At</th>
                            <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', borderTopRightRadius: '8px' }}>Actions</th>
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
                                    <code
                                        title={log.modelOutputJson}
                                        style={{
                                            background: '#edf2f7',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            color: '#2d3748',
                                            display: 'block',
                                            maxWidth: '300px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            cursor: 'help'
                                        }}
                                    >
                                        {log.modelOutputJson}
                                    </code>
                                </td>
                                <td style={{ padding: '1rem', borderBottom: index === logs.length - 1 ? 'none' : '1px solid #e2e8f0', color: '#718096', fontSize: '0.9rem' }}>
                                    {new Date(log.createdAt).toLocaleDateString()} <span style={{ color: '#cbd5e0' }}>•</span> {new Date(log.createdAt).toLocaleTimeString()}
                                </td>
                                <td style={{ padding: '1rem', borderBottom: index === logs.length - 1 ? 'none' : '1px solid #e2e8f0', textAlign: 'right' }}>
                                    <button
                                        onClick={() => openDetailsModal(log)}
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
                                        Details
                                    </button>
                                    <button
                                        onClick={() => handleDelete(log.id)}
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
    )
}
