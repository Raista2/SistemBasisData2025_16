import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Approval = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        // Redirect if not admin
        // if (user && user.role !== 'admin') {
        //     navigate('/');
        //     return;
        // }

        // if (!user) {
        //     navigate('/login', { state: { from: '/approval' } });
        //     return;
        // }

        // Mock function to simulate API call
        const fetchReservationsMock = () => {
            // Mock reservation data
            const mockReservations = [
                {
                    id: 1,
                    userId: 101,
                    userName: "Jane Doe",
                    roomId: 201,
                    roomName: "Ruangan K101",
                    date: "2025-05-20",
                    startTime: "09:00",
                    endTime: "11:00",
                    purpose: "Rapat Departemen",
                    attendees: 15,
                    status: "pending"
                },
                {
                    id: 2,
                    userId: 102,
                    userName: "Miyabi Hoshinomi",
                    roomId: 202,
                    roomName: "Ruangan S202",
                    date: "2025-05-21",
                    startTime: "13:00",
                    endTime: "15:00",
                    purpose: "Workshop Coding",
                    attendees: 25,
                    status: "approved"
                },
                {
                    id: 3,
                    userId: 103,
                    userName: "Ellen",
                    roomId: 203,
                    roomName: "Ruangan GK201",
                    date: "2025-05-22",
                    startTime: "10:00",
                    endTime: "12:00",
                    purpose: "Presentasi Skripsi",
                    attendees: 8,
                    status: "rejected"
                }
            ];

            // Filter based on status
            let filteredReservations = mockReservations;
            if (filter !== 'all') {
                filteredReservations = mockReservations.filter(res => res.status === filter);
            }

            // Simulate API delay
            setTimeout(() => {
                setReservations(filteredReservations);
                setLoading(false);
            }, 700);
        };

        fetchReservationsMock();
    }, [user, navigate, filter]);

    const handleAction = async (id, action) => {
        setActionLoading(id);
        
        // Mock API call
        setTimeout(() => {
            setReservations(reservations.map(res => 
                res.id === id ? { ...res, status: action } : res
            ));
            setActionLoading(null);
        }, 700);
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
            <div className="flex justify-center items-center min-h-[calc(100vh-64px)] pt-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
        );
    }

    return (
        <div className="pt-16 container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Persetujuan Reservasi</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    className={`px-4 py-2 rounded-md ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setFilter('pending')}
                >
                    Menunggu
                </button>
                <button
                    className={`px-4 py-2 rounded-md ${filter === 'approved' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setFilter('approved')}
                >
                    Disetujui
                </button>
                <button
                    className={`px-4 py-2 rounded-md ${filter === 'rejected' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setFilter('rejected')}
                >
                    Ditolak
                </button>
                <button
                    className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setFilter('all')}
                >
                    Semua
                </button>
            </div>

            {reservations.length === 0 ? (
                <div className="bg-gray-100 p-8 rounded-lg text-center">
                    <p className="text-gray-600">Tidak ada data reservasi {filter !== 'all' ? `dengan status "${filter}"` : ''}.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden text-black">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 text-left">ID</th>
                                <th className="py-3 px-4 text-left">Nama</th>
                                <th className="py-3 px-4 text-left">Ruangan</th>
                                <th className="py-3 px-4 text-left">Tanggal</th>
                                <th className="py-3 px-4 text-left">Waktu</th>
                                <th className="py-3 px-4 text-left">Keperluan</th>
                                <th className="py-3 px-4 text-left">Jumlah</th>
                                <th className="py-3 px-4 text-left">Status</th>
                                <th className="py-3 px-4 text-left">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map((reservation) => (
                                <tr key={reservation.id} className="border-t hover:bg-gray-50">
                                    <td className="py-3 px-4">{reservation.id}</td>
                                    <td className="py-3 px-4">{reservation.userName}</td>
                                    <td className="py-3 px-4">{reservation.roomName}</td>
                                    <td className="py-3 px-4">{formatDate(reservation.date)}</td>
                                    <td className="py-3 px-4">{`${reservation.startTime} - ${reservation.endTime}`}</td>
                                    <td className="py-3 px-4">{reservation.purpose}</td>
                                    <td className="py-3 px-4">{reservation.attendees}</td>
                                    <td className="py-3 px-4">
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
                                        {reservation.status === 'pending' && (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleAction(reservation.id, 'approved')}
                                                    disabled={actionLoading === reservation.id}
                                                    className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 transition-colors"
                                                >
                                                    {actionLoading === reservation.id ? '...' : 'Setujui'}
                                                </button>
                                                <button
                                                    onClick={() => handleAction(reservation.id, 'rejected')}
                                                    disabled={actionLoading === reservation.id}
                                                    className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 transition-colors"
                                                >
                                                    {actionLoading === reservation.id ? '...' : 'Tolak'}
                                                </button>
                                            </div>
                                        )}
                                        {(reservation.status === 'approved' || reservation.status === 'rejected') && (
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