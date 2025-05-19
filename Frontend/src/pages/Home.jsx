import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GedungService from '../services/GedungService';
import PeminjamanService from '../services/PeminjamanService';

const HomePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [stats, setStats] = useState({
        totalBuildings: 0,
        totalRooms: 0,
        totalReservations: 0,
        pendingReservations: 0
    });
    const [recentReservations, setRecentReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch buildings to get total count
                const buildings = await GedungService.getAllGedung();
                
                // Get statistics
                let totalReservations = 0;
                let pendingReservations = 0;
                let recentReservationsList = [];
                
                // Fetch reservations data if user is logged in
                if (user) {
                    if (user.role === 'admin') {
                        // Admin sees all recent reservations
                        const allReservations = await PeminjamanService.getAllPeminjaman();
                        totalReservations = allReservations.length;
                        pendingReservations = allReservations.filter(r => r.status === 'pending').length;
                        recentReservationsList = allReservations.slice(0, 5);
                    } else {
                        // Regular users see only their reservations
                        const userReservations = await PeminjamanService.getPeminjamanByUser(user.id);
                        totalReservations = userReservations.length;
                        pendingReservations = userReservations.filter(r => r.status === 'pending').length;
                        recentReservationsList = userReservations.slice(0, 5);
                    }
                }
                
                // Calculate total rooms from all buildings
                const totalRooms = buildings.reduce((sum, building) => sum + (building.roomCount || 0), 0);
                
                setStats({
                    totalBuildings: buildings.length,
                    totalRooms: totalRooms,
                    totalReservations,
                    pendingReservations
                });
                
                setRecentReservations(recentReservationsList);
                setError(null);
            } catch (err) {
                console.error('Error fetching homepage data:', err);
                setError('Terjadi kesalahan saat memuat data. Silakan coba lagi nanti.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [user]);

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
        <div className="pt-16 min-h-screen bg-gray-900">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Pinjam Ruang FT V2</h1>
                        <p className="text-xl mb-8">Sistem peminjaman ruangan Fakultas Teknik yang lebih efisien, cepat, dan mudah digunakan</p>
                        {!user ? (
                            <div className="space-x-4">
                                <Link to="/login" className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition-colors">
                                    Register
                                </Link>
                            </div>
                        ) : (
                            <div className="space-x-4">
                                <Link to="/reservation" className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                                    Buat Reservasi
                                </Link>
                                <Link to="/my-reservations" className="text-white bg-transparent border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition-colors">
                                    Lihat Reservasi Saya
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}
                
                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <span className="text-3xl font-bold text-blue-600">{stats.totalBuildings}</span>
                        <p className="text-gray-600 mt-2">Total Gedung</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <span className="text-3xl font-bold text-blue-600">{stats.totalRooms}</span>
                        <p className="text-gray-600 mt-2">Total Ruangan</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <span className="text-3xl font-bold text-blue-600">{stats.totalReservations}</span>
                        <p className="text-gray-600 mt-2">Total Reservasi</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <span className="text-3xl font-bold text-blue-600">{stats.pendingReservations}</span>
                        <p className="text-gray-600 mt-2">Menunggu Persetujuan</p>
                    </div>
                </div>

                {/* Features */}
                <h2 className="text-3xl font-bold text-center mb-10">Fitur Utama</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white rounded-lg shadow-md p-6 text-black">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Reservasi Ruangan</h3>
                        <p className="text-gray-600 mb-4">Pesan ruangan untuk kegiatan akademik, rapat, atau acara lainnya dengan mudah dan cepat.</p>
                        <Link to="/reservation" className="text-blue-600 hover:text-blue-800 font-medium">
                            Buat Reservasi →
                        </Link>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6 text-black">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Peta Gedung</h3>
                        <p className="text-gray-600 mb-4">Lihat lokasi gedung di peta interaktif untuk memudahkan pencarian ruangan yang diinginkan.</p>
                        <Link to="/map" className="text-blue-600 hover:text-blue-800 font-medium">
                            Lihat Peta →
                        </Link>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6 text-black">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Status Reservasi</h3>
                        <p className="text-gray-600 mb-4">Pantau status reservasi Anda, lihat riwayat, dan dapatkan notifikasi ketika disetujui.</p>
                        <Link to="/my-reservations" className="text-blue-600 hover:text-blue-800 font-medium">
                            Lihat Status →
                        </Link>
                    </div>
                </div>

                {/* Recent Reservations */}
                {user && recentReservations.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6">Reservasi Terbaru</h2>
                        
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-black">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="py-3 px-4 text-left">Ruangan</th>
                                            <th className="py-3 px-4 text-left">Tanggal</th>
                                            <th className="py-3 px-4 text-left">Waktu</th>
                                            <th className="py-3 px-4 text-left">Status</th>
                                            <th className="py-3 px-4 text-left">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentReservations.map(reservation => (
                                            <tr key={reservation.id} className="border-t hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="font-medium">{reservation.roomName}</div>
                                                    <div className="text-sm text-gray-500">{reservation.buildingName}</div>
                                                </td>
                                                <td className="py-3 px-4">{formatDate(reservation.date)}</td>
                                                <td className="py-3 px-4">{reservation.startTime} - {reservation.endTime}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        reservation.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        reservation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        reservation.status === 'canceled' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {reservation.status === 'approved' ? 'Disetujui' :
                                                         reservation.status === 'rejected' ? 'Ditolak' :
                                                         reservation.status === 'canceled' ? 'Dibatalkan' :
                                                         'Menunggu'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button 
                                                        onClick={() => navigate(`/my-reservations`)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* How It Works */}
                <h2 className="text-3xl font-bold text-center mb-10">Cara Kerja</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                    <div className="bg-white rounded-lg shadow-md p-6 text-black relative">
                        <div className="absolute -top-4 -right-4 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">
                            1
                        </div>
                        <h3 className="text-xl font-bold mb-2">Pilih Gedung & Ruangan</h3>
                        <p className="text-gray-600">Pilih gedung dan ruangan yang sesuai dengan kebutuhan Anda dari daftar yang tersedia.</p>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6 text-black relative">
                        <div className="absolute -top-4 -right-4 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">
                            2
                        </div>
                        <h3 className="text-xl font-bold mb-2">Isi Form Reservasi</h3>
                        <p className="text-gray-600">Isi form reservasi dengan tanggal, waktu, jumlah peserta, dan keperluan peminjaman.</p>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6 text-black relative">
                        <div className="absolute -top-4 -right-4 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">
                            3
                        </div>
                        <h3 className="text-xl font-bold mb-2">Tunggu Persetujuan</h3>
                        <p className="text-gray-600">Admin akan memeriksa dan menyetujui reservasi Anda dalam waktu singkat.</p>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6 text-black relative">
                        <div className="absolute -top-4 -right-4 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">
                            4
                        </div>
                        <h3 className="text-xl font-bold mb-2">Gunakan Ruangan</h3>
                        <p className="text-gray-600">Setelah disetujui, Anda dapat menggunakan ruangan sesuai dengan jadwal yang telah dipesan.</p>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="bg-blue-600 text-white rounded-lg p-8 text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Siap untuk membuat reservasi?</h2>
                    <p className="text-xl mb-6">Mulai pesan ruangan sekarang dan manfaatkan fasilitas kampus dengan optimal</p>
                    <Link 
                        to={user ? "/reservation" : "/login"} 
                        className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
                    >
                        {user ? "Buat Reservasi Sekarang" : "Login untuk Mulai"}
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <h3 className="text-xl font-bold">Pinjam Ruang FT V2</h3>
                            <p className="text-gray-400">Sistem Reservasi Ruangan Fakultas Teknik</p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                            <Link to="/map" className="hover:text-blue-300">Peta Gedung</Link>
                            <Link to="/gedung" className="hover:text-blue-300">Daftar Gedung</Link>
                            <Link to="/reservation" className="hover:text-blue-300">Reservasi</Link>
                            {user && <Link to="/my-reservations" className="hover:text-blue-300">Reservasiku</Link>}
                            {!user && (
                                <>
                                    <Link to="/login" className="hover:text-blue-300">Login</Link>
                                    <Link to="/register" className="hover:text-blue-300">Register</Link>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="border-t border-gray-700 mt-6 pt-6 text-center">
                        <p>&copy; {new Date().getFullYear()} Pinjam Ruang FT V2. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;