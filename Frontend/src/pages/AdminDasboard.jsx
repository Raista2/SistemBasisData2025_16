import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PeminjamanService from '../services/PeminjamanService';
import ApprovalLogService from '../services/ApprovalLogService';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('pending');
    const [reservations, setReservations] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [logLoading, setLogLoading] = useState(false);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showLogModal, setShowLogModal] = useState(false);

    useEffect(() => {
        // Redirect if not admin
        if (user && user.role !== 'admin') {
            navigate('/');
            return;
        }

        if (!user) {
            navigate('/login', { state: { from: '/admin/dashboard' } });
            return;
        }

        fetchReservations(activeTab);
    }, [user, navigate, activeTab]);

    const fetchReservations = async (status) => {
        try {
            setLoading(true);
            let data;

            if (status === 'all') {
                data = await PeminjamanService.getAllPeminjaman();
            } else {
                data = await PeminjamanService.getPeminjamanByStatus(status);
            }

            setReservations(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching reservations:', err);
            setError('Gagal memuat data reservasi. Silakan coba lagi nanti.');
        } finally {
            setLoading(false);
        }
    };

    const fetchApprovalLogs = async (reservationId) => {
        try {
            setLogLoading(true);
            const logsData = await ApprovalLogService.getApprovalLogsByPeminjaman(reservationId);
            setLogs(logsData);
            setShowLogModal(true);
        } catch (error) {
            console.error('Error fetching approval logs:', error);
            alert('Gagal memuat riwayat persetujuan');
        } finally {
            setLogLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            setActionLoading(id);
            
            const notes = action === 'approved' 
                ? 'Reservasi disetujui oleh admin' 
                : 'Reservasi ditolak oleh admin';
                
            await PeminjamanService.updatePeminjamanStatus(id, action, notes);
            
            // Refresh data
            await fetchReservations(activeTab);
        } catch (err) {
            console.error(`Error updating reservation status to ${action}:`, err);
            alert(`Gagal ${action === 'approved' ? 'menyetujui' : 'menolak'} reservasi. Silakan coba lagi.`);
        } finally {
            setActionLoading(null);
        }
    };

    const showReservationDetails = (reservation) => {
        setSelectedReservation(reservation);
        setShowDetailModal(true);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(date);
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'approved':
                return 'Disetujui';
            case 'rejected':
                return 'Ditolak';
            default:
                return 'Menunggu';
        }
    };

    if (loading && reservations.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-64px)] pt-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
        );
    }

    return (
        <div className="pt-16 container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className="text-3xl font-bold mb-4 md:mb-0">Dashboard Admin</h1>
                <div className="flex space-x-2">
                    <button 
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        onClick={() => navigate('/gedung')}
                    >
                        Kelola Gedung
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex flex-wrap -mb-px">
                    <button
                        className={`py-4 px-6 font-medium text-sm ${
                            activeTab === 'pending'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Menunggu Persetujuan
                    </button>
                    <button
                        className={`py-4 px-6 font-medium text-sm ${
                            activeTab === 'approved'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('approved')}
                    >
                        Disetujui
                    </button>
                    <button
                        className={`py-4 px-6 font-medium text-sm ${
                            activeTab === 'rejected'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('rejected')}
                    >
                        Ditolak
                    </button>
                    <button
                        className={`py-4 px-6 font-medium text-sm ${
                            activeTab === 'all'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('all')}
                    >
                        Semua Reservasi
                    </button>
                </nav>
            </div>

            {/* Reservations Table */}
            {reservations.length === 0 ? (
                <div className="bg-gray-100 p-8 rounded-lg text-center text-black">
                    <p className="text-gray-600">
                        Tidak ada data reservasi {activeTab !== 'all' ? `dengan status "${activeTab}"` : ''}.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200 text-black">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pemohon
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ruangan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tanggal & Waktu
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reservations.map((reservation) => (
                                <tr key={reservation.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {reservation.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {reservation.userName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {reservation.roomName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div>{formatDate(reservation.date)}</div>
                                        <div className="text-gray-500">
                                            {reservation.startTime} - {reservation.endTime}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(reservation.status)}`}>
                                            {getStatusText(reservation.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => showReservationDetails(reservation)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Detail
                                            </button>
                                            <button
                                                onClick={() => fetchApprovalLogs(reservation.id)}
                                                className="text-purple-600 hover:text-purple-900"
                                            >
                                                Log
                                            </button>
                                            {reservation.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleAction(reservation.id, 'approved')}
                                                        disabled={actionLoading === reservation.id}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        {actionLoading === reservation.id ? '...' : 'Setujui'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(reservation.id, 'rejected')}
                                                        disabled={actionLoading === reservation.id}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        {actionLoading === reservation.id ? '...' : 'Tolak'}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Reservation Detail Modal */}
            {showDetailModal && selectedReservation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden">
                        <div className="px-6 py-4 bg-blue-600 text-white flex justify-between items-center">
                            <h3 className="text-lg font-bold">Detail Reservasi</h3>
                            <button onClick={() => setShowDetailModal(false)} className="focus:outline-none">
                                &times;
                            </button>
                        </div>
                        <div className="p-6 max-h-[70vh] overflow-y-auto text-black">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-sm text-gray-500">ID Reservasi</p>
                                    <p className="font-medium">{selectedReservation.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(selectedReservation.status)}`}>
                                        {getStatusText(selectedReservation.status)}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Nama Pemohon</p>
                                    <p className="font-medium">{selectedReservation.userName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email Pemohon</p>
                                    <p className="font-medium">{selectedReservation.userEmail || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Gedung</p>
                                    <p className="font-medium">{selectedReservation.buildingName || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Ruangan</p>
                                    <p className="font-medium">{selectedReservation.roomName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tanggal</p>
                                    <p className="font-medium">{formatDate(selectedReservation.date)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Waktu</p>
                                    <p className="font-medium">{selectedReservation.startTime} - {selectedReservation.endTime}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Jumlah Peserta</p>
                                    <p className="font-medium">{selectedReservation.attendees} orang</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tanggal Pengajuan</p>
                                    <p className="font-medium">
                                        {selectedReservation.createdAt ? formatDate(selectedReservation.createdAt) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <p className="text-sm text-gray-500">Keperluan</p>
                                <p className="font-medium">{selectedReservation.purpose}</p>
                            </div>
                            
                            {selectedReservation.notes && (
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500">Catatan</p>
                                    <p className="font-medium">{selectedReservation.notes}</p>
                                </div>
                            )}

                            {selectedReservation.status === 'pending' && (
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleAction(selectedReservation.id, 'rejected');
                                        }}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                        disabled={actionLoading === selectedReservation.id}
                                    >
                                        {actionLoading === selectedReservation.id ? 'Memproses...' : 'Tolak'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleAction(selectedReservation.id, 'approved');
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        disabled={actionLoading === selectedReservation.id}
                                    >
                                        {actionLoading === selectedReservation.id ? 'Memproses...' : 'Setujui'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Approval Log Modal */}
            {showLogModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden">
                        <div className="px-6 py-4 bg-purple-600 text-white flex justify-between items-center">
                            <h3 className="text-lg font-bold">Riwayat Persetujuan</h3>
                            <button onClick={() => setShowLogModal(false)} className="focus:outline-none">
                                &times;
                            </button>
                        </div>
                        <div className="p-6 max-h-[70vh] overflow-y-auto text-black">
                            {logLoading ? (
                                <div className="flex justify-center py-6">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                                </div>
                            ) : logs.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">Belum ada riwayat persetujuan</p>
                            ) : (
                                <div className="space-y-4">
                                    {logs.map((log) => (
                                        <div key={log.id} className="border-l-4 border-purple-600 pl-4 py-2">
                                            <div className="flex justify-between">
                                                <span className="font-medium">{log.adminName}</span>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(log.timestamp).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <div className="mt-1">
                                                <span className="text-sm">
                                                    Status diubah dari <span className={`${getStatusBadgeClass(log.previousStatus)} px-1 rounded`}>{getStatusText(log.previousStatus)}</span> menjadi <span className={`${getStatusBadgeClass(log.newStatus)} px-1 rounded`}>{getStatusText(log.newStatus)}</span>
                                                </span>
                                            </div>
                                            {log.notes && (
                                                <div className="mt-1 text-sm text-gray-600">
                                                    Catatan: {log.notes}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;