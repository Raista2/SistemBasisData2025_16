import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PeminjamanService from '../services/PeminjamanService';

const MyReservations = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(null);

    useEffect(() => {
        // Redirect if not logged in
        if (!user) {
            navigate('/login', { state: { from: '/my-reservations' } });
            return;
        }

        fetchReservations();
    }, [user, navigate, activeTab]);

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const data = await PeminjamanService.getPeminjamanByUser(user.id);
            
            // Filter based on active tab
            const filteredData = activeTab === 'all' 
                ? data 
                : data.filter(reservation => reservation.status === activeTab);
            
            setReservations(filteredData);
            setError(null);
        } catch (err) {
            console.error('Error fetching reservations:', err);
            setError('Gagal memuat daftar reservasi. Silakan coba lagi nanti.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelReservation = async (id) => {
        if (!confirm('Apakah Anda yakin ingin membatalkan reservasi ini?')) {
            return;
        }

        try {
            setCancelLoading(id);
            await PeminjamanService.updatePeminjamanStatus(id, 'canceled', 'Dibatalkan oleh pengguna');
            
            // Close modal if open
            if (showDetailModal) {
                setShowDetailModal(false);
            }
            
            // Refresh data
            await fetchReservations();
        } catch (err) {
            console.error('Error canceling reservation:', err);
            alert('Gagal membatalkan reservasi. Silakan coba lagi.');
        } finally {
            setCancelLoading(null);
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
            case 'canceled':
                return 'bg-gray-100 text-gray-800';
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
            case 'canceled':
                return 'Dibatalkan';
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
            <h1 className="text-3xl font-bold mb-6">Reservasiku</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    className={`px-4 py-2 rounded-md ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setActiveTab('all')}
                >
                    Semua
                </button>
                <button
                    className={`px-4 py-2 rounded-md ${activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Menunggu
                </button>
                <button
                    className={`px-4 py-2 rounded-md ${activeTab === 'approved' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setActiveTab('approved')}
                >
                    Disetujui
                </button>
                <button
                    className={`px-4 py-2 rounded-md ${activeTab === 'rejected' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setActiveTab('rejected')}
                >
                    Ditolak
                </button>
                <button
                    className={`px-4 py-2 rounded-md ${activeTab === 'canceled' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setActiveTab('canceled')}
                >
                    Dibatalkan
                </button>
            </div>

            {reservations.length === 0 ? (
                <div className="bg-gray-100 p-8 rounded-lg text-center text-black">
                    <p className="text-gray-600">
                        Tidak ada reservasi {activeTab !== 'all' ? `dengan status "${getStatusText(activeTab)}"` : ''}.
                    </p>
                    <Link 
                        to="/gedung"
                        className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Buat Reservasi Baru
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reservations.map((reservation) => (
                        <div key={reservation.id} className="bg-white rounded-lg shadow-md overflow-hidden text-black">
                            <div className="p-4 border-b">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold">{reservation.roomName}</h3>
                                        <p className="text-gray-600">{reservation.buildingName}</p>
                                    </div>
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(reservation.status)}`}>
                                        {getStatusText(reservation.status)}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="mb-3">
                                    <p className="text-sm text-gray-500">Tanggal</p>
                                    <p className="font-medium">{formatDate(reservation.date)}</p>
                                </div>
                                <div className="mb-3">
                                    <p className="text-sm text-gray-500">Waktu</p>
                                    <p className="font-medium">{reservation.startTime} - {reservation.endTime}</p>
                                </div>
                                <div className="mb-3">
                                    <p className="text-sm text-gray-500">Keperluan</p>
                                    <p className="font-medium truncate">{reservation.purpose}</p>
                                </div>
                                <div className="mt-4 flex justify-between">
                                    <button
                                        onClick={() => showReservationDetails(reservation)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        Lihat Detail
                                    </button>
                                    {reservation.status === 'pending' && (
                                        <button
                                            onClick={() => handleCancelReservation(reservation.id)}
                                            disabled={cancelLoading === reservation.id}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            {cancelLoading === reservation.id ? 'Membatalkan...' : 'Batalkan'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
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
                                <div className="flex justify-end mt-6">
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleCancelReservation(selectedReservation.id);
                                        }}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                        disabled={cancelLoading === selectedReservation.id}
                                    >
                                        {cancelLoading === selectedReservation.id ? 'Membatalkan...' : 'Batalkan Reservasi'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyReservations;