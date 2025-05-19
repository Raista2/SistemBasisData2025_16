import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Approval = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('pending');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        // Redirect if not admin
        if (user && user.role !== 'admin') {
        navigate('/');
        return;
        }

        if (!user) {
        navigate('/login', { state: { from: '/approval' } });
        return;
        }

        const fetchReservations = async () => {
        try {
            let endpoint = '/peminjaman';
            if (filter !== 'all') {
            endpoint = `/peminjaman/status/${filter}`;
            }

            const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.data.success) {
            setReservations(response.data.payload);
            } else {
            setError(response.data.message);
            }
        } catch (error) {
            setError('Failed to fetch reservations');
            console.error('Error fetching reservations:', error);
        } finally {
            setLoading(false);
        }
        };

        fetchReservations();
    }, [user, navigate, filter]);

    const handleAction = async (id, action) => {
        setActionLoading(id);
        
        try {
        const response = await axios.put(`/peminjaman/${id}/status`, {
            status: action,
            catatan: `Status updated to ${action} by admin`
        }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.data.success) {
            // Update local state to reflect changes
            setReservations(reservations.map(res => 
            res.id === id ? { ...res, status: action } : res
            ));
        } else {
            setError(response.data.message);
        }
        } catch (error) {
        setError('Failed to update reservation status');
        console.error('Error updating reservation status:', error);
        } finally {
        setActionLoading(null);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(date);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-64px)] pt-16 bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
            </div>
        );
    }

    return (
        <div className="pt-16 container mx-auto px-4 py-8 bg-white text-gray-800">
            <h1 className="text-3xl font-bold mb-6 text-primary-blue text-center">Persetujuan Reservasi</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {/* Filter Controls */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
                <button
                    className={`px-6 py-2 rounded transition-colors ${
                        filter === 'pending'
                            ? 'bg-primary-blue text-white'
                            : 'text-primary-blue hover:bg-primary-blue hover:text-white'
                    }`}
                    onClick={() => setFilter('pending')}
                >
                    Menunggu
                </button>
                <button
                    className={`px-6 py-2 rounded transition-colors ${
                        filter === 'approved'
                            ? 'bg-primary-blue text-white'
                            : 'text-primary-blue hover:bg-primary-blue hover:text-white'
                    }`}
                    onClick={() => setFilter('approved')}
                >
                    Disetujui
                </button>
                <button
                    className={`px-6 py-2 rounded transition-colors ${
                        filter === 'rejected'
                            ? 'bg-primary-blue text-white'
                            : 'text-primary-blue hover:bg-primary-blue hover:text-white'
                    }`}
                    onClick={() => setFilter('rejected')}
                >
                    Ditolak
                </button>
                <button
                    className={`px-6 py-2 rounded transition-colors ${
                        filter === 'all'
                            ? 'bg-primary-blue text-white'
                            : 'text-primary-blue hover:bg-primary-blue hover:text-white'
                    }`}
                    onClick={() => setFilter('all')}
                >
                    Semua
                </button>
            </div>

            {reservations.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                    <p className="text-gray-600">Tidak ada data reservasi {filter !== 'all' ? `dengan status "${filter}"` : ''}.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruangan</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keperluan</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {reservations.map((reservation) => (
                                <tr key={reservation.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 text-sm">{reservation.id}</td>
                                    <td className="py-3 px-4 text-sm">{reservation.userName}</td>
                                    <td className="py-3 px-4 text-sm">{reservation.roomName}</td>
                                    <td className="py-3 px-4 text-sm">{formatDate(reservation.date)}</td>
                                    <td className="py-3 px-4 text-sm">{`${reservation.startTime} - ${reservation.endTime}`}</td>
                                    <td className="py-3 px-4 text-sm">{reservation.purpose}</td>
                                    <td className="py-3 px-4 text-sm">{reservation.attendees}</td>
                                    <td className="py-3 px-4 text-sm">
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                            reservation.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            reservation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {reservation.status === 'approved' ? 'Disetujui' :
                                                reservation.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        {reservation.status === 'pending' ? (
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => handleAction(reservation.id, 'approved')}
                                                    disabled={actionLoading === reservation.id}
                                                    className="text-green-600 hover:bg-green-600 hover:text-white py-1 px-3 rounded transition-colors"
                                                >
                                                    {actionLoading === reservation.id ? '...' : 'Setujui'}
                                                </button>
                                                <button
                                                    onClick={() => handleAction(reservation.id, 'rejected')}
                                                    disabled={actionLoading === reservation.id}
                                                    className="text-red-600 hover:bg-red-600 hover:text-white py-1 px-3 rounded transition-colors"
                                                >
                                                    {actionLoading === reservation.id ? '...' : 'Tolak'}
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500 text-sm">Selesai</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Approval;