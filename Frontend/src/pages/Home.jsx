import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GedungService from '../services/GedungService';
import PeminjamanService from '../services/PeminjamanService';
import RuanganService from '../services/RuanganService';

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
                
                // Fetch buildings and rooms in parallel for efficiency
                const [buildings, allRooms] = await Promise.all([
                    GedungService.getAllGedung(),
                    RuanganService.getAllRuangan()
                ]);
                
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
                
                // Total rooms = length of all rooms array
                const totalRooms = allRooms.length;
                
                // Set statistics
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
            <div className="flex justify-center items-center min-h-[calc(100vh-64px)] pt-16 bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
            </div>
        );
    }

    return (
        <div className="pt-16 min-h-screen bg-gray-900">
            {/* Hero Section */}
            <div 
                className="bg-primary-blue py-16 px-4 relative"
                style={{
                    backgroundImage: "url('/images/ftui-background.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundBlendMode: "overlay"
                }}
            >
                <div className="absolute inset-0 bg-primary-blue opacity-80"></div>
                <div className="container mx-auto relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Pinjam Ruang FT V2</h1>
                        <p className="text-xl mb-8 text-white">Sistem peminjaman ruangan Fakultas Teknik yang lebih efisien, cepat, dan mudah digunakan</p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link to="/reservation" className="bg-white text-primary-blue px-6 py-3 rounded font-medium hover:bg-gray-100 transition-colors">
                                Buat Reservasi
                            </Link>
                            <Link to="/my-reservations" className="bg-transparent border border-white text-white px-6 py-3 rounded font-medium hover:bg-white hover:text-primary-blue transition-colors">
                                Lihat Reservasi Saya
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Section */}
            <div className="container mx-auto px-4 py-12">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded p-6 text-center">
                        <span className="text-3xl font-bold text-primary-blue">{stats.totalBuildings}</span>
                        <p className="text-gray-600 mt-2">Total Gedung</p>
                    </div>
                    <div className="bg-white rounded p-6 text-center">
                        <span className="text-3xl font-bold text-primary-blue">{stats.totalRooms}</span>
                        <p className="text-gray-600 mt-2">Total Ruangan</p>
                    </div>
                    <div className="bg-white rounded p-6 text-center">
                        <span className="text-3xl font-bold text-primary-blue">{stats.totalReservations}</span>
                        <p className="text-gray-600 mt-2">Total Reservasi</p>
                    </div>
                    <div className="bg-white rounded p-6 text-center">
                        <span className="text-3xl font-bold text-primary-blue">{stats.pendingReservations}</span>
                        <p className="text-gray-600 mt-2">Menunggu Persetujuan</p>
                    </div>
                </div>

                {/* Features Section */}
                <h2 className="text-3xl font-bold text-center text-white mt-16 mb-8">Fitur Utama</h2>
                
                {/* Add your Features content here */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Feature 1 */}
                    <div className="bg-white rounded p-6">
                        <div className="bg-primary-blue text-white rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-center">Reservasi Ruangan</h3>
                        <p className="text-gray-600 mb-4 text-center">Pesan ruangan untuk kegiatan akademik, rapat, atau acara lainnya dengan mudah dan cepat.</p>
                        <div className="text-center">
                            <Link to="/reservation" className="text-primary-blue hover:bg-primary-blue hover:text-white px-3 py-1 rounded transition-colors">
                                Buat Reservasi →
                            </Link>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white rounded p-6">
                        <div className="bg-primary-blue text-white rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-center">Peta Gedung</h3>
                        <p className="text-gray-600 mb-4 text-center">Lihat lokasi gedung di peta interaktif untuk memudahkan pencarian ruangan yang diinginkan.</p>
                        <div className="text-center">
                            <Link to="/map" className="text-primary-blue hover:bg-primary-blue hover:text-white px-3 py-1 rounded transition-colors">
                                Lihat Peta →
                            </Link>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white rounded p-6">
                        <div className="bg-primary-blue text-white rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-center">Status Reservasi</h3>
                        <p className="text-gray-600 mb-4 text-center">Pantau status reservasi Anda, lihat riwayat, dan dapatkan notifikasi ketika disetujui.</p>
                        <div className="text-center">
                            <Link to="/my-reservations" className="text-primary-blue hover:bg-primary-blue hover:text-white px-3 py-1 rounded transition-colors">
                                Lihat Status →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;